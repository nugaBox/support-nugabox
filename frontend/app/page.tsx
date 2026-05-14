import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-lg space-y-10">
      <div className="ui-card space-y-5 p-8 md:p-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-tertiary">
          Customer support
        </p>
        <h1 className="text-[1.75rem] font-semibold leading-snug tracking-tight text-ink md:text-4xl">
          고객지원 게시판
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-secondary">
          로그인 후 문의를 등록하고 진행 상태를 확인할 수 있습니다. 모든 문의는 비밀글이며, 일반
          회원은 본인이 작성한 글만 볼 수 있습니다.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <Link href="/login" className="ui-btn-primary flex-1 text-center">
          로그인
        </Link>
        <Link href="/login?next=%2Fsupport-posts%2Fnew" className="ui-btn-secondary flex-1 text-center">
          문의 등록
        </Link>
      </div>

      <p className="px-1 text-center text-xs text-ink-tertiary">
        문의 등록은 로그인이 필요하면 로그인 화면으로 이동한 뒤, 원래 페이지로 돌아옵니다.
      </p>
    </div>
  );
}
