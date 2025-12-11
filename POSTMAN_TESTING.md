# Hướng dẫn Test Backend với Postman

## 📋 Thông tin cơ bản

- **Base URL**: `http://localhost:3001`
- **API Prefix**: Không có prefix (global prefix là empty string)
- **Content-Type**: `application/json`

## 🔐 Bước 1: Lấy JWT Token (Cần thiết cho các endpoint có auth)

### 1.1. Đăng ký tài khoản (nếu chưa có)

**Request:**
```
POST http://localhost:3001/api/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

**Response mẫu:**
```json
{
  "status_code": 201,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2. Đăng nhập để lấy token

**Request:**
```
POST http://localhost:3001/api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response mẫu:**
```json
{
  "status_code": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

**Lưu ý**: Copy `access_token` từ response để dùng cho các request sau.

---

## 💰 Bước 2: Test Payment Endpoints

### 2.1. Tạo đơn hàng thanh toán (Deposit)

**Request:**
```
POST http://localhost:3001/api/payment/deposit
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "amount": 100000,
  "description": "Nạp tiền vào tài khoản"
}
```

**Response mẫu:**
```json
{
  "status_code": 201,
  "message": "Deposit request created successfully",
  "data": {
    "transaction": {
      "id": "uuid-here",
      "userId": "user-id",
      "type": "DEPOSIT",
      "status": "PENDING",
      "amount": 100000,
      "provider": "sepay",
      "description": "Nạp tiền vào tài khoản",
      "createdAt": "2025-01-29T10:00:00.000Z"
    },
    "checkoutUrl": "https://sepay.vn/checkout",
    "formFields": {
      "signature": "...",
      "operation": "PURCHASE",
      "payment_method": "BANK_TRANSFER",
      "order_invoice_number": "INV-...",
      "order_amount": 100000,
      "currency": "VND",
      "order_description": "Payment for order ...",
      "success_url": "http://localhost:3000/api/payment/success?order_id=...",
      "error_url": "http://localhost:3000/api/payment/error?order_id=...",
      "cancel_url": "http://localhost:3000/api/payment/cancel?order_id=..."
    }
  }
}
```

**Cách sử dụng formFields:**
- Copy `checkoutUrl` và `formFields` từ response
- Tạo HTML form ở frontend với các field này
- Submit form sẽ redirect đến Sepay checkout page

---

### 2.2. Xem danh sách giao dịch

**Request:**
```
GET http://localhost:3001/api/payment/transactions?page=1&limit=20
```

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Query Parameters:**
- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số item mỗi trang (mặc định: 20)

**Response mẫu:**
```json
{
  "status_code": 200,
  "message": "Transactions fetched successfully",
  "data": {
    "items": [
      {
        "id": "uuid-here",
        "type": "DEPOSIT",
        "status": "PENDING",
        "amount": 100000,
        "createdAt": "2025-01-29T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 2.3. Xem chi tiết giao dịch

**Request:**
```
GET http://localhost:3001/api/payment/transactions/{transaction_id}
```

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Response mẫu:**
```json
{
  "status_code": 200,
  "message": "Transaction fetched successfully",
  "data": {
    "id": "uuid-here",
    "userId": "user-id",
    "type": "DEPOSIT",
    "status": "PENDING",
    "amount": 100000,
    "balanceBefore": 0,
    "balanceAfter": null,
    "provider": "sepay",
    "description": "Nạp tiền vào tài khoản",
    "metadata": {
      "checkoutUrl": "...",
      "formFields": { ... }
    },
    "createdAt": "2025-01-29T10:00:00.000Z"
  }
}
```

---

## 🔔 Bước 3: Test IPN Endpoint (Webhook từ Sepay)

### 3.1. Test IPN Endpoint

**Request:**
```
POST http://localhost:3001/api/payment/ipn
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON) - Format từ Sepay:**
```json
{
  "timestamp": 1759134682,
  "notification_type": "ORDER_PAID",
  "order": {
    "id": "e2c195be-c721-47eb-b323-99ab24e52d85",
    "order_id": "NQD-68DA43D73C1A5",
    "order_status": "CAPTURED",
    "order_currency": "VND",
    "order_amount": "100000.00",
    "order_invoice_number": "INV-1759134677",
    "custom_data": [],
    "user_agent": "Mozilla/5.0...",
    "ip_address": "14.186.39.212",
    "order_description": "Test payment"
  },
  "transaction": {
    "id": "384c66dd-41e6-4316-a544-b4141682595c",
    "payment_method": "BANK_TRANSFER",
    "transaction_id": "68da43da2d9de",
    "transaction_type": "PAYMENT",
    "transaction_date": "2025-09-29 15:31:22",
    "transaction_status": "APPROVED",
    "transaction_amount": "100000",
    "transaction_currency": "VND",
    "authentication_status": "AUTHENTICATION_SUCCESSFUL",
    "card_number": null,
    "card_holder_name": null,
    "card_expiry": null,
    "card_funding_method": null,
    "card_brand": null
  },
  "customer": null,
  "agreement": null
}
```

**Response:**
```json
{
  "status_code": 200,
  "message": "IPN processed successfully",
  "data": null
}
```

**Lưu ý**: 
- Endpoint này không cần authentication (public)
- Sepay sẽ gửi request này khi có thanh toán thành công
- Backend sẽ tự động cập nhật transaction status và user balance

---

## 🔄 Bước 4: Test Callback Endpoints

### 4.1. Success Callback

**Request:**
```
GET http://localhost:3001/api/payment/success?order_id={transaction_id}
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Payment completed successfully",
  "data": {
    "message": "Payment successful",
    "orderId": "transaction-id",
    "redirectUrl": "http://localhost:3000/payment/success?order_id=..."
  }
}
```

### 4.2. Error Callback

**Request:**
```
GET http://localhost:3001/api/payment/error?order_id={transaction_id}
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Payment failed",
  "data": {
    "message": "Payment failed",
    "orderId": "transaction-id",
    "redirectUrl": "http://localhost:3000/payment/error?order_id=..."
  }
}
```

### 4.3. Cancel Callback

**Request:**
```
GET http://localhost:3001/api/payment/cancel?order_id={transaction_id}
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Payment cancelled by user",
  "data": {
    "message": "Payment cancelled",
    "orderId": "transaction-id",
    "redirectUrl": "http://localhost:3000/payment/cancel?order_id=..."
  }
}
```

---

## 📝 Tạo Postman Collection

### Cách tạo Collection trong Postman:

1. **Tạo Collection mới:**
   - Click "New" → "Collection"
   - Đặt tên: "KTS Backend API"

2. **Thêm Environment Variables:**
   - Click "Environments" → "Create Environment"
   - Thêm các biến:
     - `base_url`: `http://localhost:3001`
     - `token`: (sẽ được set sau khi login)

3. **Tạo các Request:**

   **a. Auth - Register:**
   ```
   POST {{base_url}}/api/auth/register
   Body: { "email": "...", "password": "...", "fullName": "..." }
   ```

   **b. Auth - Login:**
   ```
   POST {{base_url}}/api/auth/login
   Body: { "email": "...", "password": "..." }
   Tests tab: pm.environment.set("token", pm.response.json().data.access_token);
   ```

   **c. Payment - Create Deposit:**
   ```
   POST {{base_url}}/api/payment/deposit
   Headers: Authorization: Bearer {{token}}
   Body: { "amount": 100000, "description": "..." }
   ```

   **d. Payment - Get Transactions:**
   ```
   GET {{base_url}}/api/payment/transactions?page=1&limit=20
   Headers: Authorization: Bearer {{token}}
   ```

   **e. Payment - Get Transaction:**
   ```
   GET {{base_url}}/api/payment/transactions/{{transaction_id}}
   Headers: Authorization: Bearer {{token}}
   ```

   **f. Payment - IPN:**
   ```
   POST {{base_url}}/api/payment/ipn
   Body: { ... IPN JSON ... }
   ```

   **g. Payment - Success Callback:**
   ```
   GET {{base_url}}/api/payment/success?order_id={{transaction_id}}
   ```

---

## 🧪 Test Flow Hoàn Chỉnh

### Scenario 1: Tạo đơn hàng và test IPN

1. **Login** → Lấy token
2. **Create Deposit** → Lấy `transaction.id` và `formFields`
3. **Test IPN** → Gửi IPN với `order_invoice_number` tương ứng với transaction
4. **Get Transaction** → Kiểm tra status đã chuyển thành `COMPLETED` và balance đã được cập nhật

### Scenario 2: Test Callback URLs

1. **Create Deposit** → Lấy `transaction.id`
2. **Test Success Callback** → `GET /api/payment/success?order_id={id}`
3. **Test Error Callback** → `GET /api/payment/error?order_id={id}`
4. **Test Cancel Callback** → `GET /api/payment/cancel?order_id={id}`

---

## ⚠️ Lưu ý quan trọng

1. **JWT Token**: Các endpoint có `@UseGuards(JwtAuthGuard)` cần token trong header
2. **Token Expiry**: Token có thể hết hạn, cần login lại
3. **IPN Format**: IPN phải đúng format từ Sepay, `order_invoice_number` phải khớp với transaction
4. **Transaction Status**: 
   - `PENDING`: Chờ thanh toán
   - `COMPLETED`: Đã thanh toán thành công
   - `FAILED`: Thanh toán thất bại
5. **Balance Update**: Balance chỉ được cập nhật khi IPN có `notification_type: "ORDER_PAID"` và `transaction_status: "APPROVED"`

---

## 🐛 Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra token đã được set trong header chưa
- Token có thể đã hết hạn, cần login lại

### Lỗi 400 Bad Request
- Kiểm tra body request đúng format chưa
- Kiểm tra validation errors trong response

### IPN không cập nhật transaction
- Kiểm tra `order_invoice_number` trong IPN có khớp với transaction không
- Kiểm tra logs để xem có lỗi gì không
- Đảm bảo `notification_type` là `"ORDER_PAID"`

### Transaction không tìm thấy
- Kiểm tra transaction ID đúng chưa
- Kiểm tra user ID có khớp không (mỗi user chỉ thấy transaction của mình)

---

## 📚 Tham khảo thêm

- Xem logs backend để debug chi tiết
- Kiểm tra database để xem transaction và balance có được cập nhật không
- Test với Sepay sandbox trước khi chuyển production

