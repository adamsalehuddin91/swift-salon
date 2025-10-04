# 🔄 SwiftSalon Proxmox/LXC Restart Guide

**For use after Proxmox host or LXC container restart**

---

## 🚀 Quick Start (Automatic)

### **Method 1: Using Restart Script (Recommended)**

```bash
# Navigate to project directory
cd /opt/swiftsalon-poc

# Make script executable (first time only)
chmod +x restart-production.sh

# Run the restart script
./restart-production.sh
```

This will automatically:
- ✅ Start Docker service
- ✅ Start PostgreSQL database
- ✅ Start SwiftSalon application
- ✅ Verify all services
- ✅ Run health checks

---

## 🔧 Manual Restart (Step-by-Step)

### **Step 1: Start Docker Service**

```bash
# Check Docker status
systemctl status docker

# If not running, start it
systemctl start docker

# Enable auto-start on boot
systemctl enable docker

# Verify it's running
systemctl is-active docker
```

**Expected output**: `active`

---

### **Step 2: Navigate to Project Directory**

```bash
cd /opt/swiftsalon-poc
```

---

### **Step 3: Start Services with Docker Compose**

#### **Option A: Start All Services Together**

```bash
# Start all services (database + app)
docker-compose up -d

# Check status
docker-compose ps
```

#### **Option B: Start Services Individually**

```bash
# Start PostgreSQL first
docker-compose up -d postgres

# Wait for database (30 seconds)
sleep 30

# Start application
docker-compose up -d app

# Check status
docker-compose ps
```

---

### **Step 4: Verify Services**

```bash
# Check all containers are running
docker-compose ps

# Should show:
# - postgres: Up
# - app: Up

# View logs
docker-compose logs --tail=50
```

---

## 📊 Service Status Checks

### **Check Individual Services**

```bash
# Check PostgreSQL
docker-compose ps postgres
docker-compose logs postgres --tail=20

# Check Application
docker-compose ps app
docker-compose logs app --tail=20
```

### **Check Application Health**

```bash
# Test local endpoint
curl http://localhost:3000

# Should return HTML or redirect (status 200/301/302)

# Check from external
curl https://demo.atokcloud.com
```

---

## 🔍 Troubleshooting

### **Problem 1: Docker Service Won't Start**

```bash
# Check Docker status
systemctl status docker

# View detailed logs
journalctl -u docker -n 50

# Try restarting
systemctl restart docker
```

### **Problem 2: PostgreSQL Container Fails**

```bash
# View database logs
docker-compose logs postgres

# Check if port is in use
netstat -tulpn | grep 5432

# Remove and recreate
docker-compose down
docker-compose up -d postgres
```

### **Problem 3: Application Container Fails**

```bash
# View application logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep DATABASE

# Restart application only
docker-compose restart app

# Rebuild if needed
docker-compose up -d --build app
```

### **Problem 4: Database Connection Issues**

```bash
# Test database from app container
docker-compose exec app npx prisma db pull

# Check database connectivity
docker-compose exec postgres psql -U swiftsalon_user -d swiftsalon_db -c "SELECT 1"

# Verify environment variables
cat .env | grep DATABASE_URL
```

### **Problem 5: Application Not Accessible**

```bash
# Check if app is listening
docker-compose exec app netstat -tulpn | grep 3000

# Check nginx/reverse proxy
systemctl status nginx

# Restart nginx if needed
systemctl restart nginx

# Check firewall
ufw status
ufw allow 3000/tcp
```

---

## 🛠️ Useful Commands

### **Service Management**

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app
docker-compose restart postgres
```

### **Log Monitoring**

```bash
# View all logs (live)
docker-compose logs -f

# View app logs only
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100

# View logs for specific service
docker-compose logs postgres --tail=50
```

### **Database Management**

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U swiftsalon_user -d swiftsalon_db

# Run Prisma commands
docker-compose exec app npx prisma studio
docker-compose exec app npx prisma db pull
docker-compose exec app npx prisma db push

# Backup database
docker-compose exec postgres pg_dump -U swiftsalon_user swiftsalon_db > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T postgres psql -U swiftsalon_user -d swiftsalon_db < backup.sql
```

### **Container Management**

```bash
# List all containers
docker ps -a

# Inspect container
docker inspect swiftsalon-poc_app_1

# Execute command in container
docker-compose exec app sh

# View resource usage
docker stats

# Clean up unused resources
docker system prune -a
```

---

## ⚙️ Auto-Start on Boot Setup

### **Enable Docker Auto-Start**

```bash
# Enable Docker to start on boot
systemctl enable docker

# Create systemd service for SwiftSalon
cat > /etc/systemd/system/swiftsalon.service << 'EOF'
[Unit]
Description=SwiftSalon Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/swiftsalon-poc
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
systemctl daemon-reload
systemctl enable swiftsalon.service

# Start the service
systemctl start swiftsalon.service

# Check status
systemctl status swiftsalon.service
```

### **Test Auto-Start**

```bash
# Reboot the system
reboot

# After reboot, check services
systemctl status swiftsalon
docker-compose ps
```

---

## 📋 Post-Restart Checklist

- [ ] Docker service is running: `systemctl status docker`
- [ ] PostgreSQL container is up: `docker-compose ps postgres`
- [ ] Application container is up: `docker-compose ps app`
- [ ] Database is accessible: `docker-compose exec app npx prisma db pull`
- [ ] Application responds: `curl http://localhost:3000`
- [ ] Production URL works: `curl https://demo.atokcloud.com`
- [ ] Admin panel accessible: https://demo.atokcloud.com/admin
- [ ] No errors in logs: `docker-compose logs --tail=50`

---

## 🔐 Service Credentials

### **PostgreSQL**
- **Database**: `swiftsalon_db`
- **User**: `swiftsalon_user`
- **Password**: `SwiftSalon2024!`
- **Port**: `5432`

### **Application**
- **Port**: `3000`
- **Production URL**: https://demo.atokcloud.com
- **Admin Email**: adamsalehuddin91@gmail.com
- **Admin Password**: (check your records)

---

## 🌐 Network Configuration

### **Firewall Rules**

```bash
# Allow necessary ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 3000/tcp # Application

# Enable firewall
ufw enable

# Check status
ufw status
```

### **Nginx Configuration** (if used)

```bash
# Check nginx status
systemctl status nginx

# Restart nginx
systemctl restart nginx

# Test configuration
nginx -t

# View nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 📈 Monitoring

### **Resource Usage**

```bash
# Docker resource usage
docker stats

# System resources
htop

# Disk usage
df -h

# Database size
docker-compose exec postgres psql -U swiftsalon_user -d swiftsalon_db -c "SELECT pg_size_pretty(pg_database_size('swiftsalon_db'))"
```

### **Log Files Locations**

- Application logs: `/opt/swiftsalon-poc/logs/`
- Docker logs: `docker-compose logs`
- Restart script log: `/var/log/swiftsalon-restart.log`
- Deployment log: `/var/log/swiftsalon-deploy.log`
- Nginx logs: `/var/log/nginx/`

---

## 🚨 Emergency Procedures

### **Complete Service Reset**

```bash
cd /opt/swiftsalon-poc

# Stop everything
docker-compose down

# Remove containers (keeps data)
docker-compose rm -f

# Restart fresh
docker-compose up -d

# Check status
docker-compose ps
```

### **Nuclear Option (Data Loss!)**

```bash
# ⚠️ WARNING: This will DELETE all data!

# Stop and remove everything
docker-compose down -v

# Remove all containers and volumes
docker system prune -a --volumes

# Rebuild from scratch
docker-compose up -d --build

# Re-run database migrations
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma db seed
```

---

## 📞 Support Contacts

- **System Admin**: Adam (adamsalehuddin91@gmail.com)
- **Production URL**: https://demo.atokcloud.com
- **Repository**: https://github.com/adamsalehuddin91/swift-salon

---

## 📝 Quick Reference

### **One-Line Commands**

```bash
# Full restart
cd /opt/swiftsalon-poc && ./restart-production.sh

# Quick check
docker-compose ps && curl -I http://localhost:3000

# View recent logs
docker-compose logs --tail=50 -f

# Restart app only
cd /opt/swiftsalon-poc && docker-compose restart app

# Full rebuild
cd /opt/swiftsalon-poc && docker-compose down && docker-compose up -d --build
```

---

**🎉 SwiftSalon should now be fully operational!**

**Last Updated**: 2025-10-04
**Version**: 1.0
**Tested On**: Proxmox LXC (Ubuntu 22.04)
