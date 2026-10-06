'use client';

import type { PartialBlock } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { useMemo } from 'react';

type BlockEditorProps = {
  value: string;
  editable?: boolean;
  onChange: (value: string) => void;
};

function parseContent(value: string): PartialBlock[] | undefined {
  if (!value.trim()) return undefined;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed as PartialBlock[];
  } catch {
    // Legacy plain-text content is migrated into a paragraph block.
  }

  return [
    {
      type: 'paragraph',
      content: value,
    },
  ];
}

export default function BlockEditor({
  value,
  editable = true,
  onChange,
}: BlockEditorProps) {
  const initialContent = useMemo(() => parseContent(value), [value]);

  const editor = useCreateBlockNote({
    initialContent,
  });

  return (
    <div className="min-h-[50vh] overflow-hidden rounded-xl border border-white/10 bg-[#070707]">
      <BlockNoteView
        editor={editor}
        theme="dark"
        editable={editable}
        onChange={() => onChange(JSON.stringify(editor.document))}
      />
    </div>
  );
}
