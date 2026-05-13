import { PostCategory, PostStatus, Role } from '@prisma/client';

/** 텔레그램/표시용 한글 라벨 */
export const CATEGORY_LABEL: Record<PostCategory, string> = {
  URGENT: '긴급',
  FEATURE_ADD: '기능추가',
  FEATURE_INQUIRY: '기능문의',
  FEATURE_UPDATE: '기능수정',
};

export const STATUS_LABEL: Record<PostStatus, string> = {
  WAITING: '대기',
  IN_PROGRESS: '진행중',
  REJECTED: '반려',
  DONE: '완료',
  STOPPED: '중단',
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: '관리자',
  MEMBER: '회원',
};
