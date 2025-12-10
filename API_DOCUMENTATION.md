# API Documentation

## Base URL

```
Development: http://localhost:3001
Production: https://your-domain.com
```

## Response Format

Tất cả API responses đều follow format chuẩn:

### Success Response

```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "ErrorType",
  "timestamp": "2024-12-10T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

## Authentication

Sử dụng JWT Bearer Token trong header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Authentication

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "accessToken": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

### 2. User Profile

#### Get Profile

```http
GET /api/user/profile
Authorization: Bearer <token>
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Profile fetched successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "balance": 100000,
    "phoneNumber": "0123456789",
    "avatar": "https://...",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Profile

```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "phoneNumber": "0987654321",
  "avatar": "https://new-avatar-url"
}
```

#### Change Password

```http
POST /api/user/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "current-password",
  "newPassword": "new-password"
}
```

#### Update Email

```http
POST /api/user/update-email
Authorization: Bearer <token>
Content-Type: application/json

{
  "newEmail": "newemail@example.com",
  "password": "current-password"
}
```

#### Get Balance

```http
GET /api/user/balance
Authorization: Bearer <token>
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Balance fetched successfully",
  "data": {
    "balance": 100000
  }
}
```

---

### 3. Payment

#### Create Deposit Request

```http
POST /api/payment/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100000,
  "description": "Nạp tiền vào tài khoản"
}
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "Deposit request created successfully",
  "data": {
    "transaction": {
      "id": "uuid",
      "userId": "uuid",
      "type": "deposit",
      "status": "pending",
      "amount": 100000,
      "balanceBefore": 50000,
      "provider": "sepay",
      "description": "Nạp tiền vào tài khoản",
      "createdAt": "2024-12-10T10:00:00.000Z"
    },
    "paymentUrl": "https://sepay.vn/payment?ref=xxx"
  }
}
```

#### Get Transactions

```http
GET /api/payment/transactions?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Transactions fetched successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "type": "deposit",
        "status": "completed",
        "amount": 100000,
        "balanceBefore": 50000,
        "balanceAfter": 150000,
        "provider": "sepay",
        "description": "Nạp tiền vào tài khoản",
        "createdAt": "2024-12-10T10:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

#### Get Transaction Detail

```http
GET /api/payment/transactions/:id
Authorization: Bearer <token>
```

#### Sepay Webhook (Public - No Auth)

```http
POST /api/payment/webhook/sepay
Content-Type: application/json

{
  "transaction_id": "SEPAY_TX_123",
  "amount": 100000,
  "account_number": "1234567890",
  "transaction_content": "KTS uuid-here",
  "status": "success",
  "transaction_date": "2024-12-10T10:00:00.000Z"
}
```

---

### 4. History

#### Create History (Internal use - được call từ Gemini service)

```http
POST /api/history
Authorization: Bearer <token>
Content-Type: application/json

{
  "actionType": "generate_image",
  "prompt": "Create a modern living room",
  "sourceImageUrl": "https://...",
  "resultImageUrl": "https://...",
  "parameters": {
    "style": "modern",
    "aspectRatio": "16:9"
  },
  "isSuccess": true,
  "processingTimeMs": 5000,
  "cost": 0.05
}
```

#### Get Histories

```http
GET /api/history?page=1&limit=20&actionType=generate_image&isSuccess=true
Authorization: Bearer <token>
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Histories fetched successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "userId": "uuid",
        "actionType": "generate_image",
        "prompt": "Create a modern living room",
        "sourceImageUrl": "https://...",
        "resultImageUrl": "https://...",
        "resultText": null,
        "parameters": {...},
        "metadata": {...},
        "isSuccess": true,
        "errorMessage": null,
        "processingTimeMs": 5000,
        "cost": 0.05,
        "createdAt": "2024-12-10T10:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### Get History Statistics

```http
GET /api/history/statistics
Authorization: Bearer <token>
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Statistics fetched successfully",
  "data": {
    "totalActions": 150,
    "successfulActions": 145,
    "failedActions": 5,
    "actionsByType": {
      "generate_image": 50,
      "describe_interior": 30,
      "upscale": 20,
      "change_material": 25,
      "merge_furniture": 25
    },
    "totalCost": 7.5
  }
}
```

#### Get History Detail

```http
GET /api/history/:id
Authorization: Bearer <token>
```

#### Delete History

```http
DELETE /api/history/:id
Authorization: Bearer <token>
```

---

## Error Codes

| Status Code | Description                              |
| ----------- | ---------------------------------------- |
| 200         | OK - Request successful                  |
| 201         | Created - Resource created successfully  |
| 400         | Bad Request - Invalid input              |
| 401         | Unauthorized - Invalid or missing token  |
| 403         | Forbidden - No permission                |
| 404         | Not Found - Resource not found           |
| 409         | Conflict - Resource already exists       |
| 422         | Unprocessable Entity - Validation failed |
| 500         | Internal Server Error - Server error     |

## Common Error Messages

### Authentication Errors

- "Invalid email or password"
- "Account has been deactivated"
- "Email is already in use"
- "Invalid email format"

### Validation Errors

- "Password must be at least 6 characters"
- "Email must be a valid email address"
- "Amount must be a positive number"

### Business Logic Errors

- "Insufficient balance"
- "Transaction not found"
- "User not found"
- "Invalid transaction status"

## Action Types for Gemini History

```typescript
enum GeminiActionType {
  DESCRIBE_INTERIOR = 'describe_interior',
  DESCRIBE_MASTERPLAN = 'describe_masterplan',
  GENERATE_IMAGE = 'generate_image',
  UPSCALE = 'upscale',
  CHANGE_MATERIAL = 'change_material',
  MERGE_FURNITURE = 'merge_furniture',
  REPLACE_MODEL = 'replace_model',
  FINISH_INTERIOR = 'finish_interior',
  FINISH_EXTERIOR = 'finish_exterior',
  COLORIZE_FLOORPLAN = 'colorize_floorplan',
  CROP_TO_EDIT = 'crop_to_edit',
  INSERT_BUILDING = 'insert_building',
  KITCHEN_CABINET = 'kitchen_cabinet',
  PERSPECTIVE_SYNC = 'perspective_sync',
  CHARACTER_SYNC = 'character_sync',
  IMPROVE_RENDER = 'improve_render',
  VIRTUAL_TOUR = 'virtual_tour',
}
```

## Transaction Types

```typescript
enum TransactionType {
  DEPOSIT = 'deposit', // Nạp tiền
  WITHDRAWAL = 'withdrawal', // Rút tiền
  PAYMENT = 'payment', // Thanh toán dịch vụ
  REFUND = 'refund', // Hoàn tiền
}
```

## Transaction Status

```typescript
enum TransactionStatus {
  PENDING = 'pending', // Đang chờ xử lý
  COMPLETED = 'completed', // Hoàn thành
  FAILED = 'failed', // Thất bại
  CANCELLED = 'cancelled', // Đã hủy
}
```

## Rate Limiting

(To be implemented)

- 100 requests per minute per user
- 1000 requests per hour per user

## Pagination

All list endpoints support pagination:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes:

- `items`: Array of items
- `total`: Total count
- `page`: Current page
- `limit`: Items per page
- `totalPages`: Total pages
