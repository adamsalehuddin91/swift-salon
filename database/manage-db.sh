#!/bin/bash

# SwiftSalon Database Management Script
# Comprehensive database operations for LXC deployment

set -e

# Configuration
DB_CONTAINER="swiftsalon-postgres"
DB_NAME="swiftsalon"
DB_USER="swiftsalon_user"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Show usage
usage() {
    echo "SwiftSalon Database Management Tool"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status      - Show database status and statistics"
    echo "  backup      - Create database backup"
    echo "  restore     - Restore from backup"
    echo "  migrate     - Run Prisma migrations"
    echo "  seed        - Seed database with initial data"
    echo "  reset       - Reset database (migrate + seed)"
    echo "  shell       - Open database shell"
    echo "  logs        - Show database logs"
    echo "  monitor     - Monitor database activity"
    echo "  optimize    - Optimize database performance"
    echo "  vacuum      - Vacuum and analyze database"
    echo ""
    exit 1
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running"
        exit 1
    fi
}

# Check if container is running
check_container() {
    if ! docker-compose ps | grep -q "$DB_CONTAINER.*Up"; then
        error "Database container is not running"
        echo "Start with: docker-compose up -d postgres"
        exit 1
    fi
}

# Database status
show_status() {
    log "Database Status"
    echo "=================="

    # Container status
    echo "Container Status:"
    docker-compose ps postgres
    echo ""

    # Database connection test
    echo "Connection Test:"
    if docker-compose exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        echo "✅ Database is accepting connections"
    else
        echo "❌ Database is not responding"
        return 1
    fi
    echo ""

    # Database size
    echo "Database Information:"
    docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT
        pg_database.datname as database_name,
        pg_size_pretty(pg_database_size(pg_database.datname)) as size
    FROM pg_database
    WHERE datname = '$DB_NAME';
    "

    # Table count
    echo "Table Statistics:"
    docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    "
}

# Create backup
create_backup() {
    log "Creating database backup..."
    ./database/backup-db.sh
}

# Restore backup
restore_backup() {
    log "Restoring database backup..."
    ./database/restore-db.sh "$1"
}

# Run migrations
run_migrations() {
    log "Running Prisma migrations..."
    docker-compose exec swiftsalon npm run db:migrate
}

# Seed database
seed_database() {
    log "Seeding database with initial data..."
    docker-compose exec swiftsalon npm run db:seed
}

# Reset database
reset_database() {
    warning "This will reset the entire database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log "Reset operation cancelled"
        return 0
    fi

    log "Resetting database..."
    docker-compose exec swiftsalon npm run db:reset
    seed_database
}

# Open database shell
open_shell() {
    log "Opening database shell..."
    docker-compose exec postgres psql -U "$DB_USER" -d "$DB_NAME"
}

# Show logs
show_logs() {
    log "Showing database logs..."
    docker-compose logs -f --tail=100 postgres
}

# Monitor database activity
monitor_activity() {
    log "Monitoring database activity (Press Ctrl+C to stop)..."
    while true; do
        clear
        echo "Database Activity Monitor - $(date)"
        echo "=================================="

        docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            pid,
            usename,
            application_name,
            client_addr,
            state,
            query_start,
            LEFT(query, 50) as current_query
        FROM pg_stat_activity
        WHERE datname = '$DB_NAME' AND state = 'active'
        ORDER BY query_start DESC;
        "

        sleep 5
    done
}

# Optimize database
optimize_database() {
    log "Optimizing database performance..."

    # Update statistics
    docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c "ANALYZE;"

    # Vacuum database
    docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c "VACUUM (ANALYZE, VERBOSE);"

    log "Database optimization completed"
}

# Vacuum database
vacuum_database() {
    log "Vacuuming database..."
    docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c "VACUUM (FULL, ANALYZE, VERBOSE);"
    log "Database vacuum completed"
}

# Main command handling
case "$1" in
    "status")
        check_docker
        check_container
        show_status
        ;;
    "backup")
        check_docker
        check_container
        create_backup
        ;;
    "restore")
        check_docker
        check_container
        restore_backup "$2"
        ;;
    "migrate")
        check_docker
        check_container
        run_migrations
        ;;
    "seed")
        check_docker
        check_container
        seed_database
        ;;
    "reset")
        check_docker
        check_container
        reset_database
        ;;
    "shell")
        check_docker
        check_container
        open_shell
        ;;
    "logs")
        check_docker
        show_logs
        ;;
    "monitor")
        check_docker
        check_container
        monitor_activity
        ;;
    "optimize")
        check_docker
        check_container
        optimize_database
        ;;
    "vacuum")
        check_docker
        check_container
        vacuum_database
        ;;
    *)
        usage
        ;;
esac