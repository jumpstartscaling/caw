#!/bin/bash
# Safe deployment script for Jumpstart Scaling
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Jumpstart Scaling - Safe Deployment Script"
echo "=============================================="

# Configuration
SERVER="opc@193.122.168.215"
SSH_KEY="~/.ssh/id_rsa"
PROD_DIR="/home/opc/sites/jumpstartscaling"
BACKUP_DIR="/home/opc/sites"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Step 1: Create backup
echo ""
echo "📦 Step 1: Creating backup..."
ssh -i $SSH_KEY $SERVER "cd $PROD_DIR && tar -czf $BACKUP_DIR/jumpstartscaling-backup-$TIMESTAMP.tar.gz dist/ server.js package.json"
echo "✅ Backup created: jumpstartscaling-backup-$TIMESTAMP.tar.gz"

# Step 2: Upload new source files
echo ""
echo "📤 Step 2: Uploading source files and dependencies..."
scp -i $SSH_KEY package.json package-lock.json $SERVER:$PROD_DIR/
scp -i $SSH_KEY -r src/* $SERVER:$PROD_DIR/src/
echo "✅ Source files & dependencies uploaded"

# Step 3: Rebuild on server
echo ""
echo "🔨 Step 3: Installing dependencies & Building..."
ssh -i $SSH_KEY $SERVER "cd $PROD_DIR && npm install && npm run build"
echo "✅ Build complete"

# Step 4: Restart PM2 process
echo ""
echo "🔄 Step 4: Restarting production server..."
ssh -i $SSH_KEY $SERVER "pm2 restart jumpstart-v2"
echo "✅ Server restarted"

# Step 5: Verify
echo ""
echo "🔍 Step 5: Verifying deployment..."
sleep 3
RESPONSE=$(ssh -i $SSH_KEY $SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost:8100/")

if [ "$RESPONSE" = "200" ]; then
    echo "✅ Deployment successful! Site is responding with HTTP 200"
    echo ""
    echo "🌐 Live at: https://jumpstartscaling.com"
    echo "📊 Backup: jumpstartscaling-backup-$TIMESTAMP.tar.gz"
else
    echo "❌ Warning: Site returned HTTP $RESPONSE"
    echo "🔙 Consider rolling back if needed"
    echo ""
    echo "Rollback command:"
    echo "ssh $SERVER 'cd $PROD_DIR && tar -xzf $BACKUP_DIR/jumpstartscaling-backup-$TIMESTAMP.tar.gz && pm2 restart jumpstart-v2'"
fi

echo ""
echo "=============================================="
echo "Deployment complete!"
