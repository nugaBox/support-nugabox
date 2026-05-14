'use client';

import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
};

export function RichTextEditor({ value, onChange, disabled }: Props) {
  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: 'list-disc pl-6' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal pl-6' } },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-ink underline underline-offset-2 decoration-line',
        },
      }),
      Placeholder.configure({
        placeholder: '본문을 입력하세요. 리스트, 코드블록, 링크를 사용할 수 있습니다.',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[220px] rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-ink/5 prose-support',
      },
    },
  });

  useEffect(() => {
    if (!editor || disabled === undefined) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 border-b border-line pb-2">
        <ToolbarBtn
          label="굵게"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarBtn
          label="기울임"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarBtn
          label="목록"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarBtn
          label="번호"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarBtn
          label="코드"
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarBtn
          label="링크"
          active={editor.isActive('link')}
          onClick={() => {
            const prev = window.prompt('링크 URL');
            if (!prev) return;
            editor.chain().focus().extendMarkRange('link').setLink({ href: prev }).run();
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
        active
          ? 'border-line-strong bg-ink text-white dark:bg-zinc-100 dark:text-zinc-900'
          : 'border-line bg-elevated text-ink-secondary hover:bg-accent-soft hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
