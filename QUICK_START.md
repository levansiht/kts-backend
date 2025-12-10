# 🚀 Quick Start Guide

## Prerequisites

- Node.js >= 18
- Docker Desktop
- Git

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd kts/kts-backend
npm install
```

### 2. Start PostgreSQL Database

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify container is running
docker ps

# You should see: kts-postgres running on port 5432
```

### 3. Setup Environment Variables

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` file:

```env
# Update these values
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=kts_user
DB_PASSWORD=kts_password
DB_DATABASE=kts_database

JWT_SECRET=change-this-to-a-secure-random-string-min-32-chars
GEMINI_API_KEY=your-actual-gemini-api-key

# Optional - for Sepay integration later
SEPAY_API_KEY=
SEPAY_API_SECRET=
SEPAY_ACCOUNT_NUMBER=
SEPAY_WEBHOOK_SECRET=
```

### 4. Start Development Server

```bash
npm run start:dev
```

You should see:

```
🚀 Server is running on: http://localhost:3001
📝 Environment: development
```

### 5. Test API

Open a new terminal and test:

```bash
# Test health check
curl http://localhost:3001

# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## 📁 Project Structure

```
kts-backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── user/           # User profile management
│   ├── payment/        # Payment & transactions
│   ├── history/        # API history tracking
│   ├── gemini/         # Gemini AI integration
│   ├── common/         # Shared utilities
│   └── config/         # Configuration files
├── docker-compose.yml  # PostgreSQL container
├── .env.example        # Environment template
└── package.json        # Dependencies
```

## 🎯 Available Scripts

```bash
# Development
npm run start:dev       # Start with hot-reload

# Build
npm run build          # Build for production

# Production
npm run start:prod     # Start production server

# Database
npm run migration:generate  # Generate migration
npm run migration:run       # Run migrations
npm run migration:revert    # Revert last migration

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format with Prettier

# Testing
npm run test          # Run unit tests
npm run test:e2e      # Run e2e tests
npm run test:cov      # Test coverage
```

## 🔍 Verify Installation

### Check Database Connection

```bash
# Connect to PostgreSQL container
docker exec -it kts-postgres psql -U kts_user -d kts_database

# List tables (should show users, transactions, gemini_histories)
\dt

# Exit
\q
```

### Check API Endpoints

Visit these URLs (or use Postman/Insomnia):

- Health Check: `http://localhost:3001`
- API Prefix: `http://localhost:3001/api/`

## 🐛 Troubleshooting

### PostgreSQL container not starting

```bash
# Check container logs
docker logs kts-postgres

# Restart container
docker-compose restart

# If port 5432 is busy, change it in docker-compose.yml
```

### Database connection error

1. Check if PostgreSQL container is running: `docker ps`
2. Verify `.env` credentials match `docker-compose.yml`
3. Check logs: `docker logs kts-postgres`

### Port 3001 already in use

Change `PORT` in `.env`:

```env
PORT=3002
```

### Module not found errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Read API Documentation**: See `API_DOCUMENTATION.md`
2. **Review Migration Guide**: See `MIGRATION_GUIDE.md`
3. **Setup Sepay**: When ready for payments
4. **Integrate with Frontend**: Update API URLs in React app

## 🔐 Security Notes

**Before Production:**

1. Change `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Disable `synchronize` in TypeORM (use migrations)
4. Setup proper CORS origins
5. Enable HTTPS
6. Use strong database passwords
7. Setup rate limiting

## 📞 Need Help?

- Check `MIGRATION_GUIDE.md` for detailed setup
- See `API_DOCUMENTATION.md` for API usage
- Review `IMPLEMENTATION_SUMMARY.md` for overview

## ✅ Quick Checklist

- [ ] Node.js installed
- [ ] Docker running
- [ ] Dependencies installed (`npm install`)
- [ ] PostgreSQL container running (`docker ps`)
- [ ] `.env` file configured
- [ ] Server starts successfully
- [ ] Can register/login via API
- [ ] Database tables created

---

**Ready to go!** 🎉

Your backend is now running with PostgreSQL, authentication, payments, and history tracking!
