import i18n from '@/constants/localization';
import { Beverage, BeverageLog, storageService } from '@/constants/storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Image mapping - Map image filenames to require() calls
const imageMap: { [key: string]: any } = {
  'pint.png': require('@/assets/images/pint.png'),
  'guinness.png': require('@/assets/images/guinness.png'),
  'wine.png': require('@/assets/images/wine.png'),
  'cider.png': require('@/assets/images/cider.png'),
  'shots.png': require('@/assets/images/shots.png'),
  'cocktails.png': require('@/assets/images/cocktails.png'),
};

const getImageSource = (imageName?: string) => {
  if (!imageName || !imageMap[imageName]) {
    return null;
  }
  return imageMap[imageName];
};

export default function BeverageTrackerScreen() {
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [newBeverageName, setNewBeverageName] = useState('');
  const [logs, setLogs] = useState<BeverageLog[]>([]);
  const [showAddBeverage, setShowAddBeverage] = useState(false);
  const [stats, setStats] = useState<{ [key: string]: number }>({});
  const [variantModal, setVariantModal] = useState<{ beverage: Beverage; visible: boolean }>({
    beverage: {} as Beverage,
    visible: false,
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ visible: boolean; beverageId: string }>({
    visible: false,
    beverageId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await storageService.initializeApp();
    const beveragesList = await storageService.getBeverages();
    console.log('Loaded beverages:', beveragesList);
    console.log('Total beverages count:', beveragesList.length);
    beveragesList.forEach((b) => console.log('Beverage detail:', { id: b.id, name: b.name }));
    setBeverages(beveragesList);

    const logsList = await storageService.getLogs();
    setLogs(logsList);

    const stats = await storageService.getStatisticsForPeriod('day');
    setStats(stats);
  };

  const handleAddBeverage = async () => {
    if (newBeverageName.trim() === '') {
      Alert.alert('Error', 'Please enter a beverage name');
      return;
    }

    try {
      await storageService.addBeverage(newBeverageName);
      setNewBeverageName('');
      setShowAddBeverage(false);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add beverage');
    }
  };

  const handleAddLog = async (beverage: string, selectedVariant?: string) => {
    try {
      const finalBeverage = selectedVariant 
        ? `${beverage} - ${selectedVariant}` 
        : beverage;
      
      // Adjust timestamp for early morning logs (before 8 AM)
      let logTimestamp = selectedDate.getTime();
      const hour = selectedDate.getHours();
      
      if (hour < 8) {
        // Before 8 AM - log as previous day at 23:59
        const adjustedDate = new Date(selectedDate);
        adjustedDate.setDate(adjustedDate.getDate() - 1);
        adjustedDate.setHours(23, 59, 0, 0);
        logTimestamp = adjustedDate.getTime();
        console.log('⏰ Early morning log detected. Adjusted from', selectedDate, 'to', adjustedDate);
      }
      
      await storageService.addLog(finalBeverage, logTimestamp);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to log beverage');
    }
  };

  const handleBeveragePress = (beverage: Beverage) => {
    console.log('handleBeveragePress called with:', beverage.name, 'variants:', beverage.variants);
    if (beverage.variants && beverage.variants.length > 0) {
      console.log('Showing variant modal for', beverage.name);
      setVariantModal({ beverage, visible: true });
    } else {
      console.log('No variants for', beverage.name, ', logging directly');
      // No variants, just log it
      handleAddLog(beverage.name);
    }
  };

  const isDefaultBeverage = (id: string): boolean => {
    // Default beverages have IDs '1' through '6'
    const isDefault = id === '1' || id === '2' || id === '3' || id === '4' || id === '5' || id === '6';
    console.log('isDefaultBeverage check:', { id, isDefault });
    return isDefault;
  };

  const handleRemoveBeverage = (id: string) => {
    console.log('handleRemoveBeverage called with id:', id);
    if (isDefaultBeverage(id)) {
      console.log('Cannot remove default beverage');
      alert('Cannot Delete: Default beverages cannot be removed.');
      return;
    }

    console.log('Showing delete confirmation for beverage:', id);
    setDeleteConfirm({ visible: true, beverageId: id });
  };

  const confirmDelete = async () => {
    console.log('Confirming delete for:', deleteConfirm.beverageId);
    await storageService.removeBeverage(deleteConfirm.beverageId);
    setDeleteConfirm({ visible: false, beverageId: '' });
    await loadData();
  };

  const handleRemoveLog = async (logId: string) => {
    await storageService.removeLog(logId);
    await loadData();
  };

  const handleDecrementStat = async (beverageName: string) => {
    // Find all logs for today with this beverage name
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogsForBeverage = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return log.beverage === beverageName && logDate.getTime() === today.getTime();
    });

    if (todayLogsForBeverage.length > 0) {
      // Remove the most recent one
      const mostRecentLog = todayLogsForBeverage.sort((a, b) => b.timestamp - a.timestamp)[0];
      await storageService.removeLog(mostRecentLog.id);
      await loadData();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {/* @ts-ignore */}
          {i18n.t('title')}
        </Text>
      </View>

      {/* Date/Time Picker */}
      <View style={styles.datePickerContainer}>
        <Text style={styles.datePickerLabel}>Selected Date & Time:</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Text style={styles.datePickerButtonText}>
            {selectedDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })} {selectedDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateInputLabel}>Enter Date (YYYY-MM-DD HH:MM):</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="2025-12-27 14:30"
              placeholderTextColor="#999"
              onChangeText={(text) => {
                try {
                  const date = new Date(text);
                  if (!isNaN(date.getTime())) {
                    setSelectedDate(date);
                  }
                } catch (e) {
                  // Invalid date format, ignore
                }
              }}
            />
            <TouchableOpacity
              style={styles.dateResetButton}
              onPress={() => {
                setSelectedDate(new Date());
              }}
            >
              <Text style={styles.dateResetButtonText}>Reset to Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Beverage Buttons */}
      <View style={styles.beveragesContainer}>
        <Text style={styles.sectionTitle}>
          {/* @ts-ignore */}
          {i18n.t('beverages')}
        </Text>
        <View style={styles.beverageGrid}>
          {beverages.map((beverage) => {
            const isDefault = isDefaultBeverage(beverage.id);
            console.log('Beverage render:', { name: beverage.name, id: beverage.id, isDefault });
            return (
              <View key={beverage.id} style={styles.beverageButtonWrapper}>
                <TouchableOpacity
                  style={[
                    styles.beverageButton,
                    { backgroundColor: beverage.color || '#007AFF' },
                  ]}
                  onPress={() => handleBeveragePress(beverage)}
                >
                  <View style={styles.beverageImageContainer}>
                    {beverage.image && getImageSource(beverage.image) ? (
                      <Image
                        source={getImageSource(beverage.image)}
                        style={styles.beverageImage}
                      />
                    ) : (
                      <Text style={styles.beverageEmoji}>{beverage.emoji || '🥤'}</Text>
                    )}
                  </View>
                  <Text style={styles.beverageButtonText}>{beverage.name}</Text>
                </TouchableOpacity>
                {!isDefault && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      console.log('Remove button tapped:', beverage.id);
                      handleRemoveBeverage(beverage.id);
                    }}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Add Beverage */}
      {!showAddBeverage ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddBeverage(true)}
        >
          <Text style={styles.addButtonText}>
            + {/* @ts-ignore */}
            {i18n.t('addBeverage')}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.addBeverageForm}>
          <TextInput
            style={styles.input}
            placeholder={
              // @ts-ignore
              i18n.t('addBeverage')
            }
            value={newBeverageName}
            onChangeText={setNewBeverageName}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.addFormButton]}
              onPress={handleAddBeverage}
            >
              <Text style={styles.formButtonText}>
                {/* @ts-ignore */}
                {i18n.t('add')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setShowAddBeverage(false);
                setNewBeverageName('');
              }}
            >
              <Text style={styles.formButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Today's Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>
          {/* @ts-ignore */}
          {i18n.t('today')}
        </Text>
        {Object.keys(stats).length > 0 ? (
          Object.entries(stats).map(([beverage, count]) => (
            <View key={beverage} style={styles.statRow}>
              <TouchableOpacity
                style={styles.statRemoveButton}
                onPress={() => handleDecrementStat(beverage)}
              >
                <Text style={styles.statRemoveButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.statLabel}>{beverage}</Text>
              <Text style={styles.statValue}>{count}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>
            {/* @ts-ignore */}
            {i18n.t('noData')}
          </Text>
        )}
      </View>

      {/* Recent Logs */}
      <View style={styles.logsContainer}>
        <Text style={styles.sectionTitle}>
          {/* @ts-ignore */}
          {i18n.t('logs')}
        </Text>
        {logs.length > 0 ? (
          <FlatList
            data={logs.slice(-10).reverse()}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.logItem}>
                <TouchableOpacity
                  style={styles.logRemoveButton}
                  onPress={() => handleRemoveLog(item.id)}
                >
                  <Text style={styles.logRemoveButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.logBeverage}>{item.beverage}</Text>
                <Text style={styles.logTime}>{formatTime(item.timestamp)}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noData}>
            {/* @ts-ignore */}
            {i18n.t('noData')}
          </Text>
        )}
      </View>

      {/* Variant Selection Modal */}
      {variantModal.visible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select {variantModal.beverage.name} size
            </Text>
            <View style={styles.variantButtonsContainer}>
              {variantModal.beverage.variants?.map((variant) => (
                <TouchableOpacity
                  key={variant}
                  style={styles.variantButton}
                  onPress={() => {
                    console.log('Variant selected:', variant);
                    setVariantModal({ ...variantModal, visible: false });
                    handleAddLog(variantModal.beverage.name, variant);
                  }}
                >
                  <Text style={styles.variantButtonText}>{variant}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.variantButton, styles.cancelVariantButton]}
              onPress={() => setVariantModal({ ...variantModal, visible: false })}
            >
              <Text style={styles.variantButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {deleteConfirm.visible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Beverage?</Text>
            <Text style={styles.modalDescription}>Are you sure you want to remove this beverage?</Text>
            <View style={styles.variantButtonsContainer}>
              <TouchableOpacity
                style={[styles.variantButton, { backgroundColor: '#ff3b30' }]}
                onPress={confirmDelete}
              >
                <Text style={styles.variantButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.variantButton, styles.cancelVariantButton]}
                onPress={() => setDeleteConfirm({ visible: false, beverageId: '' })}
              >
                <Text style={styles.variantButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statRemoveButton: {
    padding: 4,
    marginRight: 8,
  },
  statRemoveButtonText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  beveragesContainer: {
    marginBottom: 16,
  },
  beverageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-around',
  },
  beverageButtonWrapper: {
    width: '31%',
    position: 'relative',
    overflow: 'visible',
  },
  beverageButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  beverageImageContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  beverageEmoji: {
    fontSize: 48,
  },
  beverageImage: {
    width: '80%',
    height: '100%',
    resizeMode: 'contain',
  },
  beverageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  addBeverageForm: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  formButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  addFormButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  formButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  logItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logRemoveButton: {
    padding: 4,
    marginRight: 8,
  },
  logRemoveButtonText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logBeverage: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  logTime: {
    fontSize: 14,
    color: '#999',
  },
  noData: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  variantButtonsContainer: {
    marginBottom: 12,
    gap: 8,
  },
  variantButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  variantButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelVariantButton: {
    backgroundColor: '#999',
  },
  datePickerContainer: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  datePickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  datePickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignItems: 'center',
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dateInputContainer: {
    marginTop: 12,
    gap: 8,
  },
  dateInputLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  dateResetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
  },
  dateResetButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    gap: 8,
  },
  timeInput: {
    width: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
