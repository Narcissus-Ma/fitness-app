import type { ResourceItem, ResourceName } from '@fitness/shared';

import { apiRequest, authToken } from './api';

export const adminService = {
  login: async (password: string) => {
    const result = await apiRequest<{ token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    authToken.set(result.token);
    return result;
  },
  list: <T extends ResourceItem>(resource: ResourceName) =>
    apiRequest<T[]>(`/api/admin/${resource}`, { auth: true }),
  create: <T extends ResourceItem>(resource: ResourceName, payload: Partial<T>) =>
    apiRequest<T>(`/api/admin/${resource}`, {
      method: 'POST',
      auth: true,
      body: JSON.stringify(payload),
    }),
  update: <T extends ResourceItem>(resource: ResourceName, id: string, payload: Partial<T>) =>
    apiRequest<T>(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      auth: true,
      body: JSON.stringify(payload),
    }),
  remove: (resource: ResourceName, id: string) =>
    apiRequest<{ ok: boolean }>(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    }),
  setStatus: (resource: ResourceName, id: string, status: 'enabled' | 'disabled') =>
    apiRequest<ResourceItem>(`/api/admin/${resource}/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({ status }),
    }),
  logout: authToken.clear,
};
