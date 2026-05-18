import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SitesModule } from './sites/sites.module';
import { SupportPostsModule } from './support-posts/support-posts.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationModule } from './notification/notification.module';
import { BootstrapAdminModule } from './bootstrap-admin/bootstrap-admin.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    BootstrapAdminModule,
    AuthModule,
    UsersModule,
    SitesModule,
    SupportPostsModule,
    AttachmentsModule,
    CommentsModule,
    NotificationModule,
  ],
})
export class AppModule {}
