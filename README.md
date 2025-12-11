# KTS Backend - NestJS API Server

Backend API server cho ứng dụng KTS với PostgreSQL, Authentication, Payment Gateway và Google Gemini AI.

## ✨ Tính năng mới

### 🗄️ Database

- ✅ PostgreSQL database với Docker
- ✅ TypeORM for database management
- ✅ Database migrations
- ✅ Proper indexing và optimization

### 🔐 Authentication & Authorization

- ✅ JWT-based authentication
- ✅ User registration và login
- ✅ Password hashing với bcrypt
- ✅ Protected routes
- ✅ Email validation

### 💳 Payment Integration

- ✅ Sepay payment gateway integration
- ✅ Transaction management
- ✅ Balance tracking
- ✅ Webhook handler
- ✅ Transaction history

### 📊 History Tracking

- ✅ Track all Gemini API calls
- ✅ Cost tracking per action
- ✅ Performance metrics
- ✅ Filter và search
- ✅ Statistics dashboard

### 👤 User Profile

- ✅ Profile management
- ✅ Change password
- ✅ Update email
- ✅ Avatar support
- ✅ Balance viewing

### 🎨 Gemini AI Features

- ✅ RESTful API cho Gemini AI
- ✅ Multiple generation endpoints
- ✅ Image processing
- ✅ Error handling
- ✅ History integration ready

### 🛡️ Security & Best Practices

- ✅ Environment variables
- ✅ Input validation
- ✅ Global error handling
- ✅ Request logging
- ✅ CORS configuration
- ✅ TypeScript strict mode
- ✅ Type-safe code

## 📚 Documentation

- 📖 [Quick Start Guide](QUICK_START.md) - Bắt đầu nhanh trong 5 phút
- 📖 [Migration Guide](MIGRATION_GUIDE.md) - Hướng dẫn chi tiết về migration
- 📖 [API Documentation](API_DOCUMENTATION.md) - Tài liệu API đầy đủ
- 📖 [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Tổng quan implementation

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker-compose up -d

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Start development server
npm run start:dev
```

Server chạy tại `http://localhost:3001`

## 📦 Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL 16
- **ORM**: TypeORM 0.3
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **AI**: Google Gemini AI
- **Payment**: Sepay Integration
- **Language**: TypeScript 5

## 🗂️ Project Structure

```
kts-backend/
├── src/
│   ├── auth/           # Authentication module
│   │   ├── guards/     # JWT guards
│   │   ├── strategies/ # Passport strategies
│   │   └── dto/        # Auth DTOs
│   ├── user/           # User management
│   │   ├── entities/   # User entity
│   │   └── dto/        # User DTOs
│   ├── payment/        # Payment module
│   │   ├── entities/   # Transaction entity
│   │   └── dto/        # Payment DTOs
│   ├── history/        # History tracking
│   │   ├── entities/   # History entity
│   │   └── dto/        # History DTOs
│   ├── gemini/         # Gemini AI integration
│   ├── common/         # Shared code
│   │   ├── filters/    # Exception filters
│   │   ├── interceptors/ # Interceptors
│   │   ├── interfaces/ # Interfaces
│   │   ├── helpers/    # Helper utilities
│   │   └── enums/      # Enums
│   └── config/         # Configuration
├── docker-compose.yml  # PostgreSQL setup
├── .env.example        # Environment template
└── package.json        # Dependencies
```

## 🔧 Available Scripts

```bash
# Development
npm run start:dev       # Start with hot-reload

# Build
npm run build          # Build for production
npm run start:prod     # Start production

# Database
npm run migration:generate  # Generate migration
npm run migration:run       # Run migrations
npm run migration:revert    # Revert migration

# Code Quality
npm run lint           # ESLint
npm run format         # Prettier

# Testing
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage
```

- `GET /api/gemini/health` - Kiểm tra trạng thái server

### Image Description

- `POST /api/gemini/describe-interior` - Mô tả ảnh nội thất
- `POST /api/gemini/describe-masterplan` - Mô tả ảnh masterplan

### Image Generation

- `POST /api/gemini/generate-images` - Tạo ảnh từ sketch

## 📡 API Endpoints Overview

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### User Profile

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password
- `POST /api/user/update-email` - Update email
- `GET /api/user/balance` - Get account balance

### Payment

- `POST /api/payment/deposit` - Create deposit request
- `GET /api/payment/transactions` - Get transaction history
- `GET /api/payment/transactions/:id` - Get transaction detail
- `POST /api/payment/webhook/sepay` - Sepay webhook

### History

- `GET /api/history` - Get API usage history
- `GET /api/history/statistics` - Get usage statistics
- `GET /api/history/:id` - Get history detail
- `DELETE /api/history/:id` - Delete history

### Gemini AI (Existing)

- `POST /api/gemini/*` - All existing Gemini endpoints

**👉 See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference**

## 🗄️ Database Schema

### Users

- Basic info (email, password, name)
- Balance management
- Profile settings (phone, avatar)
- Account status

### Transactions

- Payment records
- Balance history
- Sepay integration
- Metadata tracking

### Gemini Histories

- API call tracking
- Cost per action
- Performance metrics
- Success/failure rates

## ⚙️ Environment Variables

```env
# Application
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=kts_user
DB_PASSWORD=kts_password
DB_DATABASE=kts_database

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# CORS
CORS_ORIGIN=http://localhost:3000

# Sepay (Optional - for payment integration)
# Lấy từ: https://developer.sepay.vn → Cấu hình Công ty → API Access
SEPAY_API_KEY=your-api-key-here
SEPAY_API_SECRET=your-api-secret-here
SEPAY_ACCOUNT_NUMBER=your-sepay-account-number
SEPAY_MERCHANT_ID=your-merchant-id-here
SEPAY_WEBHOOK_SECRET=your-webhook-secret-here
# API Base URL (mặc định: https://api.sepay.vn/v1)
SEPAY_API_URL=https://api.sepay.vn/v1
# Frontend URL for payment redirects
FRONTEND_URL=http://localhost:3000
```

## 🔒 Security

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ CORS configuration
- ✅ Environment variables
- ✅ No sensitive data in errors
- ✅ Database transactions
- ✅ Prepared statements (SQL injection prevention)

## 🚢 Deployment

### Local Development

```bash
docker-compose up -d
npm run start:dev
```

### Production

1. **Build the application**

```bash
npm run build
```

2. **Setup PostgreSQL** (Railway, Supabase, AWS RDS, etc.)

3. **Set environment variables**

```bash
NODE_ENV=production
DB_HOST=your-db-host
DB_PORT=5432
# ... other vars
```

4. **Run migrations**

```bash
npm run migration:run
```

5. **Start server**

```bash
npm run start:prod
```

### Docker Deployment

```bash
# Build image
docker build -t kts-backend .

# Run container
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  kts-backend
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📊 Monitoring

- Request logging với LoggingInterceptor
- Error tracking với AllExceptionsFilter
- Performance metrics trong history
- Transaction tracking

## 🤝 Contributing

1. Create feature branch
2. Write tests
3. Follow coding standards
4. Submit pull request

## 📄 License

Private - All rights reserved

## 👥 Support

- 📧 Email: support@kts.com
- 📖 Documentation: See docs folder
- 🐛 Issues: GitHub Issues

---

**Made with ❤️ using NestJS**

```bash
# Set environment variables
# Deploy từ GitHub repository
```

## 📚 Tech Stack

- **Framework**: NestJS 11.x
- **Runtime**: Node.js
- **Language**: TypeScript
- **AI SDK**: @google/genai
- **Validation**: class-validator, class-transformer
- **Config**: @nestjs/config

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
