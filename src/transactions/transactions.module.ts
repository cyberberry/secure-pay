import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { User } from 'src/users/user.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User]), HttpModule],
  providers: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
