# Music Player 部署指南

## 系统要求

- Linux 服务器 (Ubuntu 20.04+ / CentOS 8+)
- Docker 20.10+
- Docker Compose 2.0+
- 域名 (可选，用于 HTTPS)

## 快速部署

### 1. 服务器准备

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 本地构建并部署

```bash
# 赋予执行权限
chmod +x deploy.sh

# 执行部署 (替换为你的服务器IP)
./deploy.sh 123.456.789.0
```

### 3. 手动部署

#### 3.1 构建前端

```bash
cd /workspace
npm install
npm run build
```

#### 3.2 上传文件到服务器

```bash
scp -r Dockerfile docker-compose.yml nginx.conf .env.production server/ dist/ root@123.456.789.0:/opt/music-player/
```

#### 3.3 服务器端配置

```bash
ssh root@123.456.789.0
cd /opt/music-player

# 创建环境变量文件
cat > .env << EOF
DB_PASSWORD=your_secure_password
JWT_SECRET=your_super_secret_key
EOF

# 启动服务
docker-compose up -d --build

# 初始化数据库
docker-compose exec app node scripts/init-db.js
```

## 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DB_PASSWORD` | PostgreSQL 密码 | 必填 |
| `JWT_SECRET` | JWT 签名密钥 | 必填 |
| `DB_HOST` | 数据库主机 | db |
| `DB_PORT` | 数据库端口 | 5432 |
| `DB_NAME` | 数据库名称 | music_player |
| `DB_USER` | 数据库用户 | postgres |
| `PORT` | 应用端口 | 3001 |
| `UPLOAD_DIR` | 上传目录 | uploads |
| `MAX_FILE_SIZE` | 最大文件大小 | 52428800 (50MB) |

### 目录结构

```
/opt/music-player/
├── docker-compose.yml    # Docker Compose 配置
├── Dockerfile            # Docker 构建文件
├── nginx.conf            # Nginx 配置
├── .env                  # 环境变量
├── server/               # 后端代码
│   ├── index.js
│   ├── config/
│   ├── routes/
│   └── scripts/
└── dist/                 # 前端构建产物
```

## 服务管理

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新部署
docker-compose up -d --build
```

## HTTPS 配置 (可选)

使用 Let's Encrypt 配置 HTTPS:

```bash
# 安装 certbot
docker run -it --rm \
  -v /opt/music-player/ssl:/etc/letsencrypt \
  -v /opt/music-player/nginx.conf:/etc/nginx/nginx.conf:ro \
  -p 80:80 \
  certbot/certbot certonly --standalone -d your-domain.com
```

修改 `nginx.conf` 启用 HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/your-domain.com/privkey.pem;
    
    # ... 其他配置
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 备份与恢复

### 数据库备份

```bash
# 备份
docker-compose exec db pg_dump -U postgres music_player > backup.sql

# 恢复
docker-compose exec -T db psql -U postgres music_player < backup.sql
```

### 文件备份

```bash
# 备份上传的文件
tar -czf uploads-backup.tar.gz uploads/
```

## 故障排查

### 查看容器日志

```bash
docker-compose logs app
docker-compose logs db
docker-compose logs nginx
```

### 进入容器

```bash
docker-compose exec app sh
docker-compose exec db psql -U postgres
```

### 重置数据库

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec app node scripts/init-db.js
```

## 性能优化

### 1. 启用 Gzip
已在 `nginx.conf` 中配置

### 2. 静态文件缓存
已在 `nginx.conf` 中配置 1 年缓存

### 3. 数据库优化
```sql
-- 连接池配置在 config/database.js 中
-- 默认最大连接数: 20
```

## 安全建议

1. **修改默认密码**: 务必修改 `DB_PASSWORD` 和 `JWT_SECRET`
2. **防火墙配置**: 只开放 80/443 端口
3. **定期更新**: 定期更新 Docker 镜像和依赖
4. **备份策略**: 设置自动备份任务

```bash
# 设置自动备份 (每天凌晨2点)
crontab -e
0 2 * * * cd /opt/music-player && docker-compose exec -T db pg_dump -U postgres music_player > backups/backup-$(date +\%Y\%m\%d).sql
```

## 访问网站

部署完成后，通过以下地址访问:

- **网站**: http://your-server-ip
- **API**: http://your-server-ip/api
- **健康检查**: http://your-server-ip/health
