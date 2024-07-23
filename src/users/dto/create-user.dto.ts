import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'User email' })
  @IsEmail({}, { message: 'Incorrect email' })
  email: string;

  @ApiProperty({ example: 'qwerty123', description: 'User password' })
  @IsString({ message: 'Must be a string' })
  @MinLength(6, { message: 'Min length is 6' })
  password: string;
}
