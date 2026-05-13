import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-xl space-y-10 py-8">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">NUGABOX</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">고객지원 게시판</h1>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          로그인 후 문의를 등록하고 진행상태를 확인할 수 있습니다. 모든 문의는 비밀글로 처리되며,
          일반 회원은 본인이 작성한 글만 조회할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md border border-neutral-900 px-5 py-2.5 text-sm dark:border-white"
        >
          로그인
        </Link>
        <Link
          href="/login?next=%2Fsupport-posts%2Fnew"
          className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-5 py-2.5 text-sm dark:border-neutral-600"
        >
          문의 등록
        </Link>
      </div>

      <p className="text-xs text-neutral-500">
        문의 등록을 선택하면 로그인이 필요한 경우 로그인 화면으로 이동합니다.
      </p>
    </div>
  );
}
