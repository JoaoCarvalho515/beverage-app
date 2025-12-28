const translations = {
  en: {
    title: 'Beverage Tracker',
    add: 'Add',
    addBeverage: 'Add Beverage',
    cancel: 'Cancel',
    delete: 'Delete',
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
    reset: 'Reset',
    logs: 'Logs',
    timestamp: 'Timestamp',
    beverage: 'Beverage',
    noData: 'No data available',
    selectDate: 'Selected Date & Time',
    enterDateFormat: 'Enter Date (YYYY-MM-DD HH:MM)',
    resetToNow: 'Reset to Now',
    selectSize: 'Select size',
    deleteBeverage: 'Delete Beverage',
    deleteBeverageConfirm: 'Are you sure you want to remove this beverage?',
    cannotDelete: 'Cannot Delete: Default beverages cannot be removed.',
    previous: '← Previous',
    next: 'Next →',
    liters: 'Liters',
    distribution: 'Distribution',
    csvSaved: '✅ CSV Saved Successfully',
    csvError: '❌ Error',
    exportFailed: 'Failed to export CSV file',
    fileSavedAs: 'File saved as:',
    size: 'Size',
    bytes: 'bytes',
    shareTo: 'File created. You can share it using your preferred method.',
  },
  pt: {
    title: 'Rastreador de Bebidas',
    add: 'Adicionar',
    addBeverage: 'Adicionar Bebida',
    cancel: 'Cancelar',
    delete: 'Deletar',
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
    reset: 'Redefinir',
    logs: 'Registros',
    timestamp: 'Horário',
    beverage: 'Bebida',
    noData: 'Sem dados disponíveis',
    selectDate: 'Data e Hora Selecionadas',
    enterDateFormat: 'Digite a Data (YYYY-MM-DD HH:MM)',
    resetToNow: 'Redefinir para Agora',
    selectSize: 'Selecione o tamanho',
    deleteBeverage: 'Deletar Bebida',
    deleteBeverageConfirm: 'Tem certeza de que deseja remover esta bebida?',
    cannotDelete: 'Não é possível deletar: Bebidas padrão não podem ser removidas.',
    previous: '← Anterior',
    next: 'Próximo →',
    liters: 'Litros',
    distribution: 'Distribuição',
    csvSaved: '✅ CSV Salvo com Sucesso',
    csvError: '❌ Erro',
    exportFailed: 'Falha ao exportar arquivo CSV',
    fileSavedAs: 'Arquivo salvo como:',
    size: 'Tamanho',
    bytes: 'bytes',
    shareTo: 'Arquivo criado. Você pode compartilhá-lo usando seu método preferido.',
  },
  es: {
    title: 'Rastreador de Bebidas',
    add: 'Añadir',
    addBeverage: 'Añadir Bebida',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    today: 'Hoy',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mes',
    thisYear: 'Este Año',
    statistics: 'Estadísticas',
    count: 'Recuento',
    average: 'Promedio',
    total: 'Total',
    settings: 'Configuración',
    language: 'Idioma',
    beverages: 'Bebidas',
    reset: 'Restablecer',
    logs: 'Registros',
    timestamp: 'Marca de Tiempo',
    beverage: 'Bebida',
    noData: 'Sin datos disponibles',
    selectDate: 'Fecha y Hora Seleccionadas',
    enterDateFormat: 'Ingrese la Fecha (YYYY-MM-DD HH:MM)',
    resetToNow: 'Restablecer a Ahora',
    selectSize: 'Seleccionar tamaño',
    deleteBeverage: 'Eliminar Bebida',
    deleteBeverageConfirm: '¿Está seguro de que desea eliminar esta bebida?',
    cannotDelete: 'No se puede eliminar: Las bebidas predeterminadas no se pueden eliminar.',
    previous: '← Anterior',
    next: 'Siguiente →',
    liters: 'Litros',
    distribution: 'Distribución',
    csvSaved: '✅ CSV Guardado Exitosamente',
    csvError: '❌ Error',
    exportFailed: 'Error al exportar archivo CSV',
    fileSavedAs: 'Archivo guardado como:',
    size: 'Tamaño',
    bytes: 'bytes',
    shareTo: 'Archivo creado. Puedes compartirlo usando tu método preferido.',
  },
} as const;

type Language = keyof typeof translations;

class I18n {
  locale: Language = 'en';
  translations = translations;
  enableFallback = true;
  supportedLanguages: Language[] = ['en', 'pt', 'es'];

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
    if (this.supportedLanguages.includes(locale)) {
      this.locale = locale;
    }
  }

  getLocale(): Language {
    return this.locale;
  }

  getSupportedLanguages(): Language[] {
    return this.supportedLanguages;
  }
}

const i18n = new I18n();

export default i18n;
