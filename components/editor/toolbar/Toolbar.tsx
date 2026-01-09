'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough, Code, 
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  List, ListOrdered, Quote, Minus,
  Link, Image, Table, Code2,
  Undo, Redo, Trash2
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { CODE_LANGUAGES } from '@/lib/editor/languages';

interface ToolbarProps {
  editor: Editor;
  onInsertImage?: () => void;
  onInsertTable?: () => void;
  onInsertCodeBlock?: () => void;
}

export default function Toolbar({ 
  editor, 
  onInsertImage, 
  onInsertTable,
  onInsertCodeBlock 
}: ToolbarProps) {
  const [showCodeLangMenu, setShowCodeLangMenu] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  // 通用按钮样式
  const btnClass = (isActive: boolean) => 
    `p-2 rounded hover:bg-gray-200 transition-colors ${
      isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
    }`;

  // 设置链接
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('输入链接地址:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // 插入代码块并设置语言
  const insertCodeBlock = useCallback((language: string = 'typescript') => {
    editor.chain().focus().setCodeBlock({ language }).run();
    setShowCodeLangMenu(false);
  }, [editor]);

  // 设置标题
  const setHeading = useCallback((level: number) => {
    editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    setShowHeadingMenu(false);
  }, [editor]);

  // 图片上传
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '上传失败');
      }

      const data = await response.json();
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (error: any) {
      console.error('图片上传失败:', error);
      alert(error.message || '图片上传失败');
    }
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
      {/* 标题下拉菜单 */}
      <div className="relative">
        <button
          onClick={() => setShowHeadingMenu(!showHeadingMenu)}
          className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('heading') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="标题"
          type="button"
        >
          <Heading2 className="w-4 h-4" />
          <span className="text-xs">标题</span>
        </button>
        
        {showHeadingMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[120px]">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() => setHeading(level)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                  editor.isActive('heading', { level }) ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                H{level} 标题
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 文本样式 */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        title="粗体 (Ctrl+B)"
        type="button"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        title="斜体 (Ctrl+I)"
        type="button"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive('underline'))}
        title="下划线 (Ctrl+U)"
        type="button"
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive('strike'))}
        title="删除线"
        type="button"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btnClass(editor.isActive('code'))}
        title="行内代码 (Ctrl+`)"
        type="button"
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={btnClass(editor.isActive('highlight'))}
        title="高亮"
        type="button"
      >
        <span className="w-4 h-4 bg-yellow-300 rounded text-xs flex items-center justify-center text-yellow-800 font-bold">H</span>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 列表与引用 */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        title="无序列表"
        type="button"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        title="有序列表"
        type="button"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
        title="引用"
        type="button"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 rounded hover:bg-gray-200 text-gray-700 transition-colors"
        title="分割线"
        type="button"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* 代码块 */}
      <div className="relative">
        <button
          onClick={() => setShowCodeLangMenu(!showCodeLangMenu)}
          className={btnClass(editor.isActive('codeBlock'))}
          title="代码块"
          type="button"
        >
          <Code2 className="w-4 h-4" />
        </button>
        
        {showCodeLangMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-[200px] overflow-y-auto min-w-[150px]">
            <button
              onClick={() => insertCodeBlock()}
              className="w-full px-3 py-2 text-left hover:bg-gray-100"
            >
              普通代码块
            </button>
            <div className="border-t border-gray-100" />
            {CODE_LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => insertCodeBlock(lang.value)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100"
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 链接 */}
      <button
        onClick={setLink}
        className={btnClass(editor.isActive('link'))}
        title="链接"
        type="button"
      >
        <Link className="w-4 h-4" />
      </button>

      {/* 图片 */}
      <label className="p-2 rounded hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer">
        <Image className="w-4 h-4" />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>

      {/* 表格 */}
      <button
        onClick={onInsertTable}
        className={btnClass(editor.isActive('table'))}
        title="插入表格"
        type="button"
      >
        <Table className="w-4 h-4" />
      </button>

      <div className="flex-1" />

      {/* 历史操作 */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
        title="撤销 (Ctrl+Z)"
        type="button"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
        title="重做 (Ctrl+Shift+Z)"
        type="button"
      >
        <Redo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="p-2 rounded hover:bg-red-100 text-red-600 transition-colors"
        title="清除格式"
        type="button"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
