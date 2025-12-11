import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// @ts-ignore - Package may not have type definitions
import { SePayPgClient } from 'sepay-pg-node';

export interface SepayCreateOrderRequest {
  amount: number;
  description?: string;
  orderId: string;
  invoiceNumber?: string;
  successUrl?: string;
  errorUrl?: string;
  cancelUrl?: string;
}

export interface SepayCheckoutFormResponse {
  checkoutUrl: string;
  formFields: Record<string, string | number>;
}

export interface SepayWebhookPayload {
  transaction_id: string;
  amount: number;
  account_number: string;
  transaction_content: string;
  status: string;
  transaction_date?: string;
  signature?: string;
}

@Injectable()
export class SepayService {
  private readonly logger = new Logger(SepayService.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly sepayClient: SePayPgClient;
  private readonly env: 'sandbox' | 'production';

  constructor(private readonly configService: ConfigService) {
    this.merchantId =
      this.configService.getOrThrow<string>('SEPAY_MERCHANT_ID');
    this.secretKey =
      this.configService.getOrThrow<string>('SEPAY_API_SECRET');

    // Xác định environment (sandbox hoặc production)
    const envString = this.configService.get<string>('SEPAY_ENV') || 'sandbox';
    this.env = envString === 'production' ? 'production' : 'sandbox';

    // Khởi tạo Sepay SDK client
    this.sepayClient = new SePayPgClient({
      env: this.env,
      merchant_id: this.merchantId,
      secret_key: this.secretKey,
    });

    // Log config để debug (không log secret)
    this.logger.log(
      `Sepay Service initialized - Merchant ID: ${this.merchantId}, Environment: ${this.env}`,
    );
  }

  /**
   * Tạo checkout form cho thanh toán Sepay
   * @param request Thông tin đơn hàng
   * @returns Checkout URL và form fields
   */
  async createCheckoutForm(
    request: SepayCreateOrderRequest,
  ): Promise<SepayCheckoutFormResponse> {
    try {
      // Lấy checkout URL từ SDK
      const checkoutURL = this.sepayClient.checkout.initCheckoutUrl();

      // Lấy base URL từ config hoặc mặc định
      const baseUrl =
        this.configService.get<string>('BACKEND_URL') ||
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';

      // Tạo form fields cho thanh toán
      const checkoutFormfields =
        this.sepayClient.checkout.initOneTimePaymentFields({
          operation: 'PURCHASE',
          payment_method: 'BANK_TRANSFER',
          order_invoice_number:
            request.invoiceNumber || `INV-${Date.now()}`,
          order_amount: request.amount,
          currency: 'VND',
          order_description:
            request.description || `Payment for order ${request.orderId}`,
          success_url:
            request.successUrl ||
            `${baseUrl}/api/payment/success?order_id=${request.orderId}`,
          error_url:
            request.errorUrl ||
            `${baseUrl}/api/payment/error?order_id=${request.orderId}`,
          cancel_url:
            request.cancelUrl ||
            `${baseUrl}/api/payment/cancel?order_id=${request.orderId}`,
        });

      this.logger.debug(
        `Created Sepay checkout form for order: ${request.orderId}`,
      );

      return {
        checkoutUrl: checkoutURL,
        formFields: checkoutFormfields,
      };
    } catch (error) {
      this.logger.error('Failed to create Sepay checkout form:', error);
      throw new Error(
        `Sepay Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Lấy checkout URL (dùng để tạo form)
   * @returns Checkout URL
   */
  getCheckoutUrl(): string {
    return this.sepayClient.checkout.initCheckoutUrl();
  }

}

