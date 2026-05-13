import { PostCategory, PostStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TelegramService } from './telegram.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TelegramService', () => {
  it('TELEGRAM_ENABLED=false이면 HTTP를 호출하지 않는다', async () => {
    const config = {
      get: (k: string) => {
        if (k === 'TELEGRAM_ENABLED') return 'false';
        return '';
      },
    } as unknown as ConfigService;
    const svc = new TelegramService(config);
    await svc.notifyPostCreated({
      postId: '1',
      siteName: 'S',
      category: PostCategory.URGENT,
      status: PostStatus.WAITING,
      title: 'T',
      authorName: 'U',
      createdAtIso: new Date().toISOString(),
    });
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('텔레그램 API 실패 시에도 예외를 던지지 않는다', async () => {
    const config = {
      get: (k: string) => {
        const map: Record<string, string> = {
          TELEGRAM_ENABLED: 'true',
          TELEGRAM_BOT_TOKEN: 'token',
          TELEGRAM_CHAT_ID: '1',
          APP_BASE_URL: 'http://localhost:3000',
        };
        return map[k] ?? '';
      },
    } as unknown as ConfigService;
    mockedAxios.post.mockRejectedValueOnce(new Error('network'));
    const svc = new TelegramService(config);
    await expect(
      svc.notifyPostStatusChanged({
        postId: 'p',
        siteName: 'S',
        title: 'T',
        authorName: 'A',
        beforeStatus: PostStatus.WAITING,
        afterStatus: PostStatus.DONE,
        changedByName: 'Admin',
        changedAtIso: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();
  });
});
