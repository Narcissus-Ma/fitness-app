import type { Exercise, Food, Medicine, Recipe, ResourceItem, ResourceName } from '@fitness/shared';

import { apiRequest } from './api';

export const catalogService = {
  listExercises: () => apiRequest<Exercise[]>('/api/exercises'),
  listFoods: () => apiRequest<Food[]>('/api/foods'),
  listRecipes: () => apiRequest<Recipe[]>('/api/recipes'),
  listMedicines: () => apiRequest<Medicine[]>('/api/medicines'),
  getItem: <T extends ResourceItem>(resource: ResourceName, id: string) =>
    apiRequest<T>(`/api/${resource}/${encodeURIComponent(id)}`),
};
