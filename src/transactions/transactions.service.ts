import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from './transaction.entity';
import { User } from '../users/user.entity';
import { UserRole } from 'src/roles/role.enum';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class TransactionsService {
  private webhookUrl =
    'https://webhook.site/26bd6e37-b6cf-48ad-b1d8-55d3fad6139a';
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly httpService: HttpService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: number,
  ): Promise<any> {
    const { amount, type, toUserId } = createTransactionDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Cannot transfer to/from deactivated account',
      );
    }

    if (type === TransactionType.WITHDRAW) {
      if (user.balance < Number(amount)) {
        throw new BadRequestException('Insufficient funds');
      }
      user.balance -= Number(amount);
    } else if (type === TransactionType.DEPOSIT) {
      user.balance = Number(user.balance) + Number(amount);
    } else if (type === TransactionType.TRANSFER) {
      if (user.id == toUserId) {
        throw new BadRequestException(
          'Cannot transfer funds to the same account',
        );
      }
      const toUser = await this.userRepository.findOne({
        where: { id: toUserId },
      });

      if (!toUser) {
        throw new NotFoundException('User-Receiver not found');
      }

      if (!toUser.isActive) {
        throw new BadRequestException(
          'Cannot transfer to/from deactivated account',
        );
      }

      if (user.balance < Number(amount)) {
        throw new BadRequestException(
          "Insufficient funds in the sender's account",
        );
      }

      user.balance = Number(user.balance) - Number(amount);
      toUser.balance = Number(toUser.balance) + Number(amount);
      await this.userRepository.save([user, toUser]);
    }

    const transaction = new Transaction();
    transaction.amount = Number(amount);
    transaction.type = type;
    transaction.status = TransactionStatus.SUCCESS;
    transaction.fromUser = user.id
      ? await this.userRepository.findOne({
          where: { id: user.id },
        })
      : null;
    transaction.toUser = toUserId
      ? await this.userRepository.findOne({
          where: { id: toUserId },
        })
      : null;
    await this.userRepository.save(user);
    const savedTransaction = await this.transactionRepository.save(transaction);
    await this.sendTransactionToWebhook(savedTransaction);

    return {
      id: savedTransaction.id,
      amount,
      type,
      status: TransactionStatus.SUCCESS,
      fromUserId: user.id,
      toUserId: +toUserId,
    };
  }

  findAll(paginationOptions): Promise<Transaction[]> {
    const { page = 1, limit = 10 } = paginationOptions;
    const skip = (page - 1) * limit;
    return this.transactionRepository.find({
      skip,
      take: limit,
      relations: ['fromUser', 'toUser'],
    });
  }

  async findOne(id: number, user: User): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['fromUser', 'toUser'],
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    if (
      user.role !== UserRole.ADMIN && 
      (!transaction.fromUser || transaction.fromUser.id !== user.id) &&
      (!transaction.toUser || transaction.toUser.id !== user.id)
    ) {
      throw new UnauthorizedException(
        'You cannot read/cancel other people`s transactions',
      );
    }
    return transaction;
  }

  async cancel(id: number, user: User): Promise<any> {
    const transaction = await this.findOne(id, user);
    if (
      user.role !== UserRole.ADMIN && 
      (!transaction.fromUser || transaction.fromUser.id !== user.id) &&
      (!transaction.toUser || transaction.toUser.id !== user.id)
    ) {
      throw new UnauthorizedException(
        'You cannot cancel other people`s transactions',
      );
    }
    if (transaction.status === TransactionStatus.CANCELED) {
      throw new BadRequestException('Transaction is already canceled');
    }
    transaction.status = TransactionStatus.CANCELED;

    // Update user's balance
    if (transaction.type === TransactionType.DEPOSIT) {
      transaction.fromUser.balance =
        Number(transaction.fromUser.balance) - Number(transaction.amount);
    } else if (transaction.type === TransactionType.WITHDRAW) {
      transaction.fromUser.balance =
        Number(transaction.fromUser.balance) + Number(transaction.amount);
    } else if (transaction.type === TransactionType.TRANSFER) {
      transaction.fromUser.balance =
        Number(transaction.fromUser.balance) + Number(transaction.amount);
      transaction.toUser.balance =
        Number(transaction.toUser.balance) - Number(transaction.amount);
    }
    if (transaction.fromUser) {
      await this.userRepository.save(transaction.fromUser);
    }
    if (transaction.toUser) {
      await this.userRepository.save(transaction.toUser);
    }

    const savedTransaction = await this.transactionRepository.save(transaction);
    return {
      id: savedTransaction.id,
      amount: savedTransaction.amount,
      type: savedTransaction.type,
      status: savedTransaction.status,
    };
  }

  private async sendTransactionToWebhook(
    transaction: Transaction,
  ): Promise<void> {
    try {
      await this.httpService.post(this.webhookUrl, transaction).toPromise();
    } catch (error) {
      console.error('Failed to send transaction to webhook', error);
    }
  }
}
