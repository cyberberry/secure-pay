import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(userDto: CreateUserDto) {
    const user = await this.userService.findOneByEmail(userDto.email);
    if (!user) {
      throw new NotFoundException({
        message: `User with email ${userDto.email} not found`,
      });
    }
    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );

    if (user && passwordEquals) {
      return user;
    }
    throw new BadRequestException({ message: 'Incorrect password or email' });
  }

  private async generateToken(user: User) {
    const payload = { email: user.email, id: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '60m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(userDto: CreateUserDto) {
    const user = await this.validateUser(userDto);
    if (!user.isActive || user.isBlocked) {
      throw new UnauthorizedException(
        'Cannot login to deactivated or blocked account',
      );
    }
    return this.generateToken(user);
  }

  async registration(userDto: CreateUserDto) {
    const candidate = await this.userService.findOneByEmail(userDto.email);
    if (candidate) {
      throw new BadRequestException('User already exists');
    }
    const user = await this.userService.create({
      ...userDto,
    });

    return this.generateToken(user);
  }

  async refreshTokens(user: User) {
    return this.generateToken(user);
  }
}
