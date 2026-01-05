'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  created_at: string;
  cover_image?: string;
}

interface PostGridProps {
  title?: string;
  limit?: number;
  showAll?: boolean;
}

export default function PostGrid({ title = 'Latest Posts', limit = 8, showAll = false }: PostGridProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchPosts();
  }, [limit]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?limit=${limit}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 根据索引分配卡片大小
  const getCardSize = (index: number): 'full' | 'half' | 'quarter' => {
    if (index === 0) return 'full';
    if (index <= 2) return 'half';
    return 'quarter';
  };

  return (
    <section className="w-full py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* 标题 */}
        <div className={`mb-8 reveal ${isVisible ? 'active' : ''}`}>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 bg-clip-text text-transparent">{title}</h2>
        </div>

        {/* 加载状态 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-video rounded-t-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-500">暂无文章</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 reveal ${isVisible ? 'active' : ''}`}>
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} size={getCardSize(index)} delay={index * 100} />
            ))}
          </div>
        )}

        {/* 查看更多按钮 */}
        {showAll && posts.length >= limit && (
          <div className="text-center mt-8">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--theme-color-pri)] to-[var(--theme-color-sub)] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              查看更多文章
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// 文章卡片组件
function PostCard({ post, size, delay }: { post: Post; size: 'full' | 'half' | 'quarter'; delay: number }) {
  const sizeClasses = {
    full: 'md:col-span-2 lg:col-span-4',
    half: 'md:col-span-2 lg:col-span-2',
    quarter: 'md:col-span-1 lg:col-span-1',
  };

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`card group ${sizeClasses[size]}`}
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
        animation: 'fadeIn 0.5s ease-out forwards',
      }}
    >
      <div className="card-image" style={{ aspectRatio: '3/2' }}>
        <img
          src={post.cover_image || '/assets/images/banners/home-banner.jpg'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="card-content">
        {/* 分类标签 */}
        {post.category_name && (
          <span className="card-tag">
            {post.category_name}
          </span>
        )}

        {/* 标题 */}
        <h3 className="card-title group-hover:text-[var(--theme-color-pri)] transition-colors">
          {post.title}
        </h3>

        {/* 日期 */}
        <div className="card-meta">
          <time dateTime={post.created_at}>
            {format(new Date(post.created_at), 'yyyy年MM月dd日', { locale: zhCN })}
          </time>
        </div>
      </div>
    </Link>
  );
}
