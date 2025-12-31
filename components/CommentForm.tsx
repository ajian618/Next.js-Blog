'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CommentFormProps {
  postId: number;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          author_name: session?.user ? session.user.name : name,
          author_email: session?.user ? session.user.email : email,
          content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as any).error || '提交失败');
      }

      if (!result.success) {
        throw new Error((result as any).error || '提交失败');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setContent('');
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 如果未登录，显示登录提示
  if (!session?.user) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-6 text-center rounded-lg">
        <p className="text-gray-600 mb-4 tracking-wide">请登录后发表评论</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-5 py-2.5 bg-[var(--accent-primary)] text-white border border-[var(--accent-primary)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)] transition-colors tracking-wide rounded"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 bg-white text-[var(--accent-primary)] border border-[var(--accent-primary)] hover:bg-blue-50 transition-colors tracking-wide rounded"
          >
            注册
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-[var(--danger-secondary)] border border-red-200 text-red-700 p-3 text-sm tracking-wide rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-sm tracking-wide rounded">
          评论提交成功！等待审核后将会显示。
        </div>
      )}

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">
          评论内容 *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-blue-500/20 transition-colors tracking-wide resize-none rounded"
          placeholder="说说你的想法..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-[var(--accent-primary)] text-white border border-[var(--accent-primary)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors tracking-wide rounded"
      >
        {loading ? '提交中...' : '提交评论'}
      </button>
    </form>
  );
}
