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
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchPosts();
    fetchAdminUser();
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

  const fetchAdminUser = async () => {
    try {
      const response = await fetch('/api/admin/profile');
      const result = await response.json();
      if (result.success && result.data) {
        setAdminUser(result.data);
      }
    } catch (error) {
      console.error('获取管理员信息失败:', error);
    }
  };

  const isNewestLayout = title === 'Newest';

  // 加载状态
  if (loading) {
    return (
      <section className="w-full py-12">
        <div className="max-w-6xl mx-auto px-4">
          {isNewestLayout ? (
            <div className="space-y-4">
              <div className="h-[360px] bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-[440px] bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="h-[440px] bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-video rounded-t-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* 标题 */}
        <div className={`mb-8 reveal ${isVisible ? 'active' : ''}`}>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 bg-clip-text text-transparent">{title}</h2>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-500">暂无文章</p>
          </div>
        ) : isNewestLayout ? (
          // Newest 布局：一大两中
          <div className={`reveal ${isVisible ? 'active' : ''}`}>
            <NewestLayout posts={posts.slice(0, 3)} adminUser={adminUser} />
          </div>
        ) : (
          // 标准网格布局
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 reveal ${isVisible ? 'active' : ''}`}>
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} size="quarter" delay={index * 100} />
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

// Newest 布局：一大两中
function NewestLayout({ posts, adminUser }: { posts: Post[]; adminUser: any }) {
  const [featuredPost, ...mediumPosts] = posts;

  return (
    <div className="max-w-[1000px] mx-auto space-y-4">
      {/* 大卡片 */}
      {featuredPost && <LargePostCard post={featuredPost} adminUser={adminUser} />}

      {/* 两个中卡片 */}
      <div className="grid grid-cols-2 gap-4">
        {mediumPosts.map((post) => (
          <MediumPostCard key={post.id} post={post} adminUser={adminUser} />
        ))}
      </div>
    </div>
  );
}

// 大卡片：1000*360，左封面右内容
function LargePostCard({ post, adminUser }: { post: Post; adminUser: any }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="card group block"
      style={{
        opacity: 0,
        animation: 'fadeIn 0.5s ease-out forwards',
      }}
    >
      <div className="flex h-[360px] overflow-hidden rounded-lg">
        {/* 左侧封面 */}
        <div className="w-[640px] flex-shrink-0">
          <img
            src={post.cover_image || '/assets/images/banners/home-banner.jpg'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* 右侧内容 */}
        <div className="flex-1 p-8 flex flex-col bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex-1">
            {/* 分类 */}
            {post.category_name && (
              <div className="flex items-center gap-2 text-base text-gray-600 mb-4">
                <span>📁</span>
                <span className="font-medium">{post.category_name}</span>
              </div>
            )}

            {/* 标题 */}
            <h3 className="text-2xl font-semibold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
              {post.title}
            </h3>

            {/* 管理员 */}
            <div className="text-base text-gray-600">
              {adminUser?.name ?? '管理员'}
            </div>
          </div>

          {/* 日期 */}
          <div className="flex items-center text-base text-gray-500">
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), 'yyyy.MM.dd', { locale: zhCN })}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
}

// 中卡片：480*440，上封面下内容
function MediumPostCard({ post, adminUser }: { post: Post; adminUser: any }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="card group block"
      style={{
        opacity: 0,
        animation: 'fadeIn 0.5s ease-out forwards 0.2s',
      }}
    >
      <div className="w-[480px] h-[440px] overflow-hidden rounded-lg bg-gradient-to-br from-white to-blue-50/30">
        {/* 上半部分封面 */}
        <div className="h-[220px] overflow-hidden">
          <img
            src={post.cover_image || '/assets/images/banners/home-banner.jpg'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* 下半部分内容 */}
        <div className="h-[220px] p-6 flex flex-col">
          <div className="flex-1">
            {/* 分类 */}
            {post.category_name && (
              <div className="text-lg text-gray-600 mb-3">
                <span>📁</span> {post.category_name}
              </div>
            )}

            {/* 标题 */}
            <h3 className="text-xl font-medium text-gray-900 line-clamp-3 leading-relaxed group-hover:text-blue-600 transition-colors mb-4">
              {post.title}
            </h3>

            {/* 管理员 */}
            <div className="text-lg text-gray-600">
              {adminUser?.name ?? '管理员'}
            </div>
          </div>

          {/* 日期 */}
          <div className="flex items-center text-lg text-gray-500">
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), 'MM.dd', { locale: zhCN })}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
}

// 标准卡片组件
function PostCard({ post, size, delay }: { post: Post; size: 'full' | 'half' | 'quarter'; delay: number }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`card group`}
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
