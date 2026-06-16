import { describe, expect, it } from 'vitest';

import type { Env } from '../src/index';
import worker from '../src/index';

class MemoryKv {
  private readonly store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list() {
    return {
      keys: Array.from(this.store.keys()).map((name) => ({ name })),
      list_complete: true,
      cacheStatus: null,
    };
  }
}

const createEnv = (): Env => ({
  FITNESS_KV: new MemoryKv() as unknown as KVNamespace,
  ADMIN_PASSWORD: '请输入后台密码',
  AUTH_SIGNING_SECRET: 'test-secret',
  CORS_ORIGIN: 'http://localhost:5173',
});

const request = (path: string, init?: RequestInit) =>
  new Request(`https://api.example.com${path}`, init);

describe('Worker API', () => {
  it('根据请求 Origin 匹配多环境 CORS 配置并处理预检请求', async () => {
    const env = {
      ...createEnv(),
      CORS_ORIGIN: 'http://localhost:5173,https://fitness-web.pages.dev',
    };

    const response = await worker.fetch(
      request('/api/admin/login', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://fitness-web.pages.dev',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization',
        },
      }),
      env,
    );

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://fitness-web.pages.dev',
    );
    expect(response.headers.get('Vary')).toBe('Origin');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
  });

  it('返回健康检查和公开种子内容', async () => {
    const env = createEnv();

    const health = await worker.fetch(request('/api/health'), env);
    const exercises = await worker.fetch(request('/api/exercises'), env);

    expect(health.status).toBe(200);
    expect(await health.json()).toMatchObject({ data: { ok: true } });
    expect(exercises.status).toBe(200);
    const exerciseBody = (await exercises.json()) as { data: unknown[] };
    expect(exerciseBody.data.length).toBeGreaterThan(0);
  });

  it('公开读取首页健康评估默认配置，管理员可更新配置', async () => {
    const env = createEnv();

    const initial = await worker.fetch(request('/api/settings'), env);
    const initialBody = (await initial.json()) as {
      data: { assessmentDefaults: { heightCm: number } };
    };
    expect(initialBody.data.assessmentDefaults.heightCm).toBe(170);

    const login = await worker.fetch(
      request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password: '请输入后台密码' }),
      }),
      env,
    );
    const loginBody = (await login.json()) as { data: { token: string } };

    const updated = await worker.fetch(
      request('/api/admin/settings', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${loginBody.data.token}` },
        body: JSON.stringify({
          assessmentDefaults: {
            heightCm: 165,
            weightKg: 62,
            age: 28,
            gender: 'female',
            activityLevel: 'moderate',
          },
        }),
      }),
      env,
    );

    const publicSettings = await worker.fetch(request('/api/settings'), env);
    const publicBody = (await publicSettings.json()) as {
      data: { assessmentDefaults: { heightCm: number; activityLevel: string } };
    };

    expect(updated.status).toBe(200);
    expect(publicBody.data.assessmentDefaults.heightCm).toBe(165);
    expect(publicBody.data.assessmentDefaults.activityLevel).toBe('moderate');
  });

  it('拒绝未登录的后台写入请求', async () => {
    const env = createEnv();

    const response = await worker.fetch(
      request('/api/admin/exercises', {
        method: 'POST',
        body: JSON.stringify({ name: '快走' }),
      }),
      env,
    );

    expect(response.status).toBe(401);
  });

  it('登录后可以新增并下架运动条目', async () => {
    const env = createEnv();
    const login = await worker.fetch(
      request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password: '请输入后台密码' }),
      }),
      env,
    );
    const loginBody = (await login.json()) as { data: { token: string } };
    const token = loginBody.data.token;

    const created = await worker.fetch(
      request('/api/admin/exercises', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: '椭圆机训练',
          summary: '低冲击有氧训练',
          category: '有氧',
          difficulty: 'medium',
          methodSteps: ['保持身体稳定', '匀速踩踏 30 分钟'],
          durationMinutes: 30,
          metValue: 5,
          caloriesReference: 250,
          persistenceTips: ['每周安排 3 次'],
          contraindications: ['膝踝疼痛者先咨询医生'],
          tags: ['有氧'],
          sourceUrls: ['https://example.com'],
          status: 'enabled',
          sortOrder: 1,
        }),
      }),
      env,
    );
    const createdBody = (await created.json()) as { data: { id: string } };

    const disabled = await worker.fetch(
      request(`/api/admin/exercises/${createdBody.data.id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'disabled' }),
      }),
      env,
    );

    expect(created.status).toBe(201);
    expect(disabled.status).toBe(200);
  });
});
