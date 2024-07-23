import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/roles/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<UserRole>(
      'role',
      context.getHandler(),
    );
    if (!requiredRole) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role;

    if (!userRole || !requiredRole.includes(userRole)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
