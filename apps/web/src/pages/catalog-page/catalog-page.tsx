import { Alert, Empty, Input, Select, Skeleton } from 'antd';
import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import type { ResourceItem } from '@fitness/shared';

import ContentCard from '@/features/catalog/components/content-card';
import { catalogConfigs, isCatalogResource } from '@/features/catalog/catalog-config';
import PublicLayout from '@/layouts/public-layout';
import { useCatalog } from '@/hooks/use-catalog';
import { toTextList } from '@/utils/format';

import styles from './catalog-page.module.css';

const CatalogPage = () => {
  const { resource = '' } = useParams();
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<string>();

  if (!isCatalogResource(resource)) return <Navigate to="/" replace />;

  const config = catalogConfigs[resource];
  const { items, loading, error } = useCatalog<ResourceItem>({ loader: config.loader });

  const filterOptions = useMemo(() => {
    const fields = config.filters;
    const values = new Set<string>();
    items.forEach((item) => {
      fields.forEach((field) => {
        const value = item[field as keyof ResourceItem];
        if (typeof value === 'string') values.add(value);
      });
    });
    return Array.from(values).map((value) => ({ label: value, value }));
  }, [config.filters, items]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchedKeyword =
          item.name.includes(keyword) ||
          item.summary.includes(keyword) ||
          toTextList(item.tags).some((tag) => tag.includes(keyword));
        const matchedFilter =
          !filter ||
          config.filters.some((field) => {
            const value = item[field as keyof ResourceItem];
            return typeof value === 'string' && value === filter;
          });
        return matchedKeyword && matchedFilter;
      }),
    [config.filters, filter, items, keyword],
  );

  return (
    <PublicLayout>
      <section className={styles.header}>
        <div>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
      </section>

      <div className={styles.toolbar}>
        <Input.Search placeholder="搜索名称、摘要或标签" allowClear onSearch={setKeyword} />
        <Select
          placeholder="筛选分类"
          allowClear
          options={filterOptions}
          value={filter}
          onChange={setFilter}
          className={styles.select}
        />
      </div>

      {error && <Alert type="error" message={error} showIcon />}
      {loading ? (
        <Skeleton active />
      ) : filteredItems.length > 0 ? (
        <div className={styles.grid}>
          {filteredItems.map((item) => (
            <ContentCard key={item.id} resource={resource} item={item} />
          ))}
        </div>
      ) : (
        <Empty description="暂无匹配内容" />
      )}
    </PublicLayout>
  );
};

export default CatalogPage;
