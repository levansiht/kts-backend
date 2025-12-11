# Hướng dẫn tích hợp Sepay Payment Gateway

## 📋 Tổng quan

Sepay là cổng thanh toán Việt Nam hỗ trợ thanh toán qua chuyển khoản ngân hàng. Tài liệu này hướng dẫn cách tích hợp Sepay vào hệ thống KTS.

## 🔑 Lấy thông tin API từ Sepay

### Bước 1: Tạo API Token

1. Đăng nhập vào tài khoản Sepay của bạn
2. Truy cập: **Cấu hình Công ty** → **API Access**
3. Nhấn nút **"+ Thêm API"**
4. Điền thông tin:
   - **Tên**: Đặt tên tùy ý (ví dụ: "KTS Backend API")
   - **Trạng thái**: Chọn "Hoạt động"
5. Nhấn **"Thêm"** để hoàn tất
6. Copy **API Token** (đây là `SEPAY_API_KEY`)

**Lưu ý**: Hiện tại Sepay chưa hỗ trợ phân quyền cho API, do đó API Token có toàn quyền truy cập.

### Bước 2: Lấy thông tin tài khoản

- **SEPAY_ACCOUNT_NUMBER**: Số tài khoản ngân hàng đã kết nối với Sepay
- **SEPAY_API_SECRET**: Thường là API Secret hoặc có thể là cùng với API Key (tham khảo tài liệu Sepay)

### Bước 3: Cấu hình Webhook

#### Nếu bạn đã có domain (Production):
1. Truy cập: **WebHooks** → **"+ Thêm webhooks"**
2. Điền thông tin:
   - **Tên**: Đặt tên tùy ý
   - **Sự kiện**: Chọn "Có tiền vào" (hoặc cả hai)
   - **URL nhận WebHooks**: `https://your-domain.com/api/payment/webhook/sepay`
   - **Cấu hình chứng thực**: Chọn phương thức phù hợp (OAuth 2.0, API Key, hoặc không cần)
3. Copy **Webhook Secret** (nếu có) → đây là `SEPAY_WEBHOOK_SECRET`

#### Nếu bạn chưa có domain (Development/Testing):

Sử dụng **ngrok** hoặc công cụ tương tự để expose localhost ra internet:

**Cách 1: Sử dụng ngrok (Khuyến nghị)**

1. **Cài đặt ngrok:**
   ```bash
   # Linux/Mac
   curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
   echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
   sudo apt update && sudo apt install ngrok
   
   # Hoặc download từ: https://ngrok.com/download
   ```

2. **Đăng ký tài khoản ngrok (miễn phí):**
   - Truy cập: https://dashboard.ngrok.com/signup
   - Lấy **Authtoken** từ dashboard

3. **Cấu hình ngrok:**
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```

4. **Chạy ngrok để expose port 3001:**
   ```bash
   ngrok http 3001
   ```

5. **Lấy URL từ ngrok:**
   - Ngrok sẽ hiển thị URL dạng: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`
   - Copy URL này

6. **Cấu hình trong Sepay:**
   - **URL nhận WebHooks**: `https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/payment/webhook/sepay`
   - ⚠️ **Lưu ý**: URL ngrok thay đổi mỗi lần restart (trừ khi dùng plan trả phí)

**Cách 2: Sử dụng localtunnel (Miễn phí, không cần đăng ký)**

1. **Cài đặt:**
   ```bash
   npm install -g localtunnel
   ```

2. **Chạy tunnel:**
   ```bash
   lt --port 3001
   ```

3. **Sử dụng URL được cung cấp** (dạng: `https://xxxx.loca.lt`)

**Cách 3: Sử dụng Cloudflare Tunnel (Miễn phí, URL cố định)**

1. Cài đặt `cloudflared`
2. Tạo tunnel và cấu hình
3. Nhận URL cố định miễn phí

**Lưu ý khi test với ngrok:**
- URL thay đổi mỗi lần restart ngrok (trừ plan trả phí)
- Cần cập nhật lại URL trong Sepay dashboard mỗi lần restart
- Đảm bảo backend đang chạy trên port 3001 (hoặc port bạn config)
- Ngrok có thể bị rate limit ở plan miễn phí

## ⚙️ Cấu hình Backend

### 1. Thêm biến môi trường vào `.env`

```env
# Sepay Configuration
SEPAY_API_KEY=your-api-key-from-sepay
SEPAY_API_SECRET=your-api-secret-from-sepay
SEPAY_ACCOUNT_NUMBER=your-sepay-account-number
SEPAY_WEBHOOK_SECRET=your-webhook-secret
SEPAY_API_URL=https://api.sepay.vn/v1
FRONTEND_URL=http://localhost:3000
```

### 2. Cập nhật API Endpoint (nếu cần)

Mặc định, code sử dụng endpoint `/orders` để tạo đơn hàng. Nếu Sepay sử dụng endpoint khác, cập nhật trong file:

```typescript
// kts/kts-backend/src/payment/sepay.service.ts
// Dòng ~60: Cập nhật endpoint theo tài liệu Sepay
const response = await this.httpClient.post<SepayCreateOrderResponse>(
  '/orders', // ← Cập nhật endpoint này nếu cần
  { ... }
);
```

### 3. Cập nhật Base URL (nếu cần)

Nếu Sepay sử dụng base URL khác, cập nhật trong `.env`:

```env
SEPAY_API_URL=https://api.sepay.vn/v1  # Hoặc URL thực tế từ tài liệu
```

## 📝 Cách sử dụng

### Tạo đơn hàng thanh toán

```typescript
// API Endpoint: POST /api/payment/deposit
// Headers: Authorization: Bearer <user-jwt-token>
// Body:
{
  "amount": 100000,
  "description": "Nạp tiền vào tài khoản"
}

// Response:
{
  "status_code": 201,
  "message": "Deposit request created successfully",
  "data": {
    "transaction": { ... },
    "paymentUrl": "https://sepay.vn/payment?ref=..."
  }
}
```

### Xử lý Webhook

Webhook endpoint đã được cấu hình tại: `POST /api/payment/webhook/sepay`

Sepay sẽ gửi webhook đến endpoint này khi có giao dịch mới. Code sẽ tự động:
1. Verify signature (nếu có)
2. Tìm transaction tương ứng
3. Cập nhật trạng thái và số dư người dùng

## 🔍 Kiểm tra và Debug

### 1. Kiểm tra logs

```bash
# Xem logs của Sepay service
# Logs sẽ hiển thị:
# - Request/Response từ Sepay API
# - Webhook events
# - Errors nếu có
```

### 2. Test Webhook (Development)

Bạn có thể test webhook bằng cách gửi POST request:

```bash
curl -X POST http://localhost:4000/api/payment/webhook/sepay \
  -H "Content-Type: application/json" \
  -H "x-sepay-signature: test-signature" \
  -d '{
    "transaction_id": "SEPAY_TX_123",
    "amount": 100000,
    "account_number": "1234567890",
    "transaction_content": "KTS <transaction-id>",
    "status": "success"
  }'
```

### 3. Verify Signature Implementation

Hiện tại, hàm `verifyWebhookSignature` trong `sepay.service.ts` chưa được implement đầy đủ. Bạn cần:

1. Tham khảo tài liệu Sepay về cách verify signature
2. Cập nhật hàm này trong file `kts/kts-backend/src/payment/sepay.service.ts`

Ví dụ (cần cập nhật theo tài liệu Sepay):

```typescript
verifyWebhookSignature(payload: SepayWebhookPayload, signature: string): boolean {
  const crypto = require('crypto');
  const webhookSecret = this.configService.get<string>('SEPAY_WEBHOOK_SECRET');
  
  // Cập nhật cách tính signature theo tài liệu Sepay
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

## 📚 Tài liệu tham khảo

- **Tài liệu Sepay Developer**: https://developer.sepay.vn
- **Tạo API Token**: https://developer.sepay.vn/vi/sepay-api/tao-api-token
- **Tích hợp Webhooks**: https://docs.sepay.vn/tich-hop-webhooks.html
- **Hỗ trợ**: info@sepay.vn hoặc hotline: 02873.059.589

## ⚠️ Lưu ý quan trọng

1. **API Endpoint**: Endpoint `/orders` trong code là ví dụ. Cần kiểm tra tài liệu Sepay để xác nhận endpoint chính xác.

2. **Request/Response Format**: Format request và response có thể khác với tài liệu Sepay. Cần cập nhật interface trong `sepay.service.ts` cho đúng.

3. **Signature Verification**: Cần implement đúng cách verify signature theo tài liệu Sepay để đảm bảo security.

4. **Test Mode**: Sepay có thể có môi trường test/sandbox. Sử dụng test mode trước khi deploy production.

5. **Error Handling**: Code đã có error handling cơ bản, nhưng có thể cần bổ sung thêm các trường hợp lỗi cụ thể từ Sepay.

## 🐛 Troubleshooting

### Lỗi: "Failed to create Sepay order"

- Kiểm tra API Key và Secret đã đúng chưa
- Kiểm tra network connection đến Sepay API
- Xem logs để biết chi tiết lỗi từ Sepay

### Webhook không nhận được

- Kiểm tra URL webhook đã config đúng trong Sepay dashboard
- Nếu dùng ngrok: Đảm bảo ngrok đang chạy và URL đã được cập nhật trong Sepay
- Kiểm tra backend đang chạy trên đúng port (mặc định 3001)
- Kiểm tra logs để xem có request đến không
- Test webhook bằng cách gửi POST request thủ công (xem phần Test Webhook bên trên)
- Nếu dùng ngrok free plan: Có thể bị rate limit, thử lại sau vài phút

### Signature verification failed

- Kiểm tra `SEPAY_WEBHOOK_SECRET` đã đúng chưa
- Implement lại hàm `verifyWebhookSignature` theo đúng tài liệu Sepay

