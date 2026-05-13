import { Module } from '@nestjs/common';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { MeController } from './me.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SitesController, MeController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
