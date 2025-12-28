import { useI18n } from '@/constants/i18nContext';
import { storageService } from '@/constants/storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
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
  const { t } = useI18n();
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

  const getVolumeForBeverage = (beverageName: string): number => {
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
      'cidra': 0.75, // Cidra is 75cl
      'cocktail': 0.25, // Default cocktail size
      'shots': 0.04, // Default shots size
    };

    const lowerBeverage = beverageName.toLowerCase();
    
    // Try to find a matching volume
    for (const [key, volume] of Object.entries(volumeMap)) {
      if (lowerBeverage.includes(key)) {
        return volume;
      }
    }
    
    // Default for custom beverages: 33cl (0.33L)
    return 0.33;
  };

  const generateCSV = async () => {
    try {
      const logs = await storageService.getLogs();
      
      // CSV header with Liters column
      let csv = 'Beverage,Date,Time,Liters,Timestamp\n';
      
      // Add each log as a row
      logs.forEach((log) => {
        const date = new Date(log.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        
        // Get volume for this beverage
        const volume = getVolumeForBeverage(log.beverage);
        
        // Escape beverage name in case it contains commas or quotes
        const beverage = `"${log.beverage.replace(/"/g, '""')}"`;
        
        csv += `${beverage},${dateStr},${timeStr},${volume},${log.timestamp}\n`;
      });
      
      const filename = `beverage_tracker_${new Date().toISOString().split('T')[0]}.csv`;
      const filepath = FileSystem.documentDirectory + filename;
      
      // Write CSV to temp location
      await FileSystem.writeAsStringAsync(filepath, csv);
      console.log('✅ CSV created at:', filepath);
      
      // Use Sharing to let user save it
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filepath, {
          mimeType: 'text/csv',
          dialogTitle: `${t('csvSaved')} - ${filename}`,
          UTI: 'public.comma-separated-values-text',
        });
        console.log('✅ CSV shared successfully');
      } else {
        Alert.alert(
          t('csvSaved'),
          `${t('fileSavedAs')} ${filename}\n\n${t('shareTo')}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert(t('csvError'), t('exportFailed'));
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
      'cidra': 0.75, // Cidra is 75cl
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
        return t('today');
      case 'week':
        return t('thisWeek');
      case 'month':
        return t('thisMonth');
      case 'year':
        return t('thisYear');
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
          {t('statistics')}
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
                ? t('today')
                : p === 'week'
                  ? t('thisWeek')
                  : p === 'month'
                    ? t('thisMonth')
                    : t('thisYear')}
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
            <Text style={styles.monthButtonText}>
              {t('previous')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{getPeriodLabel()}</Text>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => setMonthOffset(monthOffset + 1)}
          >
            <Text style={styles.monthButtonText}>
              {t('next')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {t('total')}
          </Text>
          <Text style={styles.summaryValue}>{getTotalCount()}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {t('average')}
          </Text>
          <Text style={styles.summaryValue}>{getAverageCount()}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {t('liters')}
          </Text>
          <Text style={styles.summaryValue}>{getLitersConsumed()}L</Text>
        </View>
      </View>

      {/* Bar Chart */}
      {Object.keys(stats).length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {t('distribution')}
          </Text>
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
            {t('noData')}
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
