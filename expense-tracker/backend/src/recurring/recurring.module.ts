import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { RecurringController } from './recurring.controller';
import { RecurringPayment } from './recurring.entity';
import { RecurringService } from './recurring.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecurringPayment, Transaction])],
  controllers: [RecurringController],
  providers: [RecurringService],
})
export class RecurringModule {}
