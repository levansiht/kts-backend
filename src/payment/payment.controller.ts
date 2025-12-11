import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ResponseHelper } from '../common/helpers/response.helper';
import { ApiResponse } from '../common/interfaces/response.interface';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import {
  CreateDepositDto,
  SepayWebhookDto,
  SepayIpnDto,
} from './dto/payment.dto';

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  async createDeposit(
    @Request() req: AuthenticatedRequest,
    @Body() createDepositDto: CreateDepositDto,
  ): Promise<ApiResponse> {
    const result = await this.paymentService.createDeposit(
      req.user.sub,
      createDepositDto,
    );
    return ResponseHelper.created(
      result,
      'Deposit request created successfully',
    );
  }

  @Post('webhook/sepay')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleSepayWebhook(
    @Body() webhookDto: SepayWebhookDto,
    @Headers('x-sepay-signature') signature?: string,
  ): Promise<ApiResponse> {
    await this.paymentService.handleSepayWebhook(webhookDto, signature);
    return ResponseHelper.success(null, 'Webhook processed successfully');
  }

  /**
   * Endpoint IPN để nhận thông báo thanh toán từ Sepay
   */
  @Post('ipn')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleSepayIpn(@Body() ipnDto: SepayIpnDto): Promise<ApiResponse> {
    await this.paymentService.handleSepayIpn(ipnDto);
    return ResponseHelper.success(null, 'IPN processed successfully');
  }

  /**
   * Callback endpoint khi thanh toán thành công
   */
  @Get('success')
  @Public()
  async handlePaymentSuccess(
    @Query('order_id') orderId?: string,
    @Query('payment') payment?: string,
  ): Promise<ApiResponse> {
    // Có thể redirect về frontend hoặc trả về thông báo
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:3000';
    return ResponseHelper.success(
      {
        message: 'Payment successful',
        orderId,
        redirectUrl: `${frontendUrl}/payment/success?order_id=${orderId}`,
      },
      'Payment completed successfully',
    );
  }

  /**
   * Callback endpoint khi thanh toán thất bại
   */
  @Get('error')
  @Public()
  async handlePaymentError(
    @Query('order_id') orderId?: string,
    @Query('payment') payment?: string,
  ): Promise<ApiResponse> {
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:3000';
    return ResponseHelper.success(
      {
        message: 'Payment failed',
        orderId,
        redirectUrl: `${frontendUrl}/payment/error?order_id=${orderId}`,
      },
      'Payment failed',
    );
  }

  /**
   * Callback endpoint khi người dùng hủy thanh toán
   */
  @Get('cancel')
  @Public()
  async handlePaymentCancel(
    @Query('order_id') orderId?: string,
    @Query('payment') payment?: string,
  ): Promise<ApiResponse> {
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:3000';
    return ResponseHelper.success(
      {
        message: 'Payment cancelled',
        orderId,
        redirectUrl: `${frontendUrl}/payment/cancel?order_id=${orderId}`,
      },
      'Payment cancelled by user',
    );
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getTransactions(
    @Request() req: AuthenticatedRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<ApiResponse> {
    const result = await this.paymentService.getUserTransactions(
      req.user.sub,
      page,
      limit,
    );
    return ResponseHelper.success(
      {
        items: result.transactions,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
      'Transactions fetched successfully',
    );
  }

  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard)
  async getTransaction(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const transaction = await this.paymentService.getTransactionById(
      req.user.sub,
      id,
    );
    return ResponseHelper.success(
      transaction,
      'Transaction fetched successfully',
    );
  }
}
