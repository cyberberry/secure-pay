import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  SUCCESS = 'success',
  CANCELED = 'canceled',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: '1', description: 'Unique identifier' })
  id: number;

  @Column()
  @ApiProperty({ example: '100.00', description: 'Transaction amount' })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  @ApiProperty({ example: 'transfer', description: 'Transaction type' })
  type: TransactionType;
  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @ManyToOne(() => User)
  @ApiProperty({ example: '1', description: 'Transaction sender ID' })
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;

  @ManyToOne(() => User)
  @ApiProperty({ example: '2', description: 'Transaction receiver ID' })
  @JoinColumn({ name: 'toUserId' })
  toUser: User;
}
