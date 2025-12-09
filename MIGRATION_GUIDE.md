# Hướng dẫn cập nhật Frontend để sử dụng Backend API

## 1. Cấu hình Environment Variables (Frontend)

Thêm vào file `.env` của frontend (kts-app):

```env
VITE_API_URL=http://localhost:3001
```

Khi deploy production, thay đổi thành URL backend của bạn:

```env
VITE_API_URL=https://your-backend-api.vercel.app
```

## 2. Tạo API Client Service

Tạo file `kts-app/services/apiClient.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function callGeminiAPI<T>(
  endpoint: string,
  data: any,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/gemini/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

export async function getGeminiAPI<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${API_BASE_URL}/api/gemini/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}
```

## 3. Cập nhật geminiService.ts

Thay thế tất cả các function trong `kts-app/services/geminiService.ts`:

### Trước (Old):

```typescript
import { GoogleGenAI } from "@google/genai";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateImages = async (...) => {
  // Direct call to Gemini
  const response = await ai.models.generateContent({...});
  return ...;
};
```

### Sau (New):

```typescript
import { callGeminiAPI } from './apiClient';

export const generateImages = async (
  sourceImage: SourceImage,
  prompt: string,
  renderType: 'exterior' | 'interior' | 'floorplan' | 'masterplan',
  count: number,
  aspectRatio: string,
  referenceImage: SourceImage | null = null,
  isAnglePrompt: boolean = false,
  useRawPrompt: boolean = false,
  modelTier: 'free' | 'pro' = 'free',
  quality: '1K' | '2K' | '4K' = '1K',
): Promise<string[]> => {
  const result = await callGeminiAPI<{ images: string[] }>('generate-images', {
    sourceImage,
    prompt,
    renderType,
    count,
    aspectRatio,
    referenceImage,
    isAnglePrompt,
    useRawPrompt,
    modelTier,
    quality,
  });
  return result.images;
};
```

## 4. Các function cần thay đổi

Tất cả các function sau cần được cập nhật để gọi backend API:

- ✅ `describeInteriorImage`
- ✅ `describeMasterplanImage`
- ✅ `generateImages`
- ✅ `upscaleImage`
- ✅ `editImage`
- ✅ `generateImageFromText`
- ✅ `generatePromptsFromImage`
- ✅ `generateVideo` + `checkVideoStatus`
- ✅ `generateVirtualTourImage`
- ✅ `generateMoodImages`
- ✅ `improveExteriorRender`
- ✅ `improveInteriorRender`
- ✅ `generateInteriorRenderTwoStep`
- ✅ `generateCompletionPrompts`
- ✅ `generateInteriorCompletionPrompts`

## 5. Xóa import không cần thiết

Xóa dòng này khỏi frontend:

```typescript
import { GoogleGenAI } from '@google/genai';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

Và xóa `VITE_GEMINI_API_KEY` khỏi `.env` của frontend.

## 6. Deploy

### Backend (Vercel/Railway/Render)

1. Deploy backend với environment variable `GEMINI_API_KEY`
2. Lưu URL backend (ví dụ: `https://kts-backend.vercel.app`)

### Frontend (Vercel)

1. Thêm environment variable: `VITE_API_URL=https://kts-backend.vercel.app`
2. Deploy frontend

## 7. Testing

Trước khi deploy, test local:

```bash
# Terminal 1 - Backend
cd kts-backend
npm run start:dev

# Terminal 2 - Frontend
cd kts-app
npm run dev
```

Mở `http://localhost:5173` và kiểm tra tất cả các chức năng.

## 8. Notes

- Backend sẽ chạy trên port 3001
- Frontend sẽ gọi backend qua CORS
- API key được bảo mật hoàn toàn ở backend
- Tất cả validation được xử lý ở backend
