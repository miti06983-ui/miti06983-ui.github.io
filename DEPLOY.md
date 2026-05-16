# Music Player 部署指南

## 架构

- **前端**: GitHub Pages (免费静态托管)
- **后端**: Cloudflare Workers (免费边缘计算)
- **数据库**: Cloudflare D1 (免费 SQLite 数据库)

## 部署步骤

### 1. 准备工作

#### 注册账号
- [GitHub](https://github.com)
- [Cloudflare](https://dash.cloudflare.com)

#### 安装工具
```bash
# 安装 Node.js 20+
# https://nodejs.org

# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2. 部署后端 (Cloudflare Workers)

```bash
cd worker

# 安装依赖
npm install

# 创建 D1 数据库
wrangler d1 create music-player-db
# 记录输出的 database_id

# 更新 wrangler.toml 中的 database_id
# 编辑 wrangler.toml，替换 your-database-id-here

# 应用数据库迁移
wrangler d1 migrations apply music-player-db

# 部署 Worker
wrangler deploy

# 记录输出的 Worker URL，例如:
# https://music-player-api.your-subdomain.workers.dev
```

### 3. 配置 GitHub Actions

1. 在 GitHub 仓库设置中添加 Secrets:
   - `CF_WORKER_URL`: 你的 Worker URL (例如: `https://music-player-api.your-subdomain.workers.dev`)

2. 启用 GitHub Pages:
   - 仓库 Settings > Pages
   - Source: GitHub Actions

### 4. 部署前端

```bash
# 推送代码到 GitHub
git add .
git commit -m "Setup deployment"
git push origin main

# GitHub Actions 会自动构建并部署到 GitHub Pages
```

### 5. 验证部署

- **前端**: `https://your-username.github.io/music-player`
- **API**: `https://music-player-api.your-subdomain.workers.dev/health`

## 本地开发

### 启动后端
```bash
cd worker
npm run dev
# 运行在 http://localhost:8787
```

### 启动前端
```bash
cd /workspace
npm run dev
# 运行在 http://localhost:5173
```

## 项目结构

```
/workspace/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 部署配置
├── src/
│   ├── api/
│   │   └── client.ts           # API 客户端
│   ├── components/
│   ├── store/
│   └── ...
├── worker/                     # Cloudflare Worker 后端
│   ├── src/
│   │   ├── index.js            # 入口
│   │   └── routes/
│   │       ├── auth.js         # 认证路由
│   │       ├── tracks.js       # 音乐路由
│   │       ├── playlists.js    # 播放列表路由
│   │       └── settings.js     # 设置路由
│   ├── migrations/
│   │   └── 0001_initial.sql    # 数据库迁移
│   ├── wrangler.toml           # Worker 配置
│   └── package.json
└── DEPLOY.md                   # 本文件
```

## 费用说明

| 服务 | 免费额度 | 说明 |
|------|---------|------|
| GitHub Pages | 无限 | 静态网站托管 |
| Cloudflare Workers | 100,000 请求/天 | 边缘计算 |
| Cloudflare D1 | 5GB 存储 | SQLite 数据库 |

对于个人使用，免费额度完全足够。

## 故障排查

### Worker 部署失败
```bash
# 检查配置
wrangler config list

# 查看日志
wrangler tail
```

### 数据库问题
```bash
# 本地测试数据库
wrangler d1 execute music-player-db --local --file=./migrations/0001_initial.sql

# 查看数据库内容
wrangler d1 execute music-player-db --command="SELECT * FROM users"
```

### 前端 API 连接失败
1. 检查 `VITE_API_URL` 环境变量
2. 确认 Worker CORS 配置包含你的域名
3. 查看浏览器开发者工具 Network 面板

## 更新部署

### 更新后端
```bash
cd worker
# 修改代码后
wrangler deploy
```

### 更新前端
```bash
# 修改代码后推送到 GitHub
git add .
git commit -m "Update frontend"
git push origin main
# GitHub Actions 自动部署
```

## 自定义域名 (可选)

### Cloudflare Worker 自定义域名
1. Cloudflare Dashboard > Workers & Pages
2. 选择你的 Worker
3. Settings > Triggers > Custom Domains
4. 添加你的域名

### GitHub Pages 自定义域名
1. 仓库 Settings > Pages
2. Custom domain 输入你的域名
3. 添加 CNAME 记录指向 `your-username.github.io`
