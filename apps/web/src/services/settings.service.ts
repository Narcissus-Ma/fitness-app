import type { SiteSettings } from '@fitness/shared';

import { apiRequest } from './api';

export const settingsService = {
  getPublic: () => apiRequest<SiteSettings>('/api/settings'),
  getAdmin: () => apiRequest<SiteSettings>('/api/admin/settings', { auth: true }),
  update: (payload: Partial<SiteSettings>) =>
    apiRequest<SiteSettings>('/api/admin/settings', {
      method: 'PUT',
      auth: true,
      body: JSON.stringify(payload),
    }),
};
