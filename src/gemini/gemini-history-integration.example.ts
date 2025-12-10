/**
 * Example: How to integrate History tracking in Gemini Service
 *
 * This file shows how to modify Gemini service methods to automatically
 * save history when processing API requests.
 */

import { Injectable, Logger } from '@nestjs/common';
import { HistoryService } from '../history/history.service';
import { PaymentService } from '../payment/payment.service';
import { GeminiActionType } from '../common/enums';

interface GeminiResult {
  text?: string;
  imageUrl?: string;
}

@Injectable()
export class GeminiServiceWithHistory {
  private readonly logger = new Logger(GeminiServiceWithHistory.name);

  constructor(
    private readonly historyService: HistoryService,
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * Example wrapper method for any Gemini API call
   */
  async processWithHistory(
    userId: string,
    actionType: GeminiActionType,
    processFunction: () => Promise<GeminiResult>,
    cost: number,
    params?: Record<string, unknown>,
  ): Promise<GeminiResult> {
    const startTime = Date.now();
    let result: GeminiResult | null = null;
    let error: Error | null = null;

    try {
      // Check if user has enough balance
      // const userTransactions = await this.paymentService.getUserTransactions(
      //   userId,
      //   1,
      //   1,
      // );
      // Implement balance check here

      // Process the actual Gemini API call
      result = await processFunction();

      // Deduct cost from user balance
      if (cost > 0) {
        await this.paymentService.deductBalance(
          userId,
          cost,
          `${actionType} processing`,
        );
      }

      return result;
    } catch (err) {
      error = err instanceof Error ? err : new Error('Unknown error');
      throw err;
    } finally {
      const processingTimeMs = Date.now() - startTime;

      // Save history regardless of success/failure
      await this.historyService.createHistory(userId, {
        actionType,
        prompt: params?.prompt as string | undefined,
        sourceImageUrl: params?.sourceImageUrl as string | undefined,
        resultImageUrl: result?.imageUrl,
        resultText: result?.text,
        parameters: params,
        isSuccess: !error,
        errorMessage: error?.message,
        processingTimeMs,
        cost: error ? 0 : cost,
      });
    }
  }

  /**
   * Example: Describe Interior with history tracking
   */
  async describeInteriorWithHistory(
    userId: string,
    _sourceImage: unknown,
  ): Promise<string> {
    const cost = 0.01; // Example cost in VND or USD

    const result = await this.processWithHistory(
      userId,
      GeminiActionType.DESCRIBE_INTERIOR,
      () => {
        // Your actual Gemini API call here
        const result = 'Description result...';
        return Promise.resolve({ text: result });
      },
      cost,
      {
        sourceImageUrl: 'base64-or-url',
      },
    );

    return result.text || '';
  }

  /**
   * Example: Generate Image with history tracking
   */
  async generateImageWithHistory(
    userId: string,
    prompt: string,
    params: Record<string, unknown>,
  ): Promise<string> {
    const cost = 0.05; // Example cost

    const result = await this.processWithHistory(
      userId,
      GeminiActionType.GENERATE_IMAGE,
      () => {
        // Your actual Gemini image generation call
        const imageUrl = 'generated-image-url';
        return Promise.resolve({ imageUrl });
      },
      cost,
      {
        prompt,
        ...params,
      },
    );

    return result.imageUrl || '';
  }
}

/**
 * Integration Steps:
 *
 * 1. Import HistoryModule and PaymentModule in GeminiModule:
 *    imports: [HistoryModule, PaymentModule]
 *
 * 2. Inject services in GeminiService constructor:
 *    constructor(
 *      private readonly historyService: HistoryService,
 *      private readonly paymentService: PaymentService,
 *    ) {}
 *
 * 3. Wrap each API method with history tracking:
 *    - Track start time
 *    - Execute API call
 *    - Calculate cost
 *    - Deduct from balance
 *    - Save history (success or failure)
 *
 * 4. Update each endpoint in gemini.controller.ts to pass userId:
 *    async describeInterior(@Request() req, @Body() dto) {
 *      return this.geminiService.describeInterior(req.user.sub, dto);
 *    }
 *
 * 5. Define costs for each action type in a config file or constants
 */
