import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * JWT 직후 사용자 활성 여부를 한 번 더 확인합니다.
 * (JwtStrategy에서도 검증하지만 정책 요구사항 충족을 위해 유지)
 */
@Injectable()
export class ActiveUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: User }>();
    const user = req.user;
    if (!user?.is_active) {
      throw new ForbiddenException('비활성화된 계정입니다.');
    }
    return true;
  }
}
