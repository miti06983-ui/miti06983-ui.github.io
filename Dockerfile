# 构建前端
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 构建后端
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY server/package*.json ./
RUN npm ci
COPY server/ .

# 生产环境
FROM node:20-alpine AS production
WORKDIR /app

# 安装生产依赖
COPY server/package*.json ./
RUN npm ci --only=production

# 复制后端代码
COPY server/ .

# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist ./public

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# 启动命令
CMD ["node", "index.js"]
