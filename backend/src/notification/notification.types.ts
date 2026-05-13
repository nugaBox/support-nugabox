import { PostCategory, PostStatus } from '@prisma/client';

export interface PostCreatedNotificationPayload {
  postId: string;
  siteName: string;
  category: PostCategory;
  status: PostStatus;
  title: string;
  authorName: string;
  createdAtIso: string;
}

export interface PostStatusChangedNotificationPayload {
  postId: string;
  siteName: string;
  title: string;
  authorName: string;
  beforeStatus: PostStatus;
  afterStatus: PostStatus;
  changedByName: string;
  changedAtIso: string;
}

/** 향후 Slack, 이메일 등 추가 시 구현체 확장 */
export abstract class NotificationSender {
  abstract notifyPostCreated(payload: PostCreatedNotificationPayload): Promise<void>;
  abstract notifyPostStatusChanged(
    payload: PostStatusChangedNotificationPayload,
  ): Promise<void>;
}
