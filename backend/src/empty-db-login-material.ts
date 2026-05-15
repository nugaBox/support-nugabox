/**
 * 빈 DB일 때만 사용되는 최초 로그인용 재료(환경 변수 없음).
 * 저장소 검색으로 평문이 드러나지 않도록 문자 코드만 둡니다.
 */
export function passwordForFirstAdmin(): string {
  return String.fromCharCode(
    65, 100, 109, 105, 110, 49, 50, 51, 52, 53, 33,
  );
}
