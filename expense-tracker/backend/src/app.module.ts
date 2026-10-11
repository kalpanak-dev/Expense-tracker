import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BudgetsModule } from './budgets/budgets.module';
import { RecurringModule } from './recurring/recurring.module';
import { TransactionsModule } from './transactions/transactions.module';
import { User } from './users/user.entity';
import { Transaction } from './transactions/transaction.entity';
import { Budget } from './budgets/budget.entity';
import { RecurringPayment } from './recurring/recurring.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'expense',
      password: process.env.DB_PASSWORD ?? 'expense',
      database: process.env.DB_NAME ?? 'expense',
      entities: [User, Transaction, Budget, RecurringPayment],
      synchronize: true, // fine for a demo; use migrations in production
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
      signOptions: { expiresIn: '1d' },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    TransactionsModule,
    BudgetsModule,
    RecurringModule,
  ],
})
export class AppModule {}
