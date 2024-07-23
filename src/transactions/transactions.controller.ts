import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Roles } from '../roles/role.decorator';
import { UserRole } from '../roles/role.enum';
import { Transaction } from './transaction.entity';
import { RoleGuard } from 'src/roles/role.guard';
import { JwtGuard } from 'src/auth/jwt.guard';

@ApiTags('transactions')
@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Cannot transfer to/from deactivated account',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Insufficient funds in the senders account',
  })
  async create(@Body() createTransactionDto: CreateTransactionDto, @Req() req) {
    const user = req.user;
    return this.transactionsService.create(createTransactionDto, user.id);
  }

  @Get(':id')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction found successfully' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You cannot read other people`s transactions',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  async findOne(@Param('id') id: number, @Req() req): Promise<Transaction> {
    const user = req.user;
    return this.transactionsService.findOne(id, user);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'Transactions found successfully' })
  async findAll(@Query() paginationOptions): Promise<Transaction[]> {
    return this.transactionsService.findAll(paginationOptions);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel a transaction' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'You cannot read other people`s transactions',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Transaction is already canceled',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction canceled successfully',
  })
  async cancel(@Param('id') id: number, @Req() req) {
    const user = req.user;
    return this.transactionsService.cancel(id, user);
  }
}
