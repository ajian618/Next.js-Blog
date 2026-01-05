'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAvatarUrl } from '@/lib/image-utils';

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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(6);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    fetchPosts();
    fetchAdminUser();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const response = await fetch(
        `/api/posts?limit=${pageSize}&offset=${offset}`
      );
      const result = await response.json();
      if (result.success) {
        setPosts(result.data || []);
        setTotal(result.total || 0);
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

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      <Navbar />

      <div className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">文章列表</h1>
            <p className="text-gray-600">共 {total} 篇文章</p>
          </div>

          {/* 加载状态 */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            // 无文章
            <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-gray-500 text-lg mb-4">暂无文章</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
              >
                返回首页
              </Link>
            </div>
          ) : (
            // 文章列表
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} adminUser={adminUser} />
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    上一页
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[var(--accent-primary)] text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    下一页
                  </button>
                </div>
              )}

              <div className="text-center mt-4 text-sm text-gray-500">
                第 {currentPage} / {totalPages} 页，共 {total} 篇文章
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

// 文章卡片
function PostCard({ post, adminUser }: { post: Post; adminUser: any }) {
  const avatarUrl = getAvatarUrl(adminUser?.avatar, 40);

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      {/* 封面图 */}
      <div className="aspect-video overflow-hidden">
        <img
          src={post.cover_image || '/assets/images/banners/home-banner.jpg'}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* 内容 */}
      <div className="p-6">
        {/* 分类 */}
        {post.category_name && (
          <div className="text-sm text-[var(--accent-primary)] mb-2 font-medium">
            <span>📁</span> {post.category_name}
          </div>
        )}

        {/* 标题 */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-[var(--accent-primary)] transition-colors">
          {post.title}
        </h3>

        {/* 摘要 */}
        {post.excerpt && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {post.excerpt}
          </p>
        )}

        {/* 元信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="作者" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            <span>{adminUser?.name || '管理员'}</span>
          </div>
          <time dateTime={post.created_at}>
            {format(new Date(post.created_at), 'yyyy.MM.dd', { locale: zhCN })}
          </time>
        </div>
      </div>
    </Link>
  );
}
