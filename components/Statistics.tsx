import i18n from '@/constants/localization';
import { storageService } from '@/constants/storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type Period = 'day' | 'week' | 'month' | 'year';

export default function StatisticsScreen() {
  const [period, setPeriod] = useState<Period>('day');
  const [stats, setStats] = useState<{ [key: string]: number }>({});
  const [monthOffset, setMonthOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-load when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      loadStatistics();
    }, [period, monthOffset])
  );

  const loadStatistics = async () => {
    setRefreshing(true);
    const data = await storageService.getStatisticsForPeriod(period, period === 'month' ? monthOffset : 0);
    setStats(data);
    setRefreshing(false);
  };

  const generateCSV = async () => {
    try {
      const logs = await storageService.getLogs();
      
      // CSV header
      let csv = 'Beverage,Date,Time,Timestamp\n';
      
      // Add each log as a row
      logs.forEach((log) => {
        const date = new Date(log.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        
        // Escape beverage name in case it contains commas or quotes
        const beverage = `"${log.beverage.replace(/"/g, '""')}"`;
        
        csv += `${beverage},${dateStr},${timeStr},${log.timestamp}\n`;
      });
      
      const filename = `beverage_tracker_${new Date().toISOString().split('T')[0]}.csv`;
      
      console.log('📁 Document Directory:', FileSystem.documentDirectory);
      console.log('📄 Filename:', filename);
      console.log('📊 CSV Content length:', csv.length);
      
      // Save to app documents directory
      try {
        const docDir = FileSystem.documentDirectory;
        if (!docDir) {
          throw new Error('Document directory is undefined');
        }
        
        const filepath = docDir + filename;
        console.log('💾 Attempting to write to:', filepath);
        
        await FileSystem.writeAsStringAsync(filepath, csv);
        console.log('✅ File written successfully');
        
        // Verify file exists
        const fileInfo = await FileSystem.getInfoAsync(filepath);
        console.log('🔍 File info:', fileInfo);
        
        if (fileInfo.exists) {
          Alert.alert(
            '✅ CSV Saved Successfully',
            `File saved as:\n${filename}\n\nSize: ${fileInfo.size} bytes`,
            [{ text: 'OK' }]
          );
        } else {
          throw new Error('File was written but cannot be verified');
        }
      } catch (error) {
        console.error('❌ Error saving file:', error);
        Alert.alert(
          '❌ Error',
          `Failed to save CSV:\n${error.message}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('❌ Error', 'Failed to export CSV file');
    }
  };

  const getTotalCount = () => {
    return Object.values(stats).reduce((a, b) => a + b, 0);
  };

  const getAverageCount = () => {
    const total = getTotalCount();
    const beverageCount = Object.keys(stats).length;
    return beverageCount > 0 ? (total / beverageCount).toFixed(2) : 0;
  };

  const getLitersConsumed = () => {
    // Standard serving sizes in liters
    const volumeMap: { [key: string]: number } = {
      '20cl': 0.2,
      '33cl': 0.33,
      'pint': 0.568,
      'red': 0.15,
      'white': 0.15,
      'rosé': 0.15,
      'shot': 0.04,
      'guinness': 0.568,
      'beer': 0.33, // Default beer size if no variant specified
      'wine': 0.15, // Default wine size
      'sidra': 0.33, // Default sidra size
      'cocktail': 0.25, // Default cocktail size
    };

    let totalLiters = 0;

    Object.entries(stats).forEach(([beverage, count]) => {
      const lowerBeverage = beverage.toLowerCase();
      let volumePerServing = 0.25; // Default fallback

      // Try to find a matching volume
      for (const [key, volume] of Object.entries(volumeMap)) {
        if (lowerBeverage.includes(key)) {
          volumePerServing = volume;
          break;
        }
      }

      totalLiters += volumePerServing * count;
    });

    return totalLiters.toFixed(2);
  };

  const getPeriodLabel = () => {
    if (period === 'month') {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + monthOffset);
      return targetDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }
    
    switch (period) {
      case 'day':
        // @ts-ignore
        return i18n.t('today');
      case 'week':
        // @ts-ignore
        return i18n.t('thisWeek');
      case 'month':
        // @ts-ignore
        return i18n.t('thisMonth');
      case 'year':
        // @ts-ignore
        return i18n.t('thisYear');
    }
  };

  const getMaxValue = () => {
    const values = Object.values(stats);
    return values.length > 0 ? Math.max(...values) : 0;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {/* @ts-ignore */}
          {i18n.t('statistics')}
        </Text>
        <TouchableOpacity style={styles.csvButton} onPress={generateCSV}>
          <Text style={styles.csvButtonText}>CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selection */}
      <View style={styles.periodSelector}>
        {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => {
              setPeriod(p);
              if (p !== 'month') setMonthOffset(0);
            }}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === p && styles.periodButtonTextActive,
              ]}
            >
              {p === 'day'
                ? // @ts-ignore
                  i18n.t('today')
                : p === 'week'
                  ? // @ts-ignore
                    i18n.t('thisWeek')
                  : p === 'month'
                    ? // @ts-ignore
                      i18n.t('thisMonth')
                    : // @ts-ignore
                      i18n.t('thisYear')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Month Navigation (only for month view) */}
      {period === 'month' && (
        <View style={styles.monthNavigator}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => setMonthOffset(monthOffset - 1)}
          >
            <Text style={styles.monthButtonText}>← Previous</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{getPeriodLabel()}</Text>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => setMonthOffset(monthOffset + 1)}
          >
            <Text style={styles.monthButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {/* @ts-ignore */}
            {i18n.t('total')}
          </Text>
          <Text style={styles.summaryValue}>{getTotalCount()}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {/* @ts-ignore */}
            {i18n.t('average')}
          </Text>
          <Text style={styles.summaryValue}>{getAverageCount()}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Liters</Text>
          <Text style={styles.summaryValue}>{getLitersConsumed()}L</Text>
        </View>
      </View>

      {/* Bar Chart */}
      {Object.keys(stats).length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Distribution</Text>
          <View style={styles.barChart}>
            {Object.entries(stats)
              .sort((a, b) => b[1] - a[1])
              .map(([beverage, count]) => {
                const maxVal = getMaxValue();
                const percentage = (count / maxVal) * 100;
                return (
                  <View key={beverage} style={styles.barRow}>
                    <Text style={styles.barLabel} numberOfLines={1}>{beverage}</Text>
                    <View style={styles.barBackground}>
                      <View
                        style={[
                          styles.bar,
                          { width: `${percentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.barValue}>{count}</Text>
                  </View>
                );
              })}
          </View>
        </View>
      )}

      {/* Detailed Stats */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>{getPeriodLabel()}</Text>
        {Object.keys(stats).length > 0 ? (
          Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .map(([beverage, count]) => (
              <View key={beverage} style={styles.statItem}>
                <View style={styles.statItemContent}>
                  <Text style={styles.statItemName}>{beverage}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${
                            (count / getMaxValue()) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.statItemCount}>{count}</Text>
              </View>
            ))
        ) : (
          <Text style={styles.noData}>
            {/* @ts-ignore */}
            {i18n.t('noData')}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  csvButton: {
    backgroundColor: '#34C759',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  csvButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  monthButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  summaryCard: {
    flex: 1,
    minWidth: '31%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  barChart: {
    gap: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 100,
    fontSize: 12,
    color: '#666',
  },
  barBackground: {
    flex: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  barValue: {
    width: 35,
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'right',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statItem: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItemContent: {
    flex: 1,
  },
  statItemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  statItemCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    minWidth: 30,
    textAlign: 'right',
  },
  noData: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
});
