import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { NotificationService } from './notification.service';

@Module({
  providers: [TelegramService, NotificationService],
  exports: [NotificationService, TelegramService],
})
export class NotificationModule {}
