import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Youtube from '@tiptap/extension-youtube';
import { Markdown } from 'tiptap-markdown';
import BubbleMenu from '@tiptap/extension-bubble-menu';

import { common, createLowlight } from 'lowlight';

// 代码高亮语言配置
const lowlight = createLowlight(common);

export const defaultExtensions = [
  // StarterKit 已包含: Document, Paragraph, Text, Bold, Italic, Strike, Blockquote, 
  // BulletList, OrderedList, HorizontalRule, Code, ListItem, History
  StarterKit.configure({
    // 禁用默认的 codeBlock，使用带高亮的版本
    codeBlock: false,
    // 配置 Heading 支持 H1-H6
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
  }),

  // 基础功能扩展
  Underline,
  Highlight.configure({
    multicolor: true,
  }),
  Typography,
  Placeholder.configure({
    placeholder: '开始写作...（支持 Markdown 粘贴）',
  }),

  // 代码块 - 带语法高亮
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: {
      class: 'code-block',
    },
  }),

  // 图片
  Image.configure({
    inline: true,
    allowBase64: false,
    HTMLAttributes: {
      class: 'editor-image',
    },
  }),

  // 表格
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'editor-table',
    },
  }),
  TableRow,
  TableHeader,
  TableCell,

  // 链接
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'editor-link',
    },
  }),

  // Markdown 支持
  Markdown.configure({
    html: true,
    transformPastedText: true,
    transformCopiedText: true,
  }),

  // YouTube 嵌入
  Youtube.configure({
    controls: true,
    nocookie: true,
    HTMLAttributes: {
      class: 'editor-youtube',
    },
  }),
];

// 扩展名称列表（用于配置）
export const EXTENSION_NAMES = {
  starterKit: 'starterKit',
  heading: 'heading',
  image: 'image',
  codeBlockLowlight: 'codeBlockLowlight',
  table: 'table',
  tableRow: 'tableRow',
  tableHeader: 'tableHeader',
  tableCell: 'tableCell',
  link: 'link',
  underline: 'underline',
  highlight: 'highlight',
  placeholder: 'placeholder',
  typography: 'typography',
  youtube: 'youtube',
  markdown: 'markdown',
} as const;
