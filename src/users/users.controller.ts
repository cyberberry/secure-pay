import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Roles } from 'src/roles/role.decorator';
import { UserRole } from 'src/roles/role.enum';
import { RoleGuard } from 'src/roles/role.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtGuard, RoleGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 200, type: User })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  findOneById(@Query('id') id: string) {
    return this.usersService.findOneById(+id);
  }

  @Get('email')
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiResponse({ status: 200, type: User })
  async findOneByEmail(@Query('email') email: string, @Req() req) {
    if (req.user.role === UserRole.CLIENT && req.user.email !== email) {
      throw new ForbiddenException(
        'Clients can only access their own information',
      );
    }
    return this.usersService.findOneByEmail(email);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  deactivate(@Param('id') id: string, @Req() req) {
    if (+id !== req.user.userId) {
      throw new UnauthorizedException(
        'You can only deactivate your own account',
      );
    }
    return this.usersService.deactivate(+id);
  }

  @Patch(':id/block')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Block a user account' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  block(@Param('id') id: string) {
    return this.usersService.block(+id);
  }

  @Patch(':id/unblock')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Unblock a user account' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  unblockUser(@Param('id') id: string) {
    return this.usersService.unblock(+id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
