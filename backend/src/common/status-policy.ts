import { PostStatus } from '@prisma/client';

/**
 * ADMIN 상태 변경 정책:
 * - 운영 편의와 예외 상황(오분류 복구 등)을 위해 **모든 상태 → 모든 상태** 전환을 허용합니다.
 * - UI에서는 일반적인 흐름(대기→진행중→완료 등)을 안내하고, StatusHistory로 모든 변경을 추적합니다.
 * - MEMBER는 상태 변경 API 자체가 금지되어 있습니다.
 */
export function assertAdminStatusChangeAllowed(): void {
  void PostStatus;
}
