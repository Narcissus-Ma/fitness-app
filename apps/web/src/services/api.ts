import { config } from '@/config';

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const tokenKey = 'fitness_admin_token';

export const authToken = {
  get: () => localStorage.getItem(tokenKey),
  set: (token: string) => localStorage.setItem(tokenKey, token),
  clear: () => localStorage.removeItem(tokenKey),
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.auth) {
    const token = authToken.get();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });
  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(body.error || '请求失败，请稍后重试');
  }

  return body.data as T;
};
