import i18n from '@/constants/localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function SettingsScreen({ onLanguageChange }: { onLanguageChange?: () => void }) {
  // @ts-ignore
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'pt'>(i18n.locale || 'en');

  const handleLanguageChange = async (language: 'en' | 'pt') => {
    i18n.setLocale(language);
    setCurrentLanguage(language);
    await AsyncStorage.setItem('app-language', language);
    onLanguageChange?.();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {/* @ts-ignore */}
          {i18n.t('settings')}
        </Text>
      </View>

      {/* Language Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {/* @ts-ignore */}
          {i18n.t('language')}
        </Text>

        <TouchableOpacity
          style={[
            styles.languageOption,
            currentLanguage === 'en' && styles.languageOptionActive,
          ]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text
            style={[
              styles.languageOptionText,
              currentLanguage === 'en' && styles.languageOptionTextActive,
            ]}
          >
            English
          </Text>
          {currentLanguage === 'en' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.languageOption,
            currentLanguage === 'pt' && styles.languageOptionActive,
          ]}
          onPress={() => handleLanguageChange('pt')}
        >
          <Text
            style={[
              styles.languageOptionText,
              currentLanguage === 'pt' && styles.languageOptionTextActive,
            ]}
          >
            Português
          </Text>
          {currentLanguage === 'pt' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoCard}>
          <Text style={styles.appVersion}>Beverage Tracker v1.0.0</Text>
          <Text style={styles.infoText}>
            A simple app to track your beverage consumption throughout the day.
          </Text>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Track multiple beverages</Text>
          <Text style={styles.featureItem}>• Daily, weekly, monthly & yearly statistics</Text>
          <Text style={styles.featureItem}>• Timestamp logging</Text>
          <Text style={styles.featureItem}>• Bilingual support (EN & PT)</Text>
          <Text style={styles.featureItem}>• Local data storage</Text>
        </View>
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
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
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
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  languageOptionActive: {
    backgroundColor: '#E8F4FF',
    borderColor: '#007AFF',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
  },
  languageOptionTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  featureList: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  featureItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});
