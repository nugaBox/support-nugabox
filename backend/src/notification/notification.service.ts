import { Injectable } from '@nestjs/common';
import {
  NotificationSender,
  PostCreatedNotificationPayload,
  PostStatusChangedNotificationPayload,
} from './notification.types';
import { TelegramService } from './telegram.service';

/**
 * 알림 게이트웨이: 현재는 Telegram만 연결. 추후 SlackService 등 주입 확장.
 */
@Injectable()
export class NotificationService {
  constructor(private readonly telegram: TelegramService) {}

  private get senders(): NotificationSender[] {
    return [this.telegram];
  }

  async notifyPostCreated(payload: PostCreatedNotificationPayload): Promise<void> {
    await Promise.allSettled(this.senders.map((s) => s.notifyPostCreated(payload)));
  }

  async notifyPostStatusChanged(
    payload: PostStatusChangedNotificationPayload,
  ): Promise<void> {
    await Promise.allSettled(this.senders.map((s) => s.notifyPostStatusChanged(payload)));
  }
}
