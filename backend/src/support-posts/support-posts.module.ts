import { Module } from '@nestjs/common';
import { SupportPostsService } from './support-posts.service';
import { SupportPostsController } from './support-posts.controller';
import { SitesModule } from '../sites/sites.module';
import { NotificationModule } from '../notification/notification.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SitesModule, NotificationModule, AuthModule],
  controllers: [SupportPostsController],
  providers: [SupportPostsService],
  exports: [SupportPostsService],
})
export class SupportPostsModule {}
