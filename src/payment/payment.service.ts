import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import {
  TransactionType,
  TransactionStatus,
  PaymentProvider,
} from '../common/enums';
import {
  CreateDepositDto,
  SepayWebhookDto,
  SepayIpnDto,
} from './dto/payment.dto';
import { SepayService } from './sepay.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly sepayService: SepayService,
  ) {}

  async createDeposit(
    userId: string,
    createDepositDto: CreateDepositDto,
  ): Promise<{
    transaction: Transaction;
    checkoutUrl: string;
    formFields: Record<string, string | number>;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create pending transaction
    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      amount: createDepositDto.amount,
      balanceBefore: Number(user.balance),
      provider: PaymentProvider.SEPAY,
      description: createDepositDto.description || 'Deposit to account',
    });

    await this.transactionRepository.save(transaction);

    try {
      // Lấy base URL từ config
      const baseUrl =
        process.env.BACKEND_URL ||
        process.env.FRONTEND_URL ||
        'http://localhost:3000';

      // Tạo checkout form từ Sepay SDK
      const checkoutForm = await this.sepayService.createCheckoutForm({
        amount: createDepositDto.amount,
        description: createDepositDto.description || `Deposit to account - ${user.email}`,
        orderId: transaction.id,
        invoiceNumber: `INV-${transaction.id.slice(0, 8).toUpperCase()}-${Date.now()}`,
        successUrl: `${baseUrl}/api/payment/success?order_id=${transaction.id}`,
        errorUrl: `${baseUrl}/api/payment/error?order_id=${transaction.id}`,
        cancelUrl: `${baseUrl}/api/payment/cancel?order_id=${transaction.id}`,
      });

      // Lưu checkout info vào metadata
      transaction.metadata = {
        checkoutUrl: checkoutForm.checkoutUrl,
        formFields: checkoutForm.formFields,
        invoiceNumber: `INV-${transaction.id.slice(0, 8).toUpperCase()}-${Date.now()}`,
      };
      await this.transactionRepository.save(transaction);

      this.logger.log(`Deposit created for user ${userId}: ${transaction.id}`);

      return {
        transaction,
        checkoutUrl: checkoutForm.checkoutUrl,
        formFields: checkoutForm.formFields,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create Sepay payment: ${errorMessage}`);
      transaction.status = TransactionStatus.FAILED;
      await this.transactionRepository.save(transaction);
      throw new BadRequestException(
        `Failed to create payment: ${errorMessage}. Please try again.`,
      );
    }
  }
  /**
   * Xử lý IPN (Instant Payment Notification) từ Sepay
   * @param ipnDto Dữ liệu IPN từ Sepay
   */
  async handleSepayIpn(ipnDto: SepayIpnDto): Promise<void> {
    this.logger.log(
      `Received Sepay IPN: ${ipnDto.notification_type} for order ${ipnDto.order.order_invoice_number}`,
    );

    // Chỉ xử lý khi notification type là ORDER_PAID
    if (ipnDto.notification_type !== 'ORDER_PAID') {
      this.logger.warn(
        `Ignoring IPN with notification_type: ${ipnDto.notification_type}`,
      );
      return;
    }

    // Tìm transaction theo invoice number
    const invoiceNumber = ipnDto.order.order_invoice_number;
    const transaction = await this.transactionRepository.findOne({
      where: { id: invoiceNumber.split('-')[1] || invoiceNumber },
      relations: ['user'],
    });

    // Nếu không tìm thấy bằng invoice number, thử tìm bằng order_id
    let foundTransaction = transaction;
    if (!foundTransaction) {
      // Extract transaction ID từ invoice number hoặc order_id
      const possibleIds = [
        invoiceNumber,
        ipnDto.order.order_id,
        ipnDto.transaction.transaction_id,
      ];

      for (const id of possibleIds) {
        foundTransaction = await this.transactionRepository.findOne({
          where: { id },
          relations: ['user'],
        });
        if (foundTransaction) break;
      }
    }

    if (!foundTransaction) {
      this.logger.warn(
        `Transaction not found for IPN invoice: ${invoiceNumber}`,
      );
      return;
    }

    // Kiểm tra transaction status
    if (foundTransaction.status !== TransactionStatus.PENDING) {
      this.logger.warn(
        `Transaction already processed: ${foundTransaction.id}, current status: ${foundTransaction.status}`,
      );
      return;
    }

    // Kiểm tra transaction status từ IPN
    if (
      ipnDto.transaction.transaction_status === 'APPROVED' &&
      ipnDto.order.order_status === 'CAPTURED'
    ) {
      // Thanh toán thành công
      await this.completeDeposit(
        foundTransaction,
        ipnDto.transaction.transaction_id,
      );

      // Lưu thêm thông tin từ IPN vào metadata
      foundTransaction.metadata = {
        ...(foundTransaction.metadata || {}),
        ipnData: {
          orderId: ipnDto.order.id,
          transactionId: ipnDto.transaction.id,
          paymentMethod: ipnDto.transaction.payment_method,
          transactionDate: ipnDto.transaction.transaction_date,
        },
      };
      await this.transactionRepository.save(foundTransaction);

      this.logger.log(
        `Deposit completed via IPN for transaction: ${foundTransaction.id}`,
      );
    } else {
      // Thanh toán thất bại hoặc bị hủy
      foundTransaction.status = TransactionStatus.FAILED;
      foundTransaction.metadata = {
        ...(foundTransaction.metadata || {}),
        ipnData: ipnDto,
        failureReason: `Transaction status: ${ipnDto.transaction.transaction_status}, Order status: ${ipnDto.order.order_status}`,
      };
      await this.transactionRepository.save(foundTransaction);
      this.logger.warn(
        `Deposit failed via IPN for transaction: ${foundTransaction.id}`,
      );
    }
  }

  async handleSepayWebhook(
    webhookDto: SepayWebhookDto,
    signature?: string,
  ): Promise<void> {
    this.logger.log(`Received Sepay webhook: ${webhookDto.transaction_id}`);

    // TODO: Implement signature verification nếu Sepay yêu cầu
    // Hiện tại IPN mới sử dụng format khác, webhook cũ này có thể không còn dùng
    if (signature) {
      this.logger.warn(
        'Signature verification not implemented for legacy webhook format',
      );
      // Có thể implement verify signature ở đây nếu cần
    }

    // Tìm transaction theo external transaction ID hoặc từ transaction_content
    let transaction = await this.transactionRepository.findOne({
      where: { externalTransactionId: webhookDto.transaction_id },
      relations: ['user'],
    });

    // Nếu không tìm thấy, thử extract từ transaction_content
    if (!transaction && webhookDto.transaction_content) {
      const match = webhookDto.transaction_content.match(/KTS ([a-f0-9-]+)/i);
      if (match) {
        const transactionId = match[1];
        transaction = await this.transactionRepository.findOne({
          where: { id: transactionId },
          relations: ['user'],
        });
      }
    }

    if (!transaction) {
      this.logger.warn(
        `Transaction not found for webhook: ${webhookDto.transaction_id}`,
      );
      return;
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      this.logger.warn(`Transaction already processed: ${transaction.id}`);
      return;
    }

    // Xử lý theo status từ webhook
    if (
      webhookDto.status === 'success' &&
      webhookDto.amount >= transaction.amount
    ) {
      await this.completeDeposit(transaction, webhookDto.transaction_id);
    } else {
      transaction.status = TransactionStatus.FAILED;
      transaction.metadata = {
        ...(transaction.metadata || {}),
        webhookData: webhookDto,
        failureReason: `Status: ${webhookDto.status}, Amount mismatch`,
      };
      await this.transactionRepository.save(transaction);
      this.logger.warn(`Deposit failed: ${transaction.id}`);
    }
  }

  private async completeDeposit(
    transaction: Transaction,
    externalTransactionId: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: transaction.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user balance
      const newBalance = Number(user.balance) + Number(transaction.amount);
      user.balance = newBalance;
      await queryRunner.manager.save(User, user);

      // Update transaction
      transaction.status = TransactionStatus.COMPLETED;
      transaction.balanceAfter = newBalance;
      transaction.externalTransactionId = externalTransactionId;
      await queryRunner.manager.save(Transaction, transaction);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Deposit completed for user ${user.id}: ${transaction.amount} VND`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to complete deposit: ${errorMessage}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deductBalance(
    userId: string,
    amount: number,
    description: string,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (Number(user.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Update user balance
      const newBalance = Number(user.balance) - amount;
      user.balance = newBalance;
      await queryRunner.manager.save(User, user);

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.COMPLETED,
        amount,
        balanceBefore: Number(user.balance),
        balanceAfter: newBalance,
        description,
      });
      await queryRunner.manager.save(Transaction, transaction);

      await queryRunner.commitTransaction();

      this.logger.log(`Balance deducted for user ${userId}: ${amount} VND`);

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to deduct balance: ${errorMessage}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserTransactions(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    return { transactions, total };
  }

  async getTransactionById(
    userId: string,
    transactionId: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }
}
