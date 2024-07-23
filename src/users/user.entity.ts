import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/roles/role.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @ApiProperty({ example: '1', description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'user@gmail.com', description: 'User email' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'qwerty123', description: 'User password' })
  @Column({ length: 60 })
  password: string;

  @ApiProperty({ example: '100', description: 'User balance' })
  @Column({ type: 'decimal', default: 0 })
  balance: number;

  @ApiProperty({
    example: 'true',
    description: 'User account status (active or not)',
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: 'false',
    description: 'User account status (blocked or not)',
  })
  @Column({ default: false })
  isBlocked: boolean;

  @ApiProperty({
    example: 'client',
    description: 'User role (client or admin)',
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;
}
