import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { passwordForFirstAdmin } from '../empty-db-login-material';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BootstrapAdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapAdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    const anyUser = await this.prisma.user.count();
    if (anyUser > 0) {
      this.logger.log(
        'Initial admin skipped: at least one user row already exists in the database.',
      );
      return;
    }

    const username = 'admin';
    const password = passwordForFirstAdmin();
    const name = '관리자';

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
      this.logger.log(`Initial admin created (username=${username}).`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Initial admin not created (${msg}); continuing application startup.`,
      );
    }
  }
}
