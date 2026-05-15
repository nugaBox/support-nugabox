import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BootstrapAdminService } from './bootstrap-admin.service';

@Module({
  imports: [PrismaModule],
  providers: [BootstrapAdminService],
})
export class BootstrapAdminModule {}
