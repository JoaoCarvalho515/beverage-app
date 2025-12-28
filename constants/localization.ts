const translations = {
  en: {
    title: 'Beverage Tracker',
    add: 'Add',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    statistics: 'Statistics',
    count: 'Count',
    average: 'Average',
    total: 'Total',
    settings: 'Settings',
    language: 'Language',
    beverages: 'Beverages',
    addBeverage: 'Add Beverage',
    reset: 'Reset',
    logs: 'Logs',
    timestamp: 'Timestamp',
    beverage: 'Beverage',
    noData: 'No data available',
  },
  pt: {
    title: 'Rastreador de Bebidas',
    add: 'Adicionar',
    today: 'Hoje',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mês',
    thisYear: 'Este Ano',
    statistics: 'Estatísticas',
    count: 'Contagem',
    average: 'Média',
    total: 'Total',
    settings: 'Configurações',
    language: 'Idioma',
    beverages: 'Bebidas',
    addBeverage: 'Adicionar Bebida',
    reset: 'Redefinir',
    logs: 'Registros',
    timestamp: 'Horário',
    beverage: 'Bebida',
    noData: 'Sem dados disponíveis',
  },
} as const;

type Language = keyof typeof translations;

class I18n {
  locale: Language = 'en';
  translations = translations;
  enableFallback = true;

  t(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (!value && this.enableFallback && this.locale !== 'en') {
      value = this.translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }
    
    return value || key;
  }

  setLocale(locale: Language) {
    this.locale = locale;
  }
}

const i18n = new I18n();

export default i18n;
