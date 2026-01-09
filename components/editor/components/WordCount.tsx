'use client';

import { Editor } from '@tiptap/react';
import { useMemo } from 'react';

interface WordCountProps {
  editor: Editor;
}

export default function WordCount({ editor }: WordCountProps) {
  const { characters, words, readingTime } = useMemo(() => {
    const text = editor.getText();
    const characters = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    // 假设阅读速度 300 字/分钟
    const readingTime = Math.ceil(characters / 300);
    
    return { characters, words, readingTime };
  }, [editor]);

  return (
    <div className="flex items-center gap-4 text-sm text-gray-500">
      <span>字数: {characters}</span>
      <span>词数: {words}</span>
      <span>阅读: ~{readingTime} 分钟</span>
    </div>
  );
}
