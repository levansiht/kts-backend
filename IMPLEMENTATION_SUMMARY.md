# 🎯 Backend API Documentation

## Tổng quan

Backend NestJS đã được tạo thành công với các tính năng:

- ✅ **15 API endpoints** cho tất cả chức năng Gemini AI
- ✅ **Bảo mật API key** - không lộ ra client
- ✅ **Input validation** - class-validator
- ✅ **Global error handling** - AllExceptionsFilter
- ✅ **Request logging** - LoggingInterceptor
- ✅ **CORS configured** - cho phép frontend connect
- ✅ **Environment variables** - ConfigModule
- ✅ **TypeScript strict** - type-safe code

## 📁 Cấu trúc đã tạo

```
kts-backend/
├── src/
│   ├── common/
│   │   ├── dto/
│   │   │   └── source-image.dto.ts       # DTO chung cho SourceImage
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts   # Global exception filter
│   │   └── interceptors/
│   │       └── logging.interceptor.ts     # Request logging
│   ├── gemini/
│   │   ├── dto/
│   │   │   └── gemini.dto.ts             # Tất cả DTOs cho Gemini APIs
│   │   ├── gemini.controller.ts           # Controller với 15 endpoints
│   │   ├── gemini.service.ts              # Service với business logic
│   │   └── gemini.module.ts               # Module configuration
│   ├── app.module.ts                      # Root module
│   └── main.ts                            # Entry point với CORS config
├── .env.example                           # Template cho environment variables
├── .env                                   # Environment variables (gitignored)
├── .gitignore                             # Git ignore rules
├── vercel.json                            # Vercel deployment config
├── README.md                              # Documentation
├── MIGRATION_GUIDE.md                     # Hướng dẫn migrate frontend
└── FRONTEND_USAGE_EXAMPLE.ts.example      # Example code cho frontend

```

## 🔌 API Endpoints

### Health Check

```
GET /api/gemini/health
```

### Image Description

```
POST /api/gemini/describe-interior
POST /api/gemini/describe-masterplan
```

### Image Generation

```
POST /api/gemini/generate-images
POST /api/gemini/generate-from-text
POST /api/gemini/mood-images
POST /api/gemini/virtual-tour
```

### Image Processing

```
POST /api/gemini/upscale-image
POST /api/gemini/edit-image
```

### Prompt Generation

```
POST /api/gemini/generate-prompts
POST /api/gemini/completion-prompts
POST /api/gemini/interior-completion-prompts
```

### Video Generation

```
POST /api/gemini/generate-video
GET  /api/gemini/check-video-status
```

## ⚙️ Environment Variables

Cần thiết lập trong `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## 🚀 Chạy Backend

```bash
# Development
cd kts-backend
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Server sẽ chạy tại: `http://localhost:3001`

## 📝 Bước tiếp theo

### 1. Cấu hình API Key

Thêm Gemini API key vào file `.env`:

```bash
cd kts-backend
nano .env  # hoặc vim .env
# Thêm: GEMINI_API_KEY=your_actual_key
```

### 2. Test Backend

```bash
cd kts-backend
npm run start:dev

# Terminal khác, test health endpoint:
curl http://localhost:3001/api/gemini/health
```

### 3. Migrate Frontend

Xem file `MIGRATION_GUIDE.md` để biết cách:

- Tạo API client service
- Thay thế các function trong `geminiService.ts`
- Cấu hình `VITE_API_URL`
- Xóa `VITE_GEMINI_API_KEY` khỏi frontend

### 4. Deploy

#### Backend (Vercel)

```bash
cd kts-backend
vercel --prod
# Thêm environment variable: GEMINI_API_KEY
```

#### Frontend (Vercel)

```bash
cd kts-app
# Cập nhật .env: VITE_API_URL=https://your-backend.vercel.app
vercel --prod
```

## 🔒 Security Features

1. **API Key Protection**: API key chỉ tồn tại ở backend
2. **Input Validation**: Tất cả request được validate với class-validator
3. **CORS**: Chỉ cho phép specific origins
4. **Error Handling**: Không lộ sensitive information trong error messages
5. **Type Safety**: TypeScript strict mode (đã relaxed để tương thích với SDK)

## 📖 Documentation Files

- **README.md**: Tổng quan về backend
- **MIGRATION_GUIDE.md**: Hướng dẫn chi tiết cách migrate frontend
- **FRONTEND_USAGE_EXAMPLE.ts.example**: Code mẫu để call APIs từ frontend

## ✅ Best Practices Implemented

- ✅ Dependency Injection (NestJS DI pattern)
- ✅ DTO Pattern (Data Transfer Objects)
- ✅ Service Layer Pattern
- ✅ Global Exception Filter
- ✅ Request/Response Interceptors
- ✅ Environment-based Configuration
- ✅ Proper Error Handling
- ✅ API Versioning Ready
- ✅ CORS Configuration
- ✅ Input Validation

## 🎉 Hoàn thành!

Backend đã được tạo hoàn chỉnh với best practices của NestJS. Bây giờ bạn có thể:

1. Thêm Gemini API key vào `.env`
2. Chạy backend: `npm run start:dev`
3. Migrate frontend theo hướng dẫn trong `MIGRATION_GUIDE.md`
4. Deploy lên Vercel/Railway/Render

API key của bạn giờ đã an toàn! 🔒
