'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post, Category } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PostEditorProps {
  post?: Post;
  categories: Category[];
}

export default function PostEditor({ post, categories }: PostEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [categoryId, setCategoryId] = useState(post?.category_id || '');
  const [published, setPublished] = useState(post?.published || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'split'>('split');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = post ? `/api/posts/${post.id}` : '/api/posts';
      const method = post ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          category_id: categoryId || null,
          published,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '保存失败');
      }

      router.push('/admin/posts');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    // 生成时间戳 + 随机数作为 slug，确保唯一性和 URL 安全
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const slug = `post-${timestamp}-${random}`;
    setSlug(slug);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标题 *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="文章标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL 别名 *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="url-slug"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              自动生成
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            摘要
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="文章摘要（选填）"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分类
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">无分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              内容 * (支持 Markdown)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode('edit')}
                className={`px-3 py-1 text-sm rounded ${
                  previewMode === 'edit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                编辑
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('split')}
                className={`px-3 py-1 text-sm rounded ${
                  previewMode === 'split'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                分屏
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('preview')}
                className={`px-3 py-1 text-sm rounded ${
                  previewMode === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                预览
              </button>
            </div>
          </div>
          
          <div className={`grid gap-4 ${
            previewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'
          }`}>
            {(previewMode === 'edit' || previewMode === 'split') && (
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="# 文章标题\n\n开始编写你的文章...\n\n## 二级标题\n\n- 列表项 1\n- 列表项 2\n\n**粗体** *斜体*\n\n```javascript\nconst hello = 'world';\n```"
                />
              </div>
            )}
            
            {(previewMode === 'preview' || previewMode === 'split') && (
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 overflow-auto" style={{ maxHeight: '500px' }}>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || '*暂无内容*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            <details>
              <summary className="cursor-pointer hover:text-gray-700">Markdown 语法帮助</summary>
              <div className="mt-2 p-3 bg-gray-50 rounded">
                <code className="text-xs">
                  # 一级标题<br/>
                  ## 二级标题<br/>
                  **粗体** *斜体*<br/>
                  [链接](https://example.com)<br/>
                  ![图片](url)<br/>
                  - 列表<br/>
                  1. 有序列表<br/>
                  `代码`<br/>
                  ```语言<br/>
                  代码块<br/>
                  ```
                </code>
              </div>
            </details>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">
            发布文章
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            取消
          </button>
        </div>
      </div>
    </form>
  );
}
