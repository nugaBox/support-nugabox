'use client';

import { useEffect } from 'react';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-ink/20 backdrop-blur-[1px] dark:bg-black/40"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-elevated shadow-float"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-ink">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="ui-btn-ghost shrink-0 px-3 py-1.5 text-xs">
            닫기
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
