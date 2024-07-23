import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { TransactionType } from '../transaction.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ example: '100.00', description: 'Transaction amount' })
  amount: number;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  @ApiProperty({ example: 'transfer', description: 'Transaction type' })
  type: TransactionType;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: '1',
    description: 'Transaction receiver ID. Not needed for deposit and withdraw',
  })
  toUserId?: number;
}
