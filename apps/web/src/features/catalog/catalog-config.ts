import type { Exercise, Food, Medicine, Recipe, ResourceItem, ResourceName } from '@fitness/shared';

import { catalogService } from '@/services/catalog.service';

interface CatalogConfig<T extends ResourceItem> {
  resource: ResourceName;
  title: string;
  description: string;
  loader: () => Promise<T[]>;
  filters: Array<keyof T>;
}

export const catalogConfigs = {
  exercises: {
    resource: 'exercises',
    title: '健身运动方法',
    description: '了解每类运动的动作方法、难度、热量消耗和坚持建议。',
    loader: catalogService.listExercises,
    filters: ['category', 'difficulty'],
  } satisfies CatalogConfig<Exercise>,
  foods: {
    resource: 'foods',
    title: '食物热量库',
    description: '记录常见食物每 100g 热量与三大营养素，帮助搭配减脂饮食。',
    loader: catalogService.listFoods,
    filters: ['category'],
  } satisfies CatalogConfig<Food>,
  recipes: {
    resource: 'recipes',
    title: '减脂菜谱',
    description: '按早餐、午餐、晚餐组织低油、高蛋白、易坚持的减脂菜谱。',
    loader: catalogService.listRecipes,
    filters: ['mealType'],
  } satisfies CatalogConfig<Recipe>,
  medicines: {
    resource: 'medicines',
    title: '辅助药物与补剂科普',
    description: '中立介绍适用边界、作用机制、副作用和就医提示，不提供个人用药建议。',
    loader: catalogService.listMedicines,
    filters: ['type'],
  } satisfies CatalogConfig<Medicine>,
};

export const isCatalogResource = (value: string): value is ResourceName => value in catalogConfigs;
