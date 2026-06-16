import type { ResourceItem, SiteSettings } from '@fitness/shared';

import { getBearerToken, signToken, verifyPassword, verifyToken } from './auth';
import { createCorsHeaders, json, readJson, resolveCorsOrigin } from './http';
import {
  deleteItem,
  getItem,
  getSiteSettings,
  isResourceName,
  listItems,
  updateSiteSettings,
  upsertItem,
} from './storage';

export interface Env {
  FITNESS_KV: KVNamespace;
  ADMIN_PASSWORD: string;
  AUTH_SIGNING_SECRET: string;
  CORS_ORIGIN: string;
}

interface LoginBody {
  password?: string;
}

interface StatusBody {
  status?: 'enabled' | 'disabled';
}

const createId = (name: string) => {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^\da-z\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug || 'item'}-${crypto.randomUUID().slice(0, 8)}`;
};

const withTimestamps = <T extends Partial<ResourceItem>>(body: T, id?: string): ResourceItem => {
  const now = new Date().toISOString();
  const name = String(body.name ?? '').trim();
  if (!name) throw new Error('名称不能为空');

  return {
    ...body,
    id: id ?? String(body.id ?? createId(name)),
    name,
    summary: String(body.summary ?? ''),
    tags: Array.isArray(body.tags) ? body.tags : [],
    status: body.status === 'disabled' ? 'disabled' : 'enabled',
    sortOrder: Number(body.sortOrder ?? 100),
    sourceUrls: Array.isArray(body.sourceUrls) ? body.sourceUrls : [],
    createdAt: String(body.createdAt ?? now),
    updatedAt: now,
  } as ResourceItem;
};

const isAdminRequest = async (request: Request, env: Env): Promise<boolean> => {
  const token = getBearerToken(request);
  return token ? verifyToken(token, env.AUTH_SIGNING_SECRET) : false;
};

const handleAdmin = async (request: Request, env: Env, parts: string[], origin: string) => {
  if (parts[2] === 'login' && request.method === 'POST') {
    const body = await readJson<LoginBody>(request);
    if (!body.password || !(await verifyPassword(body.password, env.ADMIN_PASSWORD))) {
      return json({ error: '密码错误' }, { status: 401 }, origin);
    }

    return json({ data: { token: await signToken(env.AUTH_SIGNING_SECRET) } }, {}, origin);
  }

  if (!(await isAdminRequest(request, env))) {
    return json({ error: '未登录或登录已过期' }, { status: 401 }, origin);
  }

  if (parts[2] === 'settings') {
    if (request.method === 'GET') {
      return json({ data: await getSiteSettings(env.FITNESS_KV) }, {}, origin);
    }
    if (request.method === 'PUT') {
      const body = await readJson<Partial<SiteSettings>>(request);
      return json({ data: await updateSiteSettings(env.FITNESS_KV, body) }, {}, origin);
    }
    return json({ error: '方法不支持' }, { status: 405 }, origin);
  }

  const resource = parts[2];
  if (!resource || !isResourceName(resource)) {
    return json({ error: '资源不存在' }, { status: 404 }, origin);
  }

  const id = parts[3] ? decodeURIComponent(parts[3]) : undefined;

  if (request.method === 'GET' && !id) {
    return json({ data: await listItems(env.FITNESS_KV, resource, true) }, {}, origin);
  }

  if (request.method === 'POST' && !id) {
    const body = await readJson<Partial<ResourceItem>>(request);
    const item = withTimestamps(body);
    return json(
      { data: await upsertItem(env.FITNESS_KV, resource, item) },
      { status: 201 },
      origin,
    );
  }

  if (request.method === 'PUT' && id) {
    const existing = await getItem(env.FITNESS_KV, resource, id, true);
    const body = await readJson<Partial<ResourceItem>>(request);
    const item = withTimestamps({ ...existing, ...body, id }, id);
    return json({ data: await upsertItem(env.FITNESS_KV, resource, item) }, {}, origin);
  }

  if (request.method === 'DELETE' && id) {
    await deleteItem(env.FITNESS_KV, resource, id);
    return json({ data: { ok: true } }, {}, origin);
  }

  if (request.method === 'PATCH' && id && parts[4] === 'status') {
    const body = await readJson<StatusBody>(request);
    if (body.status !== 'enabled' && body.status !== 'disabled') {
      return json({ error: '状态不合法' }, { status: 400 }, origin);
    }
    const existing = await getItem(env.FITNESS_KV, resource, id, true);
    if (!existing) return json({ error: '内容不存在' }, { status: 404 }, origin);
    return json(
      {
        data: await upsertItem(env.FITNESS_KV, resource, {
          ...existing,
          status: body.status,
          updatedAt: new Date().toISOString(),
        }),
      },
      {},
      origin,
    );
  }

  return json({ error: '方法不支持' }, { status: 405 }, origin);
};

const handlePublic = async (request: Request, env: Env, parts: string[], origin: string) => {
  if (parts[1] === 'health') {
    return json({ data: { ok: true, service: 'fitness-api' } }, {}, origin);
  }

  if (parts[1] === 'settings') {
    if (request.method !== 'GET') return json({ error: '方法不支持' }, { status: 405 }, origin);
    return json({ data: await getSiteSettings(env.FITNESS_KV) }, {}, origin);
  }

  const resource = parts[1];
  if (!resource || !isResourceName(resource)) {
    return json({ error: '资源不存在' }, { status: 404 }, origin);
  }

  const id = parts[2] ? decodeURIComponent(parts[2]) : undefined;
  if (request.method !== 'GET') return json({ error: '方法不支持' }, { status: 405 }, origin);

  if (id) {
    const item = await getItem(env.FITNESS_KV, resource, id);
    return item
      ? json({ data: item }, {}, origin)
      : json({ error: '内容不存在' }, { status: 404 }, origin);
  }

  return json({ data: await listItems(env.FITNESS_KV, resource) }, {}, origin);
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = resolveCorsOrigin(request, env.CORS_ORIGIN || '*');
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: createCorsHeaders(origin),
      });
    }

    try {
      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] !== 'api') return json({ error: '接口不存在' }, { status: 404 }, origin);
      if (parts[1] === 'admin') return handleAdmin(request, env, parts, origin);
      return handlePublic(request, env, parts, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : '服务器错误';
      return json({ error: message }, { status: 500 }, origin);
    }
  },
};
