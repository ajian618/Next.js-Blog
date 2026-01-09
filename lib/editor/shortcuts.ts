// 编辑器快捷键定义
import { type Editor } from '@tiptap/react';

export const EDITOR_SHORTCUTS = [
  { key: 'mod+b', label: '粗体', action: (editor: Editor) => editor.chain().focus().toggleBold().run() },
  { key: 'mod+i', label: '斜体', action: (editor: Editor) => editor.chain().focus().toggleItalic().run() },
  { key: 'mod+u', label: '下划线', action: (editor: Editor) => editor.chain().focus().toggleUnderline().run() },
  { key: 'mod+`', label: '行内代码', action: (editor: Editor) => editor.chain().focus().toggleCode().run() },
  { key: 'mod+shift+k', label: '链接', action: (editor: Editor) => editor.chain().focus().setLink({ href: '' }).run() },
  { key: 'mod+shift+c', label: '代码块', action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run() },
  // { key: 'mod+shift+h', label: '高亮', action: (editor: Editor) => editor.chain().focus().toggleHighlight().run() },
  { key: 'mod+z', label: '撤销', action: (editor: Editor) => editor.chain().focus().undo().run() },
  { key: 'mod+shift+z', label: '重做', action: (editor: Editor) => editor.chain().focus().redo().run() },
  { key: 'mod+s', label: '保存', action: (editor: Editor) => editor.chain().focus().run() }, // 保存由外部处理
];

export const HEADING_SHORTCUTS = [
  { key: 'mod+1', level: 1 },
  { key: 'mod+2', level: 2 },
  { key: 'mod+3', level: 3 },
  { key: 'mod+4', level: 4 },
  { key: 'mod+5', level: 5 },
  { key: 'mod+6', level: 6 },
];

export const LIST_SHORTCUTS = [
  { key: 'mod+shift+7', label: '有序列表', action: (editor: Editor) => editor.chain().focus().toggleOrderedList().run() },
  { key: 'mod+shift+8', label: '无序列表', action: (editor: Editor) => editor.chain().focus().toggleBulletList().run() },
  { key: 'mod+shift+9', label: '引用', action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run() },
];

export const FORMAT_SHORTCUTS = [
  { key: 'mod+shift+x', label: '删除线', action: (editor: Editor) => editor.chain().focus().toggleStrike().run() },
];
