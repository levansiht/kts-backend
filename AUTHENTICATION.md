# Authentication System

Hệ thống authentication sử dụng JWT (JSON Web Tokens) để bảo vệ các API endpoints.

## Cấu trúc

```
src/
├── auth/
│   ├── dto/                    # Data Transfer Objects
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   └── auth-response.dto.ts
│   ├── decorators/            # Custom decorators
│   │   ├── public.decorator.ts # Đánh dấu route public
│   │   └── current-user.decorator.ts # Lấy user hiện tại
│   ├── guards/                 # Auth guards
│   │   └── jwt-auth.guard.ts
│   ├── strategies/            # Passport strategies
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
└── user/
    ├── entities/
    │   └── user.entity.ts
    ├── user.service.ts
    └── user.module.ts
```

## API Endpoints

### Public Endpoints (Không cần authentication)

#### 1. Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",  // Optional
  "lastName": "Doe"     // Optional
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Protected Endpoints (Cần authentication)

Tất cả các endpoints trong `/api/gemini/*` (trừ `/api/gemini/health`) đều yêu cầu authentication.

**Header:**
```http
Authorization: Bearer <accessToken>
```

## Sử dụng trong Frontend

### 1. Register/Login và lưu token

```typescript
// Register
const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  })
});

const { accessToken, user } = await response.json();

// Lưu token vào localStorage hoặc state management
localStorage.setItem('accessToken', accessToken);
```

### 2. Gọi API với token

```typescript
const token = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:3001/api/gemini/generate-images', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ /* ... */ })
});
```

### 3. Cập nhật apiClient.ts

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper để lấy token
function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}

export async function callGeminiAPI<T>(
  endpoint: string,
  data: any
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/gemini/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired hoặc invalid
      localStorage.removeItem('accessToken');
      // Redirect to login
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    const error = await response
      .json()
      .catch(() => ({ message: "API request failed" }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}
```

## Environment Variables

Thêm vào `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d
```

## Security Best Practices

1. **JWT_SECRET**: Sử dụng secret key mạnh (ít nhất 32 ký tự) và khác nhau cho mỗi môi trường
2. **Password**: Mật khẩu được hash bằng bcrypt với salt rounds = 10
3. **Token Expiration**: Token hết hạn sau 7 ngày (có thể điều chỉnh)
4. **HTTPS**: Luôn sử dụng HTTPS trong production
5. **CORS**: Đã cấu hình CORS để chỉ cho phép frontend từ origin được chỉ định

## Database

Sử dụng SQLite với TypeORM. Database file: `database.sqlite`

Trong production, nên chuyển sang PostgreSQL hoặc MySQL và:
- Set `synchronize: false` trong TypeORM config
- Sử dụng migrations
- Backup database thường xuyên

