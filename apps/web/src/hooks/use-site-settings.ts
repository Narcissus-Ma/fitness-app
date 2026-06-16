import { useCallback, useEffect, useState } from 'react';

import { defaultSiteSettings, type SiteSettings } from '@fitness/shared';

import { settingsService } from '@/services/settings.service';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSettings(await settingsService.getPublic());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '配置加载失败');
      setSettings(defaultSiteSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { settings, loading, error, reload: load };
};
