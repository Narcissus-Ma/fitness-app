# 健康减脂百科

减肥科普类网站首版，包含健康状态评估、运动方法、食物热量、减脂菜谱、辅助药物科普和后台内容管理。

## 技术栈

- 前端：React、Vite、TypeScript、Ant Design、CSS Modules
- 后端：Cloudflare Workers、Workers KV
- 包管理：pnpm workspace

## 本地开发

```bash
pnpm install
pnpm api:dev
pnpm dev
```

前端本地环境读取 `apps/web/.env.development`：

```bash
VITE_API_BASE_URL=http://localhost:8787
```

后台默认本地密码在 `apps/api/wrangler.toml` 中配置为：

```bash
ADMIN_PASSWORD=请输入后台密码
```

登录后台后，侧边栏的“首页配置”可维护首页健康评估表单默认值，包括身高、体重、年龄、性别和活动水平。配置保存到 Workers KV，并通过公开接口 `GET /api/settings` 供前端首页读取。

## 后端 Wrangler 验证

上线前先启动 Worker 本地环境：

```bash
pnpm api:dev
```

验证接口：

```bash
curl -sS http://localhost:8787/api/health
curl -sS http://localhost:8787/api/exercises
```

确认公开查询、后台登录、CRUD、启用/停用和 KV 索引同步正常后，再部署 Worker。

## Cloudflare 部署

1. 创建 Workers KV 命名空间和 preview 命名空间。
2. 替换 `apps/api/wrangler.toml` 中的 `id` 与 `preview_id`。
3. 设置生产环境变量：`ADMIN_PASSWORD` 或 `sha256:<hash>`、`AUTH_SIGNING_SECRET`、`CORS_ORIGIN`。
   `CORS_ORIGIN` 支持逗号分隔多个前端域名，例如：

```bash
CORS_ORIGIN=https://你的前端.pages.dev,https://你的自定义域名
```

4. 执行 `pnpm --filter @fitness/api deploy` 部署后端。
5. 将 `apps/web/.env.production` 的 `VITE_API_BASE_URL` 改为线上 Worker 地址。
6. 执行 `pnpm --filter @fitness/web build`，并将 `apps/web/dist` 部署到 Cloudflare Pages。

## 验证命令

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

辅助药物栏目仅做科普信息展示，不提供个人用药建议。
