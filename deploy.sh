#!/bin/bash

# Music Player Deployment Script
# Usage: ./deploy.sh [server-ip]

set -e

SERVER_IP=${1:-}
PROJECT_NAME="music-player"
DEPLOY_DIR="/opt/$PROJECT_NAME"

if [ -z "$SERVER_IP" ]; then
    echo "Usage: ./deploy.sh <server-ip>"
    echo "Example: ./deploy.sh 123.456.789.0"
    exit 1
fi

echo "🚀 Starting deployment to $SERVER_IP..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf deploy.tar.gz \
    Dockerfile \
    docker-compose.yml \
    nginx.conf \
    .env.production \
    server/ \
    dist/

# Copy to server
echo "📤 Uploading to server..."
scp deploy.tar.gz root@$SERVER_IP:/tmp/

# Deploy on server
echo "🔧 Deploying on server..."
ssh root@$SERVER_IP << 'EOF'
    DEPLOY_DIR="/opt/music-player"
    
    # Create directory
    mkdir -p $DEPLOY_DIR
    cd $DEPLOY_DIR
    
    # Extract files
    tar -xzf /tmp/deploy.tar.gz
    
    # Create environment file
    cat > .env << 'ENVFILE'
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_super_secret_jwt_key_here
ENVFILE
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Build and start
    docker-compose up -d --build
    
    # Initialize database
    sleep 5
    docker-compose exec -T app node scripts/init-db.js
    
    # Cleanup
    rm /tmp/deploy.tar.gz
    
    echo "✅ Deployment completed!"
    echo "🌐 Website: http://$SERVER_IP"
    echo "🔧 API: http://$SERVER_IP/api"
EOF

# Cleanup local
echo "🧹 Cleaning up..."
rm deploy.tar.gz

echo "✅ Deployment finished!"
echo "🌐 Your website is now live at: http://$SERVER_IP"
