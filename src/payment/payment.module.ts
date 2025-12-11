import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SepayService } from './sepay.service';
import { Transaction } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User])],
  controllers: [PaymentController],
  providers: [PaymentService, SepayService],
  exports: [PaymentService],
})
export class PaymentModule {}
