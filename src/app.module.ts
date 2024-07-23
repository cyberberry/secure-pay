import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { Transaction } from './transactions/transaction.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'admin',
      password: 'adminpassword',
      database: 'testdb',
      entities: [User, Transaction],
      synchronize: true,
    }),
    UsersModule,
    TransactionsModule,
    AuthModule,
    HttpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
