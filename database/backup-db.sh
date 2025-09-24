#!/bin/bash

# SwiftSalon Database Backup Script
# Run from project root directory

set -e

# Configuration
PROJECT_NAME="swiftsalon"
DB_CONTAINER="swiftsalon-postgres"
DB_NAME="swiftsalon"
DB_USER="swiftsalon_user"
BACKUP_DIR="./database/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="swiftsalon_backup_${DATE}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

log "Starting SwiftSalon database backup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running"
    exit 1
fi

# Check if container exists and is running
if ! docker-compose ps | grep -q "$DB_CONTAINER.*Up"; then
    error "Database container is not running"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform database backup
log "Creating database backup: $BACKUP_FILE"
docker-compose exec -T postgres pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --verbose \
    --clean \
    --no-owner \
    --no-privileges \
    --format=custom \
    > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    log "Database backup completed successfully"

    # Compress backup
    log "Compressing backup file..."
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"

    # Get file size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log "Backup file size: $BACKUP_SIZE"

    # Create latest symlink
    ln -sf "$BACKUP_FILE" "$BACKUP_DIR/latest_backup.sql.gz"

else
    error "Database backup failed"
    exit 1
fi

# Clean up old backups (keep last 30 days)
log "Cleaning up old backups (keeping last 30 days)..."
find "$BACKUP_DIR" -name "swiftsalon_backup_*.sql.gz" -mtime +30 -delete

# Show backup summary
log "Backup Summary:"
echo "  File: $BACKUP_DIR/$BACKUP_FILE"
echo "  Size: $BACKUP_SIZE"
echo "  Date: $(date)"

# Optional: Upload to external storage
if [ ! -z "$BACKUP_UPLOAD_SCRIPT" ] && [ -f "$BACKUP_UPLOAD_SCRIPT" ]; then
    log "Uploading backup to external storage..."
    bash "$BACKUP_UPLOAD_SCRIPT" "$BACKUP_DIR/$BACKUP_FILE"
fi

log "Database backup process completed"