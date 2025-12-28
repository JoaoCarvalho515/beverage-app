import Settings from '@/components/Settings';
import { useState } from 'react';

export default function SettingsScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLanguageChange = () => {
    setRefreshKey(refreshKey + 1);
  };

  return <Settings key={refreshKey} onLanguageChange={handleLanguageChange} />;
}
