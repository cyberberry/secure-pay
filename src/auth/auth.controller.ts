import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @ApiOperation({ summary: 'Login to App' })
  async login(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.login(userDto);
    response.cookie('accessToken', tokens.accessToken, { httpOnly: true });
    response.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
    return tokens;
  }

  @Post('/registration')
  @ApiOperation({ summary: 'Registration to App' })
  async registration(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.registration(userDto);
    response.cookie('accessToken', tokens.accessToken, { httpOnly: true });
    response.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
  }
}
