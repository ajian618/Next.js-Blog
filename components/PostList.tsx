'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useEffect, useState } from 'react';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  created_at: string;
}

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
      setError('请求超时，请刷新页面重试');
      setLoading(false);
    }, 15000); // 15秒超时

    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts', {
          signal: abortController.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setPosts(result.data);
        } else {
          setPosts([]);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // 超时错误，已在 timeoutId 中处理
          return;
        }
        console.error('获取文章失败:', error);
        setError('加载文章失败，请刷新页面重试');
        setPosts([]);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }

    fetchPosts();

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 mb-3"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">暂无文章</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            {post.category_name && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {post.category_name}
              </span>
            )}
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), 'yyyy年MM月dd日', { locale: zhCN })}
            </time>
          </div>
          <Link href={`/posts/${post.slug}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600">
              {post.title}
            </h2>
          </Link>
          {post.excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
          )}
          <Link
            href={`/posts/${post.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            阅读全文 →
          </Link>
        </article>
      ))}
    </div>
  );
}
