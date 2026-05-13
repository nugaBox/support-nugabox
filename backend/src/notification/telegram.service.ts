import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CATEGORY_LABEL, STATUS_LABEL } from '../common/labels';
import { escapeTelegramHtml } from './telegram-escape';
import {
  NotificationSender,
  PostCreatedNotificationPayload,
  PostStatusChangedNotificationPayload,
} from './notification.types';

@Injectable()
export class TelegramService extends NotificationSender {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly config: ConfigService) {
    super();
  }

  private isEnabled(): boolean {
    const enabled = String(this.config.get('TELEGRAM_ENABLED')).toLowerCase() === 'true';
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN')?.trim();
    const chatId = this.config.get<string>('TELEGRAM_CHAT_ID')?.trim();
    return enabled && !!token && !!chatId;
  }

  async notifyPostCreated(payload: PostCreatedNotificationPayload): Promise<void> {
    if (!this.isEnabled()) return;
    const base = this.config.get<string>('APP_BASE_URL')?.replace(/\/$/, '') ?? '';
    const link = `${base}/support-posts/${payload.postId}`;
    const site = escapeTelegramHtml(payload.siteName);
    const cat = escapeTelegramHtml(CATEGORY_LABEL[payload.category]);
    const st = escapeTelegramHtml(STATUS_LABEL[payload.status]);
    const title = escapeTelegramHtml(payload.title);
    const author = escapeTelegramHtml(payload.authorName);
    const created = escapeTelegramHtml(payload.createdAtIso);
    const text = [
      '[NUGABOX 문의 등록]',
      `사이트: ${site}`,
      `분류: ${cat}`,
      `상태: ${st}`,
      `제목: ${title}`,
      `작성자: ${author}`,
      `등록일: ${created}`,
      `링크: ${escapeTelegramHtml(link)}`,
    ].join('\n');
    await this.safeSend(text);
  }

  async notifyPostStatusChanged(
    payload: PostStatusChangedNotificationPayload,
  ): Promise<void> {
    if (!this.isEnabled()) return;
    const base = this.config.get<string>('APP_BASE_URL')?.replace(/\/$/, '') ?? '';
    const link = `${base}/support-posts/${payload.postId}`;
    const site = escapeTelegramHtml(payload.siteName);
    const title = escapeTelegramHtml(payload.title);
    const author = escapeTelegramHtml(payload.authorName);
    const before = escapeTelegramHtml(STATUS_LABEL[payload.beforeStatus]);
    const after = escapeTelegramHtml(STATUS_LABEL[payload.afterStatus]);
    const by = escapeTelegramHtml(payload.changedByName);
    const at = escapeTelegramHtml(payload.changedAtIso);
    const text = [
      '[NUGABOX 문의 상태 변경]',
      `사이트: ${site}`,
      `제목: ${title}`,
      `작성자: ${author}`,
      `상태: ${before} → ${after}`,
      `변경자: ${by}`,
      `변경일: ${at}`,
      `링크: ${escapeTelegramHtml(link)}`,
    ].join('\n');
    await this.safeSend(text);
  }

  private async safeSend(text: string): Promise<void> {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN')?.trim();
    const chatId = this.config.get<string>('TELEGRAM_CHAT_ID')?.trim();
    if (!token || !chatId) return;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    try {
      await axios.post(url, {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`텔레그램 발송 실패(best-effort): ${msg}`);
    }
  }
}
