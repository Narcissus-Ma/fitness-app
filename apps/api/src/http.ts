export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const json = <T>(body: ApiResponse<T>, init: ResponseInit = {}, origin = '*'): Response => {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

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
