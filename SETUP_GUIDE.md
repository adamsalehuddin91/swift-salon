# 🚀 SwiftSalon POC Setup Guide
### Complete Development Environment Setup

---

## 📋 **Quick Setup Checklist**

### **1. Dependencies Installation**
```bash
# Navigate to project directory
cd swift-salon

# Clean install (if npm issues occur)
rm -rf node_modules package-lock.json
npm cache clean --force

# Install dependencies
npm install

# Install additional Supabase dependencies
npm install @supabase/ssr @supabase/supabase-js
npm install @tanstack/react-query @tanstack/react-table
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
npm install jspdf

# Development dependencies
npm install @types/node @types/react @types/react-dom --save-dev
```

### **2. Supabase Project Setup**
```bash
# Go to https://supabase.com
# Create new project: "swiftsalon-poc"
# Note down:
# - Project URL
# - Anon key
# - Service role key
# - Database password
```

### **3. Environment Configuration**
Update `.env` file with your Supabase credentials:
```env
# Database (Replace with your Supabase values)
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR_SERVICE_ROLE_KEY]"
```

### **4. Database Migration**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push

# Seed initial data
npm run db:seed
```

### **5. Development Server**
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

---

## 🛠️ **Advanced Configuration**

### **Supabase Authentication Setup**
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable Email authentication
3. Configure redirect URLs:
   - `http://localhost:3000/api/auth/callback`
   - `https://your-domain.com/api/auth/callback` (production)

### **Row Level Security (RLS) Policies**
Run in Supabase SQL Editor:
```sql
-- Enable RLS on all tables
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- Sample policy (allow authenticated users)
CREATE POLICY "Allow authenticated users" ON "Customer"
FOR ALL USING (auth.role() = 'authenticated');
```

### **WhatsApp Business API Setup** (Optional for POC)
1. Meta Business Account setup
2. WhatsApp Business verification
3. API access token generation
4. Phone number verification

### **Payment Gateway Integration** (Phase 2)
1. Billplz merchant account
2. API key configuration
3. Webhook endpoint setup

---

## 📱 **Hardware Requirements for POC Salon**

### **Essential Hardware**
- **Android Tablet**: Samsung Galaxy Tab A8 or similar (RM800-1,200)
- **Bluetooth Receipt Printer**: Epson TM-T20III (RM300-500)
- **QR Code Standees**: A4 acrylic stands (RM100-200)

### **Network Requirements**
- **Internet Connection**: Minimum 10 Mbps for real-time sync
- **WiFi**: WPA2 secured network for salon operations
- **Backup Connection**: Mobile hotspot for redundancy

---

## 🧪 **Testing Strategy**

### **Unit Testing**
```bash
# Add testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Test commands
npm run test
npm run test:watch
```

### **End-to-End Testing**
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Run E2E tests
npm run test:e2e
```

### **Manual Testing Checklist**
- [ ] Customer registration and login
- [ ] Service booking flow
- [ ] Payment processing
- [ ] Staff management
- [ ] Point earning/redemption
- [ ] WhatsApp notifications (when integrated)

---

## 🚀 **Deployment Guide**

### **Option 1: Proxmox LXC Docker Deployment (Recommended for POC)**

#### **LXC Container Setup**
```bash
# Access your Proxmox Docker LXC container
pct enter [CONTAINER_ID]

# Update system
apt update && apt upgrade -y

# Ensure Docker and Docker Compose are installed
docker --version
docker-compose --version
```

#### **Project Deployment on Proxmox**
```bash
# Clone project to LXC container
cd /opt
git clone [YOUR_REPOSITORY_URL] swiftsalon-poc
cd swiftsalon-poc

# Copy and configure environment file
cp .env .env.backup
# Edit database credentials (PostgreSQL will run in container)
nano .env

# Create required directories
mkdir -p database/backups database/init nginx/ssl uploads logs
```

#### **Docker Configuration**
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  swiftsalon:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - DIRECT_URL=${DIRECT_URL}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    volumes:
      - ./public:/app/public
      - ./uploads:/app/uploads
    restart: unless-stopped
    networks:
      - swiftsalon-network

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - swiftsalon
    restart: unless-stopped
    networks:
      - swiftsalon-network

networks:
  swiftsalon-network:
    driver: bridge
```

#### **Dockerfile**
Create `Dockerfile`:
```dockerfile
# SwiftSalon Production Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### **Deployment Commands**
```bash
# Build and start all containers (PostgreSQL + App + Redis + Nginx)
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Database setup (first time)
# Wait for PostgreSQL to be ready
sleep 30
docker-compose exec swiftsalon npm run db:push
docker-compose exec swiftsalon npm run db:seed

# Database management commands
./database/manage-db.sh status    # Check database status
./database/manage-db.sh backup    # Create backup
./database/manage-db.sh migrate   # Run migrations
./database/manage-db.sh shell     # Open database shell

# Update deployment
git pull
docker-compose up -d --build
```

#### **Proxmox Network Configuration**
```bash
# In Proxmox host, configure port forwarding
# Edit LXC container config
nano /etc/pve/lxc/[CONTAINER_ID].conf

# Add network bridge
net0: name=eth0,bridge=vmbr0,firewall=1,ip=192.168.1.100/24,gw=192.168.1.1

# Configure firewall rules in Proxmox
# Allow ports 80, 443, 3000 for SwiftSalon access
```

#### **Nginx Reverse Proxy Setup**
Create `nginx/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream swiftsalon {
        server swiftsalon:3000;
    }

    server {
        listen 80;
        server_name your-salon-domain.com;

        # Redirect HTTP to HTTPS
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-salon-domain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        location / {
            proxy_pass http://swiftsalon;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API routes
        location /api/ {
            proxy_pass http://swiftsalon;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files caching
        location /_next/static/ {
            proxy_pass http://swiftsalon;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
    }
}
```

#### **SSL Certificate Setup**
```bash
# Option 1: Let's Encrypt (Recommended)
apt install certbot
certbot certonly --standalone -d your-salon-domain.com
cp /etc/letsencrypt/live/your-salon-domain.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/your-salon-domain.com/privkey.pem nginx/ssl/key.pem

# Option 2: Self-signed (Development)
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

#### **Database Management & Monitoring**
```bash
# Comprehensive database management
./database/manage-db.sh status     # Database status and statistics
./database/manage-db.sh backup     # Create compressed backup
./database/manage-db.sh restore    # Restore from backup
./database/manage-db.sh monitor    # Real-time activity monitoring
./database/manage-db.sh optimize   # Performance optimization
./database/manage-db.sh vacuum     # Database maintenance

# Automated daily backups
crontab -e
# Add this line for daily 2 AM backups
0 2 * * * cd /opt/swiftsalon-poc && ./database/backup-db.sh

# Monitor all services
docker-compose logs -f --tail=100
docker stats
htop

# Container health checks
docker-compose ps
docker-compose exec postgres pg_isready -U swiftsalon_user -d swiftsalon
docker-compose exec swiftsalon curl -f http://localhost:3000/api/health
```

#### **Self-Contained LXC Advantages**
- **Complete Independence**: PostgreSQL database included in container stack
- **Zero External Dependencies**: No Supabase or cloud database required
- **Cost Effective**: Free hosting with no monthly database fees
- **Full Data Control**: All customer data stays on your hardware
- **High Performance**: Local database with sub-millisecond latency
- **Simplified Backup**: Everything in one location for easy backup/restore
- **Development Speed**: Instant database access without internet dependency
- **Production Ready**: Can scale to handle multiple salon locations

---

### **Option 2: Vercel Deployment (Production)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### **Environment Variables (Production)**
Set in Vercel dashboard or Docker environment:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### **Deployment Comparison**

| Feature | Proxmox LXC (Self-Contained) | Vercel + Supabase |
|---------|------------------------------|-------------------|
| **Database** | PostgreSQL in container | Supabase PostgreSQL |
| **Monthly Cost** | Free (own hardware) | $20-50/month |
| **Setup Time** | 2-3 hours (one-time) | 30 minutes |
| **Data Control** | Complete ownership | Third-party hosted |
| **Performance** | Local network speed | Internet dependent |
| **Backup** | Local automated backups | Supabase backups |
| **Scalability** | Manual resource allocation | Auto-scaling |
| **Dependencies** | None (fully self-contained) | Internet + Supabase |
| **Best For** | POC + Production (SME) | Production (Enterprise) |
| **Maintenance** | Docker management | Platform managed |

---

## 🎯 **POC Success Metrics**

### **Week 1 Targets**
- [ ] System deployed and accessible
- [ ] Staff trained on basic operations
- [ ] First 5 customers registered
- [ ] 10 bookings processed

### **Week 2-4 Targets**
- [ ] 50+ total bookings processed
- [ ] Payment tracking 100% accurate
- [ ] Customer satisfaction > 90%
- [ ] Staff efficiency improvement documented

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### Database Connection Issues
```bash
# Check connection
npm run db:generate
npx prisma studio
```

#### Build Errors
```bash
# Type check
npm run type-check

# Clear Next.js cache
rm -rf .next
npm run build
```

#### Supabase Issues
- Verify API keys in environment
- Check RLS policies
- Validate database schema

### **Support Contacts**
- **Technical Issues**: Create GitHub issue
- **Supabase Support**: Supabase dashboard support
- **Payment Gateway**: Provider documentation

---

## 📋 **Next Development Phases**

### **Phase 2: Integration Enhancement**
- WhatsApp Business API integration
- Payment gateway implementation
- Advanced reporting dashboard

### **Phase 3: Mobile Optimization**
- PWA capabilities
- Offline functionality
- Mobile-specific UI improvements

### **Phase 4: Advanced Features**
- AI-powered scheduling
- Customer behavior analytics
- Multi-salon management

---

**🎯 Ready to launch SwiftSalon POC! Follow this guide step-by-step for successful deployment.**