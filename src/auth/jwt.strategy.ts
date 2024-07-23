import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        '91fdc764ec8595d0d6855a0f51b95ea907a7440ee761526f010446ffa5270200',
    });
  }

  async validate(payload: any): Promise<User> {
    const { id } = payload;
    const user = await this.usersService.findOneById(+id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
