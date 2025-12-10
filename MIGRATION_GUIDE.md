# KTS Backend - PostgreSQL Migration Guide

## Tổng quan thay đổi

Backend đã được migrate từ SQLite sang PostgreSQL và implement các tính năng mới:

### 1. Database Migration

- ✅ Chuyển từ SQLite sang PostgreSQL
- ✅ Setup Docker cho PostgreSQL
- ✅ Cấu hình TypeORM với PostgreSQL

### 2. Cấu trúc Response Chuẩn

```typescript
{
  statusCode: number,
  message: string,
  data?: any
}
```

### 3. Modules Mới

#### Payment Module

- Tích hợp cổng thanh toán Sepay
- Quản lý giao dịch nạp tiền
- Quản lý số dư người dùng
- Webhook handler cho Sepay

#### History Module

- Lưu lịch sử các API calls Gemini
- Hỗ trợ filter và search
- Thống kê sử dụng
- Chi phí theo action

#### User Profile Module

- Quản lý thông tin cá nhân
- Đổi mật khẩu
- Cập nhật email
- Xem số dư tài khoản

### 4. Auth Module Improvements

- Error handling tốt hơn
- Không bắn lỗi 500 ra client
- Validation email format
- Check account status

## Setup Instructions

### 1. Cài đặt dependencies

```bash
cd kts/kts-backend
npm install
```

### 2. Setup PostgreSQL với Docker

```bash
# Start PostgreSQL container
docker-compose up -d

# Check if container is running
docker ps
```

### 3. Cấu hình Environment Variables

Copy `.env.example` sang `.env` và cập nhật:

```bash
cp .env.example .env
```

Cập nhật các giá trị trong `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=kts_user
DB_PASSWORD=kts_password
DB_DATABASE=kts_database

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Sepay (khi có tài khoản)
SEPAY_API_KEY=your-sepay-api-key
SEPAY_API_SECRET=your-sepay-api-secret
SEPAY_ACCOUNT_NUMBER=your-sepay-account
SEPAY_WEBHOOK_SECRET=your-webhook-secret
```

### 4. Run Development Server

```bash
npm run start:dev
```

## Database Schema

### Users Table

```sql
- id (uuid, primary key)
- email (unique)
- password (hashed)
- firstName
- lastName
- balance (decimal)
- phoneNumber
- avatar
- isActive
- createdAt
- updatedAt
```

### Transactions Table

```sql
- id (uuid, primary key)
- userId (foreign key)
- type (deposit/withdrawal/payment/refund)
- status (pending/completed/failed/cancelled)
- amount
- balanceBefore
- balanceAfter
- provider (sepay/manual)
- externalTransactionId
- description
- metadata (jsonb)
- createdAt
- updatedAt
```

### Gemini Histories Table

```sql
- id (uuid, primary key)
- userId (foreign key)
- actionType (enum)
- prompt
- sourceImageUrl
- resultImageUrl
- resultText
- parameters (jsonb)
- metadata (jsonb)
- isSuccess
- errorMessage
- processingTimeMs
- cost
- createdAt
```

## API Endpoints

### Authentication

```
POST /api/auth/register - Đăng ký tài khoản
POST /api/auth/login - Đăng nhập
POST /api/auth/logout - Đăng xuất
GET  /api/auth/me - Lấy thông tin user hiện tại
```

### User Profile

```
GET  /api/user/profile - Lấy thông tin profile
PUT  /api/user/profile - Cập nhật profile
POST /api/user/change-password - Đổi mật khẩu
POST /api/user/update-email - Cập nhật email
GET  /api/user/balance - Xem số dư
```

### Payment

```
POST /api/payment/deposit - Tạo yêu cầu nạp tiền
GET  /api/payment/transactions - Lịch sử giao dịch
GET  /api/payment/transactions/:id - Chi tiết giao dịch
POST /api/payment/webhook/sepay - Webhook Sepay (public)
```

### History

```
POST   /api/history - Tạo history (internal use)
GET    /api/history - Lấy danh sách history
GET    /api/history/statistics - Thống kê sử dụng
GET    /api/history/:id - Chi tiết history
DELETE /api/history/:id - Xóa history
```

### Gemini (existing)

```
POST /api/gemini/* - Các endpoints Gemini hiện có
```

## Response Format Examples

### Success Response

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    // your data here
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Invalid credentials",
  "error": "BadRequestException",
  "timestamp": "2024-12-10T10:30:00.000Z",
  "path": "/api/auth/login"
}
```

### Paginated Response

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## Sepay Integration

### Flow nạp tiền:

1. User request deposit qua API
2. Backend tạo transaction với status PENDING
3. Backend return payment info (QR code/bank transfer info)
4. User thực hiện chuyển khoản
5. Sepay gửi webhook về backend
6. Backend verify webhook và update balance + transaction status

### Webhook URL (cần config ở Sepay):

```
https://your-domain.com/api/payment/webhook/sepay
```

## Error Handling

- Tất cả errors đều được catch và trả về format chuẩn
- Không bao giờ bắn lỗi 500 raw ra client
- Trong production, error details bị ẩn
- Validation errors được format rõ ràng

## Database Indexes

Các indexes đã được tạo để tối ưu performance:

- `users.email` (unique)
- `transactions.userId + createdAt`
- `transactions.status + createdAt`
- `transactions.externalTransactionId`
- `gemini_histories.userId + createdAt`
- `gemini_histories.actionType + createdAt`

## Migration Scripts

```bash
# Generate migration
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Best Practices Implemented

1. **Type Safety**: Tất cả đều có types rõ ràng
2. **Error Handling**: Try-catch ở mọi nơi cần thiết
3. **Transaction Safety**: Dùng database transaction cho operations quan trọng
4. **Logging**: Log tất cả important events
5. **Validation**: Class-validator cho all DTOs
6. **Security**: Password hashing, JWT, input validation
7. **Scalability**: Proper indexing, pagination
8. **Clean Code**: Proper folder structure, naming conventions

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Set strong `JWT_SECRET`
3. Configure proper `DB_HOST` (not localhost)
4. Set `synchronize: false` in TypeORM config
5. Run migrations before deployment
6. Setup proper CORS origins
7. Use environment-specific `.env` files

## Notes

- **Sepay Integration**: Cần đăng ký tài khoản Sepay và config webhook
- **Gemini History**: Sẽ cần update Gemini module để tự động lưu history
- **Cost Calculation**: Cost cho mỗi action cần được implement based on pricing
- **File Upload**: Avatar upload cần implement storage (S3, CloudFlare, etc.)

## Support

Nếu gặp vấn đề, check:

1. PostgreSQL container đang chạy: `docker ps`
2. Environment variables đúng
3. Database connection: Check logs
4. Migration đã chạy chưa
