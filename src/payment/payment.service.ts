import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Transaction } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import {
  TransactionType,
  TransactionStatus,
  PaymentProvider,
} from '../common/enums';
import { CreateDepositDto, SepayWebhookDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly sepayApiKey: string;
  private readonly sepayApiSecret: string;
  private readonly sepayAccountNumber: string;

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.sepayApiKey = this.configService.getOrThrow<string>('SEPAY_API_KEY');
    this.sepayApiSecret =
      this.configService.getOrThrow<string>('SEPAY_API_SECRET');
    this.sepayAccountNumber = this.configService.getOrThrow<string>(
      'SEPAY_ACCOUNT_NUMBER',
    );
  }

  async createDeposit(
    userId: string,
    createDepositDto: CreateDepositDto,
  ): Promise<{ transaction: Transaction; paymentUrl?: string }> {
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
      // Generate Sepay payment URL/QR code
      const paymentUrl = this.generateSepayPayment(
        transaction.id,
        createDepositDto.amount,
        user.email,
      );

      this.logger.log(`Deposit created for user ${userId}: ${transaction.id}`);

      return {
        transaction,
        paymentUrl,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create Sepay payment: ${errorMessage}`);
      transaction.status = TransactionStatus.FAILED;
      await this.transactionRepository.save(transaction);
      throw new BadRequestException(
        'Failed to create payment. Please try again.',
      );
    }
  }

  private generateSepayPayment(
    transactionId: string,
    amount: number,
    _userEmail: string,
  ): string {
    // Sepay integration - This is a simplified example
    // You'll need to adjust based on Sepay's actual API documentation

    // const transferContent = `KTS ${transactionId}`;

    // Generate QR code for bank transfer
    // In real implementation, you would call Sepay API here
    // const qrData = {
    //   accountNo: this.sepayAccountNumber,
    //   accountName: 'KTS Company',
    //   amount: amount,
    //   description: transferContent,
    // };

    // Return payment instructions or QR code URL
    return `https://sepay.vn/payment?ref=${transactionId}&amount=${amount}`;
  }
  async handleSepayWebhook(webhookDto: SepayWebhookDto): Promise<void> {
    this.logger.log(`Received Sepay webhook: ${webhookDto.transaction_id}`);

    // Extract transaction ID from transfer content
    const match = webhookDto.transaction_content.match(/KTS ([a-f0-9-]+)/i);
    if (!match) {
      this.logger.warn('Invalid transaction content format');
      return;
    }

    const transactionId = match[1];
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user'],
    });

    if (!transaction) {
      this.logger.warn(`Transaction not found: ${transactionId}`);
      return;
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      this.logger.warn(`Transaction already processed: ${transactionId}`);
      return;
    }

    // Verify webhook signature (implement based on Sepay docs)
    // if (!this.verifyWebhookSignature(webhookDto)) {
    //   throw new BadRequestException('Invalid webhook signature');
    // }

    if (
      webhookDto.status === 'success' &&
      webhookDto.amount >= transaction.amount
    ) {
      await this.completeDeposit(transaction, webhookDto.transaction_id);
    } else {
      transaction.status = TransactionStatus.FAILED;
      transaction.metadata = { webhookData: webhookDto };
      await this.transactionRepository.save(transaction);
      this.logger.warn(`Deposit failed: ${transactionId}`);
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
