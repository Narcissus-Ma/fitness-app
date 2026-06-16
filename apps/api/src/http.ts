export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const resolveCorsOrigin = (request: Request, configuredOrigin = '*'): string => {
  const requestOrigin = request.headers.get('Origin');
  const allowedOrigins = configuredOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.includes('*')) return '*';
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) return requestOrigin;

  return allowedOrigins[0] || '*';
};

export const createCorsHeaders = (origin: string): Headers => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Vary', 'Origin');

  return headers;
};

export const json = <T>(body: ApiResponse<T>, init: ResponseInit = {}, origin = '*'): Response => {
  const headers = createCorsHeaders(origin);
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  headers.set('Content-Type', 'application/json; charset=utf-8');

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
};

export const readJson = async <T>(request: Request): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error('请求体必须是合法 JSON');
  }
};
