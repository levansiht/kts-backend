import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import {
  DescribeInteriorImageDto,
  DescribeMasterplanImageDto,
  GenerateImagesDto,
  UpscaleImageDto,
  EditImageDto,
  GenerateImageFromTextDto,
  GeneratePromptsFromImageDto,
  GenerateVideoDto,
  CheckVideoStatusDto,
  GenerateVirtualTourImageDto,
  GenerateMoodImagesDto,
  GenerateCompletionPromptsDto,
  GenerateInteriorCompletionPromptsDto,
} from './dto/gemini.dto';

@Controller('api/gemini')
@UsePipes(new ValidationPipe({ transform: true }))
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('describe-interior')
  @HttpCode(HttpStatus.OK)
  async describeInteriorImage(@Body() dto: DescribeInteriorImageDto) {
    const description = await this.geminiService.describeInteriorImage(
      dto.sourceImage,
    );
    return { description };
  }

  @Post('describe-masterplan')
  @HttpCode(HttpStatus.OK)
  async describeMasterplanImage(@Body() dto: DescribeMasterplanImageDto) {
    const description = await this.geminiService.describeMasterplanImage(
      dto.sourceImage,
    );
    return { description };
  }

  @Post('generate-images')
  @HttpCode(HttpStatus.OK)
  async generateImages(@Body() dto: GenerateImagesDto) {
    const images = await this.geminiService.generateImages({
      sourceImage: dto.sourceImage,
      prompt: dto.prompt,
      renderType: dto.renderType,
      count: dto.count,
      aspectRatio: dto.aspectRatio,
      referenceImage: dto.referenceImage,
      isAnglePrompt: dto.isAnglePrompt,
      useRawPrompt: dto.useRawPrompt,
      modelTier: dto.modelTier,
      quality: dto.quality,
    });
    return { images };
  }

  @Post('upscale-image')
  @HttpCode(HttpStatus.OK)
  async upscaleImage(@Body() dto: UpscaleImageDto) {
    const image = await this.geminiService.upscaleImage({
      sourceImage: dto.sourceImage,
      target: dto.target,
      model: dto.model,
    });
    return { image };
  }

  @Post('edit-image')
  @HttpCode(HttpStatus.OK)
  async editImage(@Body() dto: EditImageDto) {
    const image = await this.geminiService.editImage({
      sourceImage: dto.sourceImage,
      maskImage: dto.maskImage,
      prompt: dto.prompt,
    });
    return { image };
  }

  @Post('generate-from-text')
  @HttpCode(HttpStatus.OK)
  async generateImageFromText(@Body() dto: GenerateImageFromTextDto) {
    const image = await this.geminiService.generateImageFromText(dto.prompt);
    return { image };
  }

  @Post('generate-prompts')
  @HttpCode(HttpStatus.OK)
  async generatePromptsFromImage(@Body() dto: GeneratePromptsFromImageDto) {
    const prompts = await this.geminiService.generatePromptsFromImage(
      dto.sourceImage,
    );
    return prompts;
  }

  @Post('generate-video')
  @HttpCode(HttpStatus.OK)
  async generateVideo(@Body() dto: GenerateVideoDto) {
    const result = await this.geminiService.generateVideo({
      prompt: dto.prompt,
      sourceImage: dto.sourceImage || null,
    });
    return result;
  }

  @Get('check-video-status')
  async checkVideoStatus(@Query() dto: CheckVideoStatusDto) {
    const result = await this.geminiService.checkVideoStatus(dto.operationId);
    return result;
  }

  @Post('virtual-tour')
  @HttpCode(HttpStatus.OK)
  async generateVirtualTourImage(@Body() dto: GenerateVirtualTourImageDto) {
    const image = await this.geminiService.generateVirtualTourImage({
      sourceImage: dto.sourceImage,
      moveType: dto.moveType,
      magnitude: dto.magnitude,
    });
    return { image };
  }

  @Post('mood-images')
  @HttpCode(HttpStatus.OK)
  async generateMoodImages(@Body() dto: GenerateMoodImagesDto) {
    const images = await this.geminiService.generateMoodImages(dto.sourceImage);
    return { images };
  }

  @Post('completion-prompts')
  @HttpCode(HttpStatus.OK)
  async generateCompletionPrompts(@Body() dto: GenerateCompletionPromptsDto) {
    const prompts = await this.geminiService.generateCompletionPrompts(
      dto.sourceImage,
    );
    return { prompts };
  }

  @Post('interior-completion-prompts')
  @HttpCode(HttpStatus.OK)
  async generateInteriorCompletionPrompts(
    @Body() dto: GenerateInteriorCompletionPromptsDto,
  ) {
    const prompts = await this.geminiService.generateInteriorCompletionPrompts(
      dto.sourceImage,
    );
    return { prompts };
  }

  @Get('health')
  healthCheck() {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }
}
