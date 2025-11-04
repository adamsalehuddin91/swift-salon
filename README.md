# 🌟 SwiftSalon Muslimah - Professional Salon Management System

A comprehensive Next.js-based salon management system designed for Muslim-friendly beauty salons, featuring booking management, customer loyalty programs, and business analytics.

## 🚀 Features

- **👥 Customer Management** - Complete customer profiles with booking history
- **📅 Booking System** - Advanced scheduling with staff assignment
- **💰 Point-based Loyalty** - Reward system with redemption options
- **👩‍💼 Staff Management** - Staff scheduling and performance tracking
- **📊 Business Analytics** - Revenue tracking and service popularity insights
- **🔐 Admin Dashboard** - Secure administrative interface
- **📱 Mobile-Responsive** - Works seamlessly on all devices
- **🔄 Real-time Updates** - Live booking and payment status updates

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript 5.9.3
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with custom middleware
- **Styling**: TailwindCSS with custom components
- **State Management**: Zustand
- **Deployment**: Docker containerized deployment

## 🔧 Getting Started

### Prerequisites

- Node.js 18.0+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Environment Setup

1. **Clone the repository:**
```bash
git clone https://github.com/adamsalehuddin91/swift-salon.git
cd swift-salon
```

2. **Create environment file:**
```bash
cp .env.example .env
```

3. **Update environment variables:**
```env
# Required: Set secure database password
POSTGRES_PASSWORD=your_secure_database_password

# Required: Set admin credentials
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=your_secure_admin_password

# Required: Set NextAuth secret (32+ characters)
NEXTAUTH_SECRET=your_32_character_secret_key_here

# Update URLs for production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
```

### 🐳 Docker Deployment (Recommended)

```bash
# Start the application
docker-compose up -d

# Create admin user (first time only)
docker exec -it swift-salon_app_1 npm run db:seed

# View logs
docker-compose logs -f app
```

### 💻 Local Development

```bash
# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔐 Security Features

✅ **Environment-based Configuration** - No hardcoded credentials
✅ **Secure Session Management** - Timestamped cookie validation
✅ **API Authentication** - Protected endpoints with middleware
✅ **Role-based Access Control** - Admin/staff/customer permissions
✅ **Production-ready** - Security hardened for deployment

## 📚 Documentation

- [**Setup Guide**](./SETUP_GUIDE.md) - Detailed installation instructions
- [**Production Deployment**](./PRODUCTION_DEPLOYMENT.md) - Server deployment guide
- [**Feature Summary**](./FEATURES_SUMMARY.md) - Complete feature overview
- [**System Access Guide**](./SYSTEM_ACCESS_GUIDE.md) - Admin access documentation

## 🏗️ Project Structure

```
swift-salon/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── api/            # API routes
│   │   └── [pages]/        # Customer-facing pages
│   ├── components/         # Reusable UI components
│   ├── lib/               # Utilities and configurations
│   └── types/             # TypeScript definitions
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── [config files]
```

## 🚦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed initial data
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

## 🔑 Default Admin Access

After running `npm run db:seed`:
- **Email**: Set via `ADMIN_EMAIL` environment variable
- **Password**: Set via `ADMIN_PASSWORD` environment variable
- **Login URL**: `/admin/login`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the SwiftApps ecosystem - Professional business management solutions.

## 🆘 Support

For deployment and configuration support, refer to the documentation files or create an issue in the repository.

---

**🌟 SwiftSalon Muslimah** - Empowering Muslim-friendly beauty businesses with modern technology.