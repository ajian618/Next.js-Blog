'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { useEffect, useState, useCallback } from 'react';

import { defaultExtensions } from './extensions/tiptap';
import Toolbar from './toolbar/Toolbar';
import WordCount from './components/WordCount';

interface EditorProps {
  content?: string;
  onChange?: (content: { html: string; json: string }) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function TiptapEditor({
  content = '',
  onChange,
  placeholder = '开始写作...（支持 Markdown 粘贴）',
  editable = true,
}: EditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const insertTable = useCallback(() => {
    // 插入 3x3 表格
  }, []);

  const editor = useEditor({
    extensions: defaultExtensions,
    content: content || '',
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px] p-6 bg-white',
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.({
        html: editor.getHTML(),
        json: JSON.stringify(editor.getJSON()),
      });
    },
  });

  // 同步外部内容变化到编辑器
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== content) {
        editor.commands.setContent(content || '', { emitUpdate: false });
      }
    }
  }, [content, editor]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editor) return;
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6 min-h-[500px] bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg bg-white">
      <Toolbar editor={editor} onInsertTable={insertTable} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50">
        <WordCount editor={editor} />
        <div className="text-xs text-gray-400">
          支持 Markdown 快捷键 | Ctrl+S 保存
        </div>
      </div>
    </div>
  );
}

