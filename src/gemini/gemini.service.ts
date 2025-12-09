import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import type { GenerateContentResponse } from '@google/genai';
import { SourceImageDto } from '../common/dto/source-image.dto';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not set');
      throw new Error('GEMINI_API_KEY is required');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  private extractBase64Image(response: GenerateContentResponse): string | null {
    if (!response.candidates || response.candidates.length === 0) {
      return null;
    }
    const candidate = response.candidates[0];
    if (!candidate?.content?.parts) {
      return null;
    }
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  }

  private getClosestAspectRatio(width: number, height: number): string {
    const targetRatio = width / height;
    const supported = [
      { name: '1:1', ratio: 1 },
      { name: '4:3', ratio: 4 / 3 },
      { name: '3:4', ratio: 3 / 4 },
      { name: '16:9', ratio: 16 / 9 },
      { name: '9:16', ratio: 9 / 16 },
    ];

    let closest = supported[0];
    let minDiff = Math.abs(targetRatio - closest.ratio);

    for (const option of supported) {
      const diff = Math.abs(targetRatio - option.ratio);
      if (diff < minDiff) {
        minDiff = diff;
        closest = option;
      }
    }

    return closest.name;
  }

  async describeInteriorImage(sourceImage: SourceImageDto): Promise<string> {
    const engineeredPrompt =
      "Analyze the provided image of a room. Your response must be a concise prompt in Vietnamese, suitable for regenerating a photorealistic version of the image. The prompt must start with the exact phrase: 'tạo ảnh chụp thực tế của căn phòng...'. Following that phrase, briefly describe the room's key materials and lighting to achieve a realistic photographic look. Keep the description short and focused.";

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: sourceImage.base64,
              mimeType: sourceImage.mimeType,
            },
          },
          { text: engineeredPrompt },
        ],
      },
    });

    return response.text?.trim() || '';
  }

  async describeMasterplanImage(sourceImage: SourceImageDto): Promise<string> {
    const engineeredPrompt =
      "Analyze the provided 2D masterplan image. Your response must be a concise prompt in Vietnamese, suitable for generating a photorealistic 3D render of the project. The prompt must start with the exact phrase: 'Biến masterplan này thành ảnh chụp dự án...'. Following that phrase, briefly describe the project's key features like 'khu nghỉ dưỡng ven biển', 'khu đô thị hiện đại', 'công viên trung tâm' based on the drawing. Keep the description short and focused.";

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: sourceImage.base64,
              mimeType: sourceImage.mimeType,
            },
          },
          { text: engineeredPrompt },
        ],
      },
    });

    return response.text?.trim() || '';
  }

  async generateImages(params: {
    sourceImage: SourceImageDto;
    prompt: string;
    renderType: 'exterior' | 'interior' | 'floorplan' | 'masterplan';
    count: number;
    aspectRatio: string;
    referenceImage?: SourceImageDto | null;
    isAnglePrompt?: boolean;
    useRawPrompt?: boolean;
    modelTier?: 'free' | 'pro';
    quality?: '1K' | '2K' | '4K';
  }): Promise<string[]> {
    const {
      sourceImage,
      prompt,
      renderType,
      count,
      aspectRatio,
      referenceImage = null,
      isAnglePrompt = false,
      useRawPrompt = false,
      modelTier = 'free',
      quality = '1K',
    } = params;

    const generationPromises = Array(count)
      .fill(0)
      .map(async () => {
        const textPart = { text: prompt };
        const parts: any[] = [
          {
            inlineData: {
              data: sourceImage.base64,
              mimeType: sourceImage.mimeType,
            },
          },
        ];

        if (referenceImage) {
          parts.push({
            inlineData: {
              data: referenceImage.base64,
              mimeType: referenceImage.mimeType,
            },
          });
        }

        if (useRawPrompt) {
          // Use the prompt as-is
        } else if (isAnglePrompt) {
          let subject: string;
          let sketchType: string;
          switch (renderType) {
            case 'exterior':
              subject = 'building';
              sketchType = 'architectural sketch';
              break;
            case 'interior':
              subject = 'room';
              sketchType = 'interior sketch';
              break;
            case 'masterplan':
              subject = 'masterplan';
              sketchType = '3D render';
              break;
            case 'floorplan':
              subject = 'room';
              sketchType = '3D interior render';
              break;
            default:
              subject = 'room';
              sketchType = 'interior sketch';
              break;
          }
          textPart.text = `The user wants to change the camera angle of the provided ${sketchType}. Render the exact same ${subject} from the image, but from this new perspective: "${prompt}". The prompt's main goal is to define the camera shot, not to add new content to the scene.`;
        } else if (renderType === 'masterplan') {
          textPart.text = `You are an expert 3D architectural visualizer specializing in large-scale masterplans. Your task is to convert the provided 2D masterplan drawing into a photorealistic 3D aerial or bird's-eye view render. The user's request for the specific camera angle and mood is: "${prompt}". Create a beautiful and realistic image based on these instructions, accurately representing the layout of buildings, landscapes, roads, and water bodies.`;
        } else if (renderType === 'floorplan') {
          if (referenceImage) {
            textPart.text = `The user's prompt is: "${prompt}". You are an expert 3D architectural visualizer. Your task is to convert the provided 2D floorplan (first image) into a photorealistic 3D interior render. You MUST adhere strictly to the layout from the floorplan. The second image is a reference for style ONLY. You must apply the mood, lighting, materials, and color palette from this second image to the room generated from the floorplan. It is forbidden to copy any structural elements or furniture layout from the style reference image. The final render should be from a human-eye level perspective inside the room.`;
          } else {
            textPart.text = `You are an expert 3D architectural visualizer. Your task is to convert the provided 2D floorplan image into a photorealistic 3D interior render, viewed from a human-eye level perspective inside the room. Adhere strictly to the layout, dimensions, and placement of walls, doors, and windows as shown in the floorplan. The user's request is: "${prompt}". Create a beautiful and realistic image based on these instructions.`;
          }
        } else if (referenceImage) {
          const subjectType = renderType === 'exterior' ? 'building' : 'room';
          const shotType =
            renderType === 'exterior' ? 'exterior shot' : 'interior shot';
          textPart.text = `The user's prompt is: "${prompt}". You are creating a realistic architectural render. The first image is the architectural sketch. You MUST use the exact structure, form, and layout from this first sketch. The second image is a reference for style ONLY. You must apply the mood, lighting, and color palette from the second image to the ${subjectType} from the first sketch. It is forbidden to copy any shapes, objects, architectural elements, or scene composition (like window frames or foreground elements) from the second style-reference image. The final render must be an ${shotType} based on the user's prompt.`;
        } else if (renderType === 'interior') {
          textPart.text = `You are an expert 3D architectural visualizer specializing in photorealistic interior renders. Your task is to convert the provided interior design sketch or image into a high-quality, realistic photograph. The user's specific request is: "${prompt}". Create a beautiful and realistic image based on these instructions, paying close attention to materials, lighting, and atmosphere to achieve a convincing result.`;
        } else {
          textPart.text = prompt;
        }

        const modelName =
          modelTier === 'pro'
            ? 'gemini-3-pro-image-preview'
            : 'gemini-2.5-flash-image';
        const config: Record<string, any> = {
          responseModalities: [Modality.IMAGE],
        };

        if (modelTier === 'pro') {
          (config as any).imageConfig = {
            imageSize: quality,
          };
          if (aspectRatio && aspectRatio !== 'Auto') {
            (config as any).imageConfig.aspectRatio = aspectRatio;
          }
        } else {
          if (aspectRatio && aspectRatio !== 'Auto') {
            textPart.text += `. The final image must have a ${aspectRatio} aspect ratio`;
          }
        }

        parts.push(textPart);

        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: config as any,
        });
        return this.extractBase64Image(response);
      });

    const results = await Promise.all(generationPromises);
    return results.filter((result): result is string => result !== null);
  }

  async upscaleImage(params: {
    sourceImage: SourceImageDto;
    target: '2k' | '4k';
    model?: 'flash' | 'pro';
  }): Promise<string | null> {
    const { sourceImage, target, model = 'flash' } = params;

    const effectiveModel = target === '2k' || target === '4k' ? 'pro' : model;
    const isPro = effectiveModel === 'pro';
    const modelName = isPro
      ? 'gemini-3-pro-image-preview'
      : 'gemini-2.5-flash-image';

    const prompt = `Upscale this image to ${target.toUpperCase()} resolution. Enhance details, sharpness, and clarity. IMPORTANT: Preserve the exact aspect ratio and composition of the original image. Do not crop or distort. Make it photorealistic.`;

    const config: Record<string, any> = {
      responseModalities: [Modality.IMAGE],
    };

    if (isPro) {
      (config as any).imageConfig = {
        imageSize: target.toUpperCase(),
      };
    }

    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: sourceImage.base64,
              mimeType: sourceImage.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: config as any,
    });

    return this.extractBase64Image(response);
  }

  async editImage(params: {
    sourceImage: SourceImageDto;
    maskImage: SourceImageDto;
    prompt: string;
  }): Promise<string | null> {
    const { sourceImage, maskImage, prompt } = params;

    const engineeredPrompt = `You are an expert photo editor. You will receive an original image, a mask image, and a text prompt. Your task is to edit the original image *exclusively* within the white area defined by the mask. The black area of the mask represents the parts of the image that MUST remain completely untouched. The user's instruction for the edit is: "${prompt}". Whether this involves adding a new object, removing an existing one, or altering features, confine all changes strictly to the masked region. The final output should be a photorealistic image where the edits are seamlessly blended with the surrounding, unchanged areas.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: sourceImage.base64,
              mimeType: sourceImage.mimeType,
            },
          },
          {
            inlineData: {
              data: maskImage.base64,
              mimeType: maskImage.mimeType,
            },
          },
          { text: engineeredPrompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    return this.extractBase64Image(response);
  }

  async generateImageFromText(prompt: string): Promise<string | null> {
    const response = await this.ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;
      if (base64ImageBytes) {
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
    }

    return null;
  }

  async generatePromptsFromImage(
    sourceImage: SourceImageDto,
  ): Promise<{ medium: string[]; closeup: string[]; interior: string[] }> {
    const engineeredPrompt = `Analyze the provided architectural image. Based on its style, materials, and environment, generate a list of diverse and creative prompts for photorealistic renders. Your response must be a JSON object.

  Follow these instructions precisely:
  1.  **Cảnh trung (Medium Shots):** Generate exactly 5 prompts describing medium shots around the building. Focus on angles like the main entrance, garden, garage area, or patio.
  2.  **Cảnh cận (Artistic Close-ups):** Generate exactly 10 prompts for artistic, detailed close-up shots. Be creative. Think about textures, light and shadow, depth of field, and storytelling. Examples: "close-up of a water droplet on a leaf in the foreground with the building blurred in the background," or "detailed shot of the wood grain on the front door under the warm evening light."
  3.  **Cảnh nội thất (Interior Shots):** Generate exactly 5 plausible prompts for interior scenes, inferring the style from the exterior. Describe the mood, lighting, and key furniture. Examples: "a cozy living room with a fireplace, looking out the main window during a rainy day," or "a minimalist bedroom with soft morning light filtering through linen curtains."

  All prompts must be in Vietnamese.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: sourceImage.base64,
              mimeType: sourceImage.mimeType,
            },
          },
          { text: engineeredPrompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            medium: {
              type: Type.ARRAY,
              description: '5 medium shot prompts in Vietnamese.',
              items: { type: Type.STRING },
            },
            closeup: {
              type: Type.ARRAY,
              description: '10 artistic close-up prompts in Vietnamese.',
              items: { type: Type.STRING },
            },
            interior: {
              type: Type.ARRAY,
              description: '5 interior shot prompts in Vietnamese.',
              items: { type: Type.STRING },
            },
          },
          required: ['medium', 'closeup', 'interior'],
        },
      },
    });

    try {
      const jsonText = response.text?.trim() || '';
      const parsedJson = JSON.parse(jsonText);

      if (parsedJson.medium && parsedJson.closeup && parsedJson.interior) {
        return parsedJson as {
          medium: string[];
          closeup: string[];
          interior: string[];
        };
      } else {
        throw new Error('Generated JSON is missing required keys.');
      }
    } catch (error) {
      this.logger.error(
        'Failed to parse JSON response from Gemini:',
        response.text,
      );
      throw new Error('The AI returned an invalid response format.');
    }
  }

  async generateVideo(params: {
    prompt: string;
    sourceImage: SourceImageDto | null;
  }): Promise<{ operationId: string }> {
    const { prompt, sourceImage } = params;

    const videoParams: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
      },
    };

    if (sourceImage) {
      videoParams.image = {
        imageBytes: sourceImage.base64,
        mimeType: sourceImage.mimeType,
      };
    }

    const operation = await this.ai.models.generateVideos(videoParams);

    return { operationId: operation.name || '' };
  }

  async checkVideoStatus(operationId: string): Promise<{
    done: boolean;
    videoUrl?: string;
  }> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const operation = await this.ai.operations.getVideosOperation({
      operation: { name: operationId } as any,
    });

    if (operation.done) {
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        return {
          done: true,
          videoUrl: `${downloadLink}&key=${apiKey}`,
        };
      }
    }

    return { done: false };
  }

  async generateVirtualTourImage(params: {
    sourceImage: SourceImageDto;
    moveType:
      | 'pan-left'
      | 'pan-right'
      | 'pan-up'
      | 'pan-down'
      | 'orbit-left'
      | 'orbit-right'
      | 'zoom-in'
      | 'zoom-out';
    magnitude: number;
  }): Promise<string | null> {
    const { sourceImage, moveType, magnitude } = params;

    const magnitudeText =
      {
        15: 'a small amount',
        30: 'a moderate amount',
        45: 'a large amount',
      }[magnitude as 15 | 30 | 45] || `${magnitude} degrees`;

    const baseInstruction =
      'You are a virtual camera operator. Re-render the provided scene from a new perspective based on the following precise instruction. You must maintain the exact same photorealistic style, architectural details, materials, lighting, and atmosphere as the original image.';

    let prompt = '';
    switch (moveType) {
      case 'pan-left':
        prompt = `${baseInstruction} INSTRUCTION: PAN LEFT ${magnitude} DEGREES. This is a pure yaw rotation from a fixed camera position, as if on a tripod. Do not move the camera's location.`;
        break;
      case 'pan-right':
        prompt = `${baseInstruction} INSTRUCTION: PAN RIGHT ${magnitude} DEGREES. This is a pure yaw rotation from a fixed camera position, as if on a tripod. Do not move the camera's location.`;
        break;
      case 'pan-up':
        prompt = `${baseInstruction} INSTRUCTION: TILT UP ${magnitude} DEGREES. This is a pure pitch rotation from a fixed camera position, as if on a tripod. Do not move the camera's location.`;
        break;
      case 'pan-down':
        prompt = `${baseInstruction} INSTRUCTION: TILT DOWN ${magnitude} DEGREES. This is a pure pitch rotation from a fixed camera position, as if on a tripod. Do not move the camera's location.`;
        break;
      case 'orbit-left':
        prompt = `${baseInstruction} INSTRUCTION: ORBIT LEFT ${magnitude} DEGREES. The camera's physical position must move. Circle the camera to the left around the scene's central subject, keeping it in frame. Do not change camera height or lens properties.`;
        break;
      case 'orbit-right':
        prompt = `${baseInstruction} INSTRUCTION: ORBIT RIGHT ${magnitude} DEGREES. The camera's physical position must move. Circle the camera to the right around the scene's central subject, keeping it in frame. Do not change camera height or lens properties.`;
        break;
      case 'zoom-in':
        prompt = `${baseInstruction} INSTRUCTION: OPTICAL ZOOM IN (${magnitudeText}). The camera's physical position MUST NOT change. Decrease the lens's field of view to magnify the center of the image.`;
        break;
      case 'zoom-out':
        prompt = `${baseInstruction} INSTRUCTION: OPTICAL ZOOM OUT (${magnitudeText}). The camera's physical position MUST NOT change. Increase the lens's field of view to make the scene appear farther away.`;
        break;
    }

    const images = await this.generateImages({
      sourceImage,
      prompt,
      renderType: 'exterior',
      count: 1,
      aspectRatio: 'Auto',
      useRawPrompt: true,
    });

    return images.length > 0 ? images[0] : null;
  }

  async generateMoodImages(sourceImage: SourceImageDto): Promise<string[]> {
    const prompts = [
      'Ảnh chụp thực tế của công trình từ bản sketch, bối cảnh ban ngày lúc 10 giờ sáng với nắng gắt và bóng đổ sắc nét.',
      'Ảnh chụp thực tế của công trình từ bản sketch, bối cảnh giữa trưa lúc 11 giờ, trời nhiều mây (overcast) với ánh sáng mềm, khuếch tán và không có nắng trực tiếp.',
      'Ảnh chụp thực tế của công trình từ bản sketch, trong buổi hoàng hôn lúc 4 giờ chiều với ánh sáng vàng ấm và bóng đổ dài.',
      'Ảnh chụp thực tế của công trình từ bản sketch, trong giờ xanh (blue hour) khoảng 6 giờ tối, với ánh sáng xanh đậm và đèn nội thất được bật sáng.',
    ];

    const generationPromises = prompts.map((prompt) =>
      this.generateImages({
        sourceImage,
        prompt,
        renderType: 'exterior',
        count: 1,
        aspectRatio: 'Auto',
        useRawPrompt: true,
      }),
    );

    const results = await Promise.all(generationPromises);
    const flattenedResults = results.flat();

    return flattenedResults.filter(
      (result): result is string => result !== null,
    );
  }

  async generateCompletionPrompts(
    sourceImage: SourceImageDto,
  ): Promise<string[]> {
    const engineeredPrompt = `Analyze the provided image of an unfinished construction site in Vietnam. Your goal is to suggest ways to complete it. Generate exactly 10 diverse and creative prompts in Vietnamese for photorealistic renders. The prompts must describe popular architectural styles for residential houses in Vietnam (e.g., Modern, Neoclassical, Indochine, Tropical, Tube House styles). Each prompt must start with 'Ảnh chụp thực tế hoàn thiện công trình'. Your response must be a JSON object with a single key "prompts" which is an array of 10 strings.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: sourceImage.base64,
              mimeType: sourceImage.mimeType,
            },
          },
          { text: engineeredPrompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompts: {
              type: Type.ARRAY,
              description: '10 completion prompts in Vietnamese.',
              items: { type: Type.STRING },
            },
          },
          required: ['prompts'],
        },
      },
    });

    try {
      const jsonText = response.text?.trim() || '';
      const parsedJson = JSON.parse(jsonText);

      if (
        parsedJson.prompts &&
        Array.isArray(parsedJson.prompts) &&
        parsedJson.prompts.length > 0
      ) {
        return parsedJson.prompts as string[];
      } else {
        throw new Error("Generated JSON is missing the 'prompts' array.");
      }
    } catch (error) {
      this.logger.error(
        'Failed to parse JSON response from Gemini:',
        response.text,
      );
      throw new Error('The AI returned an invalid response format.');
    }
  }

  async generateInteriorCompletionPrompts(
    sourceImage: SourceImageDto,
  ): Promise<string[]> {
    const engineeredPrompt = `Analyze the provided image of an unfinished, empty room in Vietnam. Your goal is to suggest ways to furnish and complete it. Generate exactly 10 diverse and creative prompts in Vietnamese for photorealistic interior renders. The prompts must describe popular interior design styles in Vietnam (e.g., Modern, Indochine, Scandinavian, Minimalist, Wabi-sabi, Neoclassical). Each prompt must start with 'Hoàn thiện nội thất căn phòng theo phong cách'. Your response must be a JSON object with a single key "prompts" which is an array of 10 strings.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: sourceImage.base64,
              mimeType: sourceImage.mimeType,
            },
          },
          { text: engineeredPrompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompts: {
              type: Type.ARRAY,
              description: '10 interior completion prompts in Vietnamese.',
              items: { type: Type.STRING },
            },
          },
          required: ['prompts'],
        },
      },
    });

    try {
      const jsonText = response.text?.trim() || '';
      const parsedJson = JSON.parse(jsonText);

      if (
        parsedJson.prompts &&
        Array.isArray(parsedJson.prompts) &&
        parsedJson.prompts.length > 0
      ) {
        return parsedJson.prompts as string[];
      } else {
        throw new Error("Generated JSON is missing the 'prompts' array.");
      }
    } catch (error) {
      this.logger.error(
        'Failed to parse JSON response from Gemini:',
        response.text,
      );
      throw new Error('The AI returned an invalid response format.');
    }
  }
}
