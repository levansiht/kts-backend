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
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ResponseHelper } from '../common/helpers/response.helper';
import { ApiResponse } from '../common/interfaces/response.interface';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { CreateDepositDto, SepayWebhookDto } from './dto/payment.dto';

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
  ): Promise<ApiResponse> {
    await this.paymentService.handleSepayWebhook(webhookDto);
    return ResponseHelper.success(null, 'Webhook processed successfully');
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
