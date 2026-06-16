import { useCallback, useEffect, useState } from 'react';

import type { ResourceItem } from '@fitness/shared';

interface UseCatalogOptions<T> {
  loader: () => Promise<T[]>;
}

export const useCatalog = <T extends ResourceItem>({ loader }: UseCatalogOptions<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await loader());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '数据加载失败');
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, loading, error, reload: load };
};
