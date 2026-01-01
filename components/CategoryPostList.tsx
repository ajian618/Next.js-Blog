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

interface CategoryPostListProps {
  categoryId: number;
}

const POSTS_PER_PAGE = 10;

export function CategoryPostList({ categoryId }: CategoryPostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
      setError('请求超时，请刷新页面重试');
      setLoading(false);
    }, 15000);

    async function fetchPosts() {
      try {
        const offset = (currentPage - 1) * POSTS_PER_PAGE;
        const response = await fetch(`/api/posts?categoryId=${categoryId}&limit=${POSTS_PER_PAGE}&offset=${offset}`, {
          signal: abortController.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setPosts(result.data);
          setTotalPosts(result.total || result.data.length);
        } else {
          setPosts([]);
          setTotalPosts(0);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
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
  }, [categoryId, currentPage]);

  // 当页码变化时，滚动到页面顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-100 w-24 rounded mb-4"></div>
            <div className="h-6 bg-gray-100 w-3/4 rounded mb-3"></div>
            <div className="h-4 bg-gray-100 w-full rounded mb-2"></div>
            <div className="h-4 bg-gray-100 w-5/6 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm p-6 max-w-md mx-auto">
          <p className="text-red-600 mb-4 tracking-wide">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors tracking-wide border border-red-600 rounded"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm p-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-gray-600 text-lg tracking-wide">该分类暂无文章</p>
          <p className="text-gray-500 text-sm mt-2 tracking-wide">敬请期待精彩内容</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm p-6 hover:border-[var(--accent-primary)] transition-all duration-200 group"
          >
            {/* 分类标签和日期 */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-5 uppercase tracking-wider">
              {post.category_name && (
                <span className="bg-[var(--accent-secondary)] text-[var(--accent-primary)] px-3 py-1.5 font-medium border border-blue-200">
                  {post.category_name}
                </span>
              )}
              <time dateTime={post.created_at} className="font-medium">
                {format(new Date(post.created_at), 'yyyy.MM.dd', { locale: zhCN })}
              </time>
            </div>

            {/* 文章标题 */}
            <Link href={`/posts/${post.slug}`}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-[var(--accent-primary)] transition-colors tracking-wide leading-snug">
                {post.title}
              </h2>
            </Link>

            {/* 文章摘要 */}
            {post.excerpt && (
              <p className="text-gray-600 mb-5 line-clamp-3 leading-relaxed tracking-wide">
                {post.excerpt}
              </p>
            )}

            {/* 阅读更多链接 */}
            <Link
              href={`/posts/${post.slug}`}
              className="inline-flex items-center gap-2 text-[var(--accent-primary)] hover:text-[var(--accent-hover)] font-medium text-sm tracking-wide border-b border-transparent hover:border-[var(--accent-primary)] transition-all group"
            >
              阅读全文
              <svg 
                className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </article>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm border border-gray-200 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded bg-white/60 backdrop-blur-md"
          >
            上一页
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 text-sm border transition-colors rounded backdrop-blur-md ${
                  currentPage === page
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-blue-50/80'
                    : 'border-gray-200 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] bg-white/60'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm border border-gray-200 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded bg-white/60 backdrop-blur-md"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
