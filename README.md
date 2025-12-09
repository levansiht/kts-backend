# KTS Backend - NestJS API Server

Backend API server cho ứng dụng KTS, sử dụng NestJS và Google Gemini AI.

## 🚀 Tính năng

- ✅ RESTful API cho tất cả các chức năng Gemini AI
- ✅ Bảo mật API key (không lộ trên client)
- ✅ Validation dữ liệu đầu vào
- ✅ Error handling toàn cục
- ✅ Logging requests
- ✅ CORS configuration
- ✅ Environment variables
- ✅ TypeScript strict mode

## 📦 Cài đặt

```bash
# Cài đặt dependencies
npm install

# Copy file môi trường
cp .env.example .env
```

## ⚙️ Cấu hình

Chỉnh sửa file `.env`:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## 🏃 Chạy ứng dụng

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📡 API Endpoints

### Health Check

- `GET /api/gemini/health` - Kiểm tra trạng thái server

### Image Description

- `POST /api/gemini/describe-interior` - Mô tả ảnh nội thất
- `POST /api/gemini/describe-masterplan` - Mô tả ảnh masterplan

### Image Generation

- `POST /api/gemini/generate-images` - Tạo ảnh từ sketch
- `POST /api/gemini/generate-from-text` - Tạo ảnh từ text
- `POST /api/gemini/mood-images` - Tạo ảnh với các mood khác nhau
- `POST /api/gemini/virtual-tour` - Tạo ảnh virtual tour

### Image Processing

- `POST /api/gemini/upscale-image` - Upscale ảnh lên 2K/4K
- `POST /api/gemini/edit-image` - Chỉnh sửa ảnh với mask

### Prompt Generation

- `POST /api/gemini/generate-prompts` - Tạo prompts từ ảnh
- `POST /api/gemini/completion-prompts` - Tạo prompts hoàn thiện công trình
- `POST /api/gemini/interior-completion-prompts` - Tạo prompts hoàn thiện nội thất

### Video Generation

- `POST /api/gemini/generate-video` - Tạo video
- `GET /api/gemini/check-video-status` - Kiểm tra trạng thái video

## 🏗️ Cấu trúc thư mục

```
src/
├── common/
│   ├── dto/              # Data Transfer Objects dùng chung
│   ├── filters/          # Exception filters
│   └── interceptors/     # Interceptors
├── gemini/
│   ├── dto/              # Gemini-specific DTOs
│   ├── gemini.controller.ts
│   ├── gemini.service.ts
│   └── gemini.module.ts
├── app.module.ts
└── main.ts
```

## 🔒 Bảo mật

- API key được lưu trữ an toàn trong biến môi trường
- Validation đầu vào với class-validator
- CORS được cấu hình chỉ cho phép origin cụ thể
- Error handling không lộ thông tin nhạy cảm

## 📝 Best Practices

1. **Dependency Injection**: Sử dụng DI pattern của NestJS
2. **DTO Validation**: Tất cả input đều được validate
3. **Error Handling**: Global exception filter xử lý lỗi
4. **Logging**: Request logging với interceptor
5. **Configuration**: Environment-based configuration
6. **Type Safety**: TypeScript strict mode

## 🚢 Deploy

### Vercel

```bash
# Thêm environment variables trong Vercel dashboard
# Deploy
vercel --prod
```

### Railway/Render

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
