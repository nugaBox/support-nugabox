import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), deleted_at: null },
    });
    if (!user) return null;
    if (!user.is_active) {
      throw new UnauthorizedException('비활성화된 계정입니다.');
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    const accessToken = await this.signAccessToken(user.id, user.email, user.role);
    const refreshPlain = randomBytes(48).toString('hex');
    const refreshHash = createHash('sha256').update(refreshPlain).digest('hex');
    const expiresAt = this.computeRefreshExpiry(
      String(this.config.get('REFRESH_TOKEN_EXPIRES_IN') ?? '7d'),
    );
    await this.prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: refreshHash,
        expires_at: expiresAt,
      },
    });
    const refreshToken = refreshPlain;
    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '15m',
      user: this.toPublicUser(user),
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken?.trim()) {
      throw new UnauthorizedException('리프레시 토큰이 필요합니다.');
    }
    const hash = createHash('sha256').update(refreshToken.trim()).digest('hex');
    const row = await this.prisma.refreshToken.findUnique({
      where: { token_hash: hash },
      include: { user: true },
    });
    if (!row || row.expires_at < new Date()) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
    const user = row.user;
    if (!user.is_active || user.deleted_at) {
      throw new UnauthorizedException('비활성화된 계정입니다.');
    }
    const accessToken = await this.signAccessToken(user.id, user.email, user.role);
    return { accessToken, user: this.toPublicUser(user) };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken?.trim()) {
      const hash = createHash('sha256').update(refreshToken.trim()).digest('hex');
      await this.prisma.refreshToken.deleteMany({ where: { user_id: userId, token_hash: hash } });
    } else {
      await this.prisma.refreshToken.deleteMany({ where: { user_id: userId } });
    }
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deleted_at: null },
    });
    if (!user || !user.is_active) {
      throw new UnauthorizedException();
    }
    return this.toPublicUser(user);
  }

  /** 예: 7d, 12h, 30m — 숫자+단위 형식 */
  private computeRefreshExpiry(expiresIn: string): Date {
    const s = expiresIn.trim();
    const num = Number.parseInt(/\d+/.exec(s)?.[0] ?? '7', 10);
    let ms = num * 24 * 60 * 60 * 1000;
    if (s.endsWith('h')) ms = num * 60 * 60 * 1000;
    else if (s.endsWith('m')) ms = num * 60 * 1000;
    else if (s.endsWith('s')) ms = num * 1000;
    return new Date(Date.now() + ms);
  }

  private async signAccessToken(userId: string, email: string, role: Role) {
    const payload: JwtPayload = { sub: userId, email, role };
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '15m',
    });
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString(),
    };
  }
}
