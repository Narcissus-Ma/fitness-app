import { seedCatalog, type Catalog, type ResourceItem, type ResourceName } from '@fitness/shared';

const resourceKeys: ResourceName[] = ['exercises', 'foods', 'recipes', 'medicines'];

const indexKey = (resource: ResourceName) => `${resource}:index`;

const itemKey = (resource: ResourceName, id: string) => `${resource}:${id}`;

const ensureSeeded = async (kv: KVNamespace): Promise<void> => {
  const seeded = await kv.get('catalog:seeded');
  if (seeded === 'true') return;

  await Promise.all(
    resourceKeys.map(async (resource) => {
      const items = seedCatalog[resource] as ResourceItem[];
      await kv.put(indexKey(resource), JSON.stringify(items.map((item) => item.id)));
      await Promise.all(
        items.map((item) => kv.put(itemKey(resource, item.id), JSON.stringify(item))),
      );
    }),
  );
  await kv.put('catalog:seeded', 'true');
};

export const isResourceName = (value: string): value is ResourceName =>
  resourceKeys.includes(value as ResourceName);

export const listItems = async <T extends ResourceItem>(
  kv: KVNamespace,
  resource: ResourceName,
  includeDisabled = false,
): Promise<T[]> => {
  await ensureSeeded(kv);
  const ids = JSON.parse((await kv.get(indexKey(resource))) ?? '[]') as string[];
  const items = await Promise.all(ids.map((id) => kv.get(itemKey(resource, id))));

  return items
    .filter((value): value is string => Boolean(value))
    .map((value) => JSON.parse(value) as T)
    .filter((item) => includeDisabled || item.status === 'enabled')
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'zh-CN'));
};

export const getItem = async <T extends ResourceItem>(
  kv: KVNamespace,
  resource: ResourceName,
  id: string,
  includeDisabled = false,
): Promise<T | null> => {
  await ensureSeeded(kv);
  const raw = await kv.get(itemKey(resource, id));
  if (!raw) return null;

  const item = JSON.parse(raw) as T;
  if (!includeDisabled && item.status !== 'enabled') return null;
  return item;
};

export const upsertItem = async <T extends ResourceItem>(
  kv: KVNamespace,
  resource: ResourceName,
  item: T,
): Promise<T> => {
  await ensureSeeded(kv);
  const ids = JSON.parse((await kv.get(indexKey(resource))) ?? '[]') as string[];
  const nextIds = ids.includes(item.id) ? ids : [...ids, item.id];

  await kv.put(itemKey(resource, item.id), JSON.stringify(item));
  await kv.put(indexKey(resource), JSON.stringify(nextIds));

  return item;
};

export const deleteItem = async (
  kv: KVNamespace,
  resource: ResourceName,
  id: string,
): Promise<void> => {
  await ensureSeeded(kv);
  const ids = JSON.parse((await kv.get(indexKey(resource))) ?? '[]') as string[];
  await kv.delete(itemKey(resource, id));
  await kv.put(indexKey(resource), JSON.stringify(ids.filter((itemId) => itemId !== id)));
};

export const createCatalogSnapshot = async (kv: KVNamespace): Promise<Catalog> => ({
  exercises: await listItems(kv, 'exercises'),
  foods: await listItems(kv, 'foods'),
  recipes: await listItems(kv, 'recipes'),
  medicines: await listItems(kv, 'medicines'),
});
