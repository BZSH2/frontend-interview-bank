import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const adminToken = this.configService.get<string>('ADMIN_TOKEN')?.trim();
    if (!adminToken) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const headerToken = request.headers['x-admin-token'];
    const currentToken = Array.isArray(headerToken) ? headerToken[0] : headerToken;

    if (currentToken && currentToken === adminToken) {
      return true;
    }

    throw new UnauthorizedException('Admin token is invalid or missing');
  }
}
