# Hướng dẫn sử dụng ngrok để test Webhook Sepay

## 🎯 Mục đích

Khi chưa có domain, bạn cần expose localhost ra internet để Sepay có thể gửi webhook về. Ngrok là công cụ phổ biến nhất để làm việc này.

## 📦 Cài đặt ngrok

### Linux (Ubuntu/Debian)

```bash
# Thêm ngrok repository
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

### MacOS

```bash
brew install ngrok/ngrok/ngrok
```

### Windows

1. Download từ: https://ngrok.com/download
2. Giải nén và thêm vào PATH

### Hoặc dùng npm (nếu đã có Node.js)

```bash
npm install -g ngrok
```

## 🔑 Đăng ký và lấy Authtoken

1. Truy cập: https://dashboard.ngrok.com/signup
2. Đăng ký tài khoản miễn phí
3. Vào **Your Authtoken** → Copy token
4. Cấu hình:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

## 🚀 Sử dụng

### 1. Khởi động backend

```bash
cd kts/kts-backend
npm run start:dev
# Backend sẽ chạy trên http://localhost:3001
```

### 2. Chạy ngrok

Mở terminal mới và chạy:

```bash
ngrok http 3001
```

Bạn sẽ thấy output như sau:

```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        Asia Pacific (ap)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3001

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### 3. Copy URL ngrok

Copy URL từ dòng **Forwarding**, ví dụ:
```
https://xxxx-xx-xx-xx-xx.ngrok-free.app
```

### 4. Cấu hình trong Sepay Dashboard

1. Đăng nhập Sepay Dashboard
2. Vào **WebHooks** → **"+ Thêm webhooks"**
3. Điền:
   - **Tên**: "KTS Webhook (ngrok)"
   - **Sự kiện**: "Có tiền vào"
   - **URL nhận WebHooks**: `https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/payment/webhook/sepay`
   - **Cấu hình chứng thực**: Chọn phương thức phù hợp
4. Lưu

### 5. Test Webhook

Bạn có thể test bằng cách:
1. Tạo một giao dịch thanh toán từ frontend
2. Hoặc gửi POST request thủ công:

```bash
curl -X POST https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/payment/webhook/sepay \
  -H "Content-Type: application/json" \
  -H "x-sepay-signature: test-signature" \
  -d '{
    "transaction_id": "SEPAY_TX_123",
    "amount": 100000,
    "account_number": "1234567890",
    "transaction_content": "KTS test-transaction-id",
    "status": "success"
  }'
```

## 🔍 Xem logs và debug

### Xem request đến ngrok

Truy cập: http://127.0.0.1:4040 (Web Interface của ngrok)

Tại đây bạn có thể:
- Xem tất cả requests đến ngrok
- Inspect request/response
- Replay requests để test

### Xem logs backend

```bash
# Trong terminal chạy backend
# Sẽ thấy logs khi có webhook đến
```

## ⚠️ Lưu ý quan trọng

### 1. URL thay đổi mỗi lần restart

- Mỗi lần restart ngrok, URL sẽ thay đổi
- Cần cập nhật lại URL trong Sepay dashboard
- **Giải pháp**: Dùng ngrok plan trả phí để có subdomain cố định

### 2. Rate limits (Plan miễn phí)

- Có giới hạn số requests/giờ
- Nếu vượt quá, ngrok sẽ trả về 429 Too Many Requests
- Cần đợi một lúc hoặc upgrade plan

### 3. Ngrok warning page

- Lần đầu truy cập URL ngrok, sẽ có warning page
- Cần click "Visit Site" để tiếp tục
- Sepay webhook có thể bị chặn bởi warning này
- **Giải pháp**: Dùng ngrok với authtoken (đã config ở trên) hoặc upgrade plan

### 4. Bảo mật

- URL ngrok là public, ai cũng có thể truy cập
- Chỉ dùng cho development/testing
- Không dùng cho production
- Webhook endpoint nên có signature verification

## 🎯 Best Practices

1. **Giữ ngrok chạy liên tục** khi đang test
2. **Bookmark ngrok web interface** (http://127.0.0.1:4040) để dễ debug
3. **Test webhook ngay sau khi config** để đảm bảo hoạt động
4. **Ghi lại URL ngrok** mỗi lần restart để dễ cập nhật Sepay

## 🔄 Workflow thông thường

```bash
# Terminal 1: Chạy backend
cd kts/kts-backend
npm run start:dev

# Terminal 2: Chạy ngrok
ngrok http 3001

# Copy URL từ ngrok → Cập nhật vào Sepay dashboard
# Test webhook → Xem logs ở cả 2 terminal
```

## 📚 Tài liệu tham khảo

- **ngrok Documentation**: https://ngrok.com/docs
- **ngrok Dashboard**: https://dashboard.ngrok.com
- **Alternative tools**: localtunnel, cloudflared, serveo

## 🆘 Troubleshooting

### Ngrok không kết nối được

- Kiểm tra internet connection
- Kiểm tra authtoken đã config chưa
- Thử restart ngrok

### Webhook không đến backend

- Kiểm tra URL trong Sepay đã đúng chưa (có `/api/payment/webhook/sepay`)
- Kiểm tra backend đang chạy
- Kiểm tra ngrok đang chạy
- Xem logs ở ngrok web interface (http://127.0.0.1:4040)

### 429 Too Many Requests

- Đã vượt quá rate limit của plan miễn phí
- Đợi một lúc rồi thử lại
- Hoặc upgrade ngrok plan

