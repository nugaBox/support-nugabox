import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

/** 로컬 개발 전용 기본 비밀번호(seed.ts 관리자와 동일). 운영에서는 INITIAL_ADMIN_PASSWORD 필수. */
const DEV_FALLBACK_INITIAL_ADMIN_PASSWORD = 'Admin12345!';

@Injectable()
export class BootstrapAdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapAdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private normUsername(raw: string) {
    return raw.trim().toLowerCase();
  }

  async onApplicationBootstrap() {
    const anyUser = await this.prisma.user.count();
    if (anyUser > 0) {
      this.logger.log(
        'Initial admin skipped: at least one user row already exists in the database.',
      );
      return;
    }

    const nodeEnv = this.config.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
    const isProd = nodeEnv === 'production';

    const rawUsername = this.config.get<string>('INITIAL_ADMIN_USERNAME');
    const username = this.normUsername(rawUsername ?? 'admin');
    if (!username) {
      this.logger.warn(
        'Initial admin skipped: INITIAL_ADMIN_USERNAME is empty after normalization.',
      );
      return;
    }

    const fromEnv = this.config.get<string>('INITIAL_ADMIN_PASSWORD')?.trim();
    let password = fromEnv;
    if (!password) {
      if (isProd) {
        this.logger.warn(
          'Initial admin skipped: empty database but INITIAL_ADMIN_PASSWORD is unset (required in production).',
        );
        return;
      }
      password = DEV_FALLBACK_INITIAL_ADMIN_PASSWORD;
    }

    const name =
      this.config.get<string>('INITIAL_ADMIN_NAME')?.trim() || '관리자';

    try {
      const password_hash = await bcrypt.hash(password, 10);
      await this.prisma.user.create({
        data: {
          username,
          password_hash,
          name,
          role: Role.ADMIN,
          is_active: true,
        },
      });
      const suffix = fromEnv
        ? ''
        : ' (non-production: used built-in dev default password; set INITIAL_ADMIN_PASSWORD)';
      this.logger.log(`Initial admin created (username=${username}).${suffix}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Initial admin not created (${msg}); continuing application startup.`,
      );
    }
  }
}
