import * as FileSystem from 'expo-file-system/legacy';

export interface BeverageLog {
  id: string;
  beverage: string;
  timestamp: number; // milliseconds since epoch
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
}

export interface Beverage {
  id: string;
  name: string;
  emoji?: string;
  image?: string; // path to image file
  color?: string;
  variants?: string[]; // optional variants (e.g., sizes for beer)
}

export interface AppData {
  beverages: Beverage[];
  logs: BeverageLog[];
  version: number;
}

const DEFAULT_BEVERAGES: Beverage[] = [
  { id: '1', name: 'Beer', image: 'pint.png', color: '#FDB913', variants: ['20cl', '33cl', 'Pint'] },
  { id: '2', name: 'Guinness', image: 'guinness.png', color: '#000000' },
  { id: '3', name: 'Wine', image: 'wine.png', color: '#8B2F3B', variants: ['Red', 'White', 'Rosé'] },
  { id: '4', name: 'Cidra', image: 'cider.png', color: '#A0522D' },
  { id: '5', name: 'Shots', image: 'shots.png', color: '#DC143C' },
  { id: '6', name: 'Cocktails', image: 'cocktails.png', color: '#FF69B4', variants: ['Rum and Coke', 'Gin Tonic', 'Others'] },
];

const DATA_FILE = FileSystem.documentDirectory + 'beverage_app_data.json';
const BACKUP_FILE = FileSystem.documentDirectory + 'beverage_app_data.backup.json';

const DEFAULT_DATA: AppData = {
  beverages: DEFAULT_BEVERAGES,
  logs: [],
  version: 1,
};

export const storageService = {
  // Initialize app with default data on first run
  async initializeApp(): Promise<void> {
    try {
      console.log('📁 DATA_FILE path:', DATA_FILE);
      const exists = await FileSystem.getInfoAsync(DATA_FILE);
      
      if (!exists.exists) {
        // First run - create file with default data
        console.log('First run - creating default data file');
        await FileSystem.writeAsStringAsync(
          DATA_FILE,
          JSON.stringify(DEFAULT_DATA, null, 2)
        );
      } else {
        // File exists - load it and ensure default beverages have variants
        const data = await this.loadData();
        const defaultMap = new Map(DEFAULT_BEVERAGES.map(b => [b.name, b]));
        
        data.beverages = data.beverages.map(b => {
          const defaultBeverage = defaultMap.get(b.name);
          return defaultBeverage && defaultBeverage.variants && !b.variants
            ? { ...b, variants: defaultBeverage.variants }
            : b;
        });
        
        await this.saveData(data);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  },

  // Load all data from file
  async loadData(): Promise<AppData> {
    try {
      const content = await FileSystem.readAsStringAsync(DATA_FILE);
      const data = JSON.parse(content) as AppData;
      console.log('📖 Loaded data:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Error loading data:', error);
      return DEFAULT_DATA;
    }
  },

  // Save all data to file
  async saveData(data: AppData): Promise<void> {
    try {
      // Create backup before saving
      try {
        const exists = await FileSystem.getInfoAsync(DATA_FILE);
        if (exists.exists) {
          await FileSystem.copyAsync({
            from: DATA_FILE,
            to: BACKUP_FILE,
          });
        }
      } catch (e) {
        console.log('Could not create backup');
      }

      // Write new data
      await FileSystem.writeAsStringAsync(
        DATA_FILE,
        JSON.stringify(data, null, 2)
      );
      console.log('✅ Data saved successfully to:', DATA_FILE);
    } catch (error) {
      console.error('❌ Error saving data:', error);
      throw error;
    }
  },

  // Beverages
  async getBeverages(): Promise<Beverage[]> {
    try {
      const data = await this.loadData();
      return data.beverages;
    } catch (error) {
      console.error('Error getting beverages:', error);
      return DEFAULT_BEVERAGES;
    }
  },

  async addBeverage(name: string, emoji?: string, color?: string): Promise<Beverage> {
    try {
      const data = await this.loadData();
      const newBeverage: Beverage = {
        id: Date.now().toString(),
        name,
        emoji: emoji || '🥤',
        color: color || '#007AFF',
      };
      data.beverages.push(newBeverage);
      await this.saveData(data);
      return newBeverage;
    } catch (error) {
      console.error('Error adding beverage:', error);
      throw error;
    }
  },

  async removeBeverage(id: string): Promise<void> {
    try {
      const data = await this.loadData();
      data.beverages = data.beverages.filter((b) => b.id !== id);
      await this.saveData(data);
    } catch (error) {
      console.error('Error removing beverage:', error);
      throw error;
    }
  },

  // Logs
  async getLogs(): Promise<BeverageLog[]> {
    try {
      const data = await this.loadData();
      return data.logs;
    } catch (error) {
      console.error('Error getting logs:', error);
      return [];
    }
  },

  async addLog(beverage: string, timestamp?: number): Promise<BeverageLog> {
    try {
      const data = await this.loadData();
      const logDate = new Date(timestamp || Date.now());
      const newLog: BeverageLog = {
        id: Date.now().toString(),
        beverage,
        timestamp: logDate.getTime(),
        date: logDate.toISOString().split('T')[0],
        hour: logDate.getHours(),
      };
      data.logs.push(newLog);
      await this.saveData(data);
      return newLog;
    } catch (error) {
      console.error('Error adding log:', error);
      throw error;
    }
  },

  async removeLog(logId: string): Promise<void> {
    try {
      const data = await this.loadData();
      data.logs = data.logs.filter((l) => l.id !== logId);
      await this.saveData(data);
    } catch (error) {
      console.error('Error removing log:', error);
      throw error;
    }
  },

  async clearLogs(): Promise<void> {
    try {
      const data = await this.loadData();
      data.logs = [];
      await this.saveData(data);
    } catch (error) {
      console.error('Error clearing logs:', error);
      throw error;
    }
  },

  // Statistics
  async getStatisticsForPeriod(
    period: 'day' | 'week' | 'month' | 'year',
    monthOffset: number = 0
  ): Promise<{ [beverage: string]: number }> {
    const logs = await this.getLogs();
    const now = new Date();
    const stats: { [beverage: string]: number } = {};

    logs.forEach((log) => {
      const logDate = new Date(log.timestamp);
      let isInPeriod = false;

      if (period === 'day') {
        isInPeriod =
          logDate.toISOString().split('T')[0] ===
          now.toISOString().split('T')[0];
      } else if (period === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        isInPeriod = logDate >= weekAgo;
      } else if (period === 'month') {
        const targetDate = new Date(now);
        targetDate.setMonth(targetDate.getMonth() + monthOffset);
        isInPeriod =
          logDate.getMonth() === targetDate.getMonth() &&
          logDate.getFullYear() === targetDate.getFullYear();
      } else if (period === 'year') {
        isInPeriod = logDate.getFullYear() === now.getFullYear();
      }

      if (isInPeriod) {
        stats[log.beverage] = (stats[log.beverage] || 0) + 1;
      }
    });

    return stats;
  },

  async getLogsForBeverage(beverage: string): Promise<BeverageLog[]> {
    const logs = await this.getLogs();
    return logs.filter((log) => log.beverage === beverage);
  },

  // Data Export/Import
  async exportData(): Promise<string> {
    try {
      const data = await this.loadData();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString) as AppData;
      await this.saveData(data);
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  },

  // Get file path for debugging/manual access
  getDataFilePath(): string {
    return DATA_FILE;
  },
};
