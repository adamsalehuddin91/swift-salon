#!/bin/bash

# SwiftSalon Proxmox Deployment Script
# Run this script on your Proxmox LXC container

set -e

echo "🚀 SwiftSalon Proxmox Deployment Starting..."

# Configuration
PROJECT_DIR="/opt/swiftsalon-poc"
BACKUP_DIR="/opt/backups/swiftsalon"
LOG_FILE="/var/log/swiftsalon-deploy.log"

# Create directories
mkdir -p $BACKUP_DIR
mkdir -p $(dirname $LOG_FILE)

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "Starting SwiftSalon deployment process"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log "Please run as root"
    exit 1
fi

# Update system
log "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
log "Installing required packages..."
apt install -y curl wget git htop nginx certbot

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    log "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    log "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create project directory
log "Setting up project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone or update project
if [ -d ".git" ]; then
    log "Updating existing project..."
    git pull origin main
else
    log "Cloning project repository..."
    # Replace with your actual repository URL
    git clone https://github.com/yourusername/swift-salon.git .
fi

# Create necessary directories
log "Creating application directories..."
mkdir -p nginx/ssl nginx/logs uploads logs

# Copy environment template if not exists
if [ ! -f ".env" ]; then
    log "Creating environment file..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        cat > .env << EOF
# SwiftSalon Environment Configuration
NODE_ENV=production
DATABASE_URL="postgresql://postgres:password@host:5432/postgres"
DIRECT_URL="postgresql://postgres:password@host:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
BUSINESS_NAME="SwiftSalon Muslimah"
WHATSAPP_NUMBER="+60123456789"
POINTS_PER_RINGGIT=1
EOF
    log "Please edit .env file with your actual configuration"
fi

# Generate SSL certificate if not exists
if [ ! -f "nginx/ssl/cert.pem" ]; then
    log "Generating self-signed SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=MY/ST=Selangor/L=KualaLumpur/O=SwiftSalon/CN=swiftsalon.local"
fi

# Set permissions
log "Setting file permissions..."
chown -R 1001:1001 uploads logs
chmod 755 nginx/ssl
chmod 600 nginx/ssl/*.pem

# Build and start services
log "Building Docker images..."
docker-compose build --no-cache

log "Starting services..."
docker-compose up -d

# Wait for services to be ready
log "Waiting for services to start..."
sleep 30

# Check service health
log "Checking service health..."
if docker-compose ps | grep -q "Up"; then
    log "✅ Services started successfully"
else
    log "❌ Some services failed to start"
    docker-compose logs
    exit 1
fi

# Run database migration
log "Running database migration..."
docker-compose exec -T swiftsalon npm run db:push || true
docker-compose exec -T swiftsalon npm run db:seed || true

# Setup cron job for backups
log "Setting up backup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/backup.sh") | crontab -

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/swiftsalon"
PROJECT_DIR="/opt/swiftsalon-poc"

cd $PROJECT_DIR

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T swiftsalon npm run db:backup > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*backup*" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Setup firewall rules
log "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable

# Display deployment information
log "🎉 SwiftSalon deployment completed successfully!"
echo
echo "=== Deployment Information ==="
echo "Project Directory: $PROJECT_DIR"
echo "Access URL: http://$(hostname -I | awk '{print $1}')"
echo "HTTPS URL: https://$(hostname -I | awk '{print $1}')"
echo "Portainer: http://$(hostname -I | awk '{print $1}'):9000"
echo
echo "=== Next Steps ==="
echo "1. Edit .env file with your Supabase credentials"
echo "2. Restart services: docker-compose restart"
echo "3. Set up your domain name and SSL certificate"
echo "4. Configure your salon data through the admin panel"
echo
echo "=== Useful Commands ==="
echo "View logs: docker-compose logs -f"
echo "Restart: docker-compose restart"
echo "Stop: docker-compose down"
echo "Update: git pull && docker-compose up -d --build"
echo
log "Deployment script finished"