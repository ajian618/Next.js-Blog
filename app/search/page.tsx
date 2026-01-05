'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    if (query) {
      fetchPosts();
    } else {
      setLoading(false);
    }
    fetchAdminUser();
  }, [query, currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const response = await fetch(
        `/api/posts?search=${encodeURIComponent(query)}&limit=${pageSize}&offset=${offset}`
      );
      const result = await response.json();
      if (result.success) {
        setPosts(result.data || []);
        setTotal(result.total || 0);
      }
    } catch (error) {
      console.error('搜索失败:', error);
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

  // 高亮搜索关键词
  const highlightText = (text: string, keyword: string) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 搜索标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">搜索结果</h1>
            <p className="text-gray-600">
              {query ? (
                <span>
                  关键词：<span className="font-semibold text-[var(--accent-primary)]">"{query}"</span>
                  {total > 0 && ` (${total} 条结果)`}
                </span>
              ) : (
                '请输入搜索关键词'
              )}
            </p>
          </div>

          {/* 加载状态 */}
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : !query ? (
            // 没有搜索词
            <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 text-lg mb-4">请输入搜索关键词</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
              >
                返回首页
              </Link>
            </div>
          ) : posts.length === 0 ? (
            // 无搜索结果
            <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg mb-4">没有找到相关文章</p>
              <p className="text-gray-400 text-sm mb-6">试试其他关键词吧</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
              >
                返回首页
              </Link>
            </div>
          ) : (
            // 搜索结果
            <>
              <div className="space-y-6">
                {posts.map((post) => (
                  <SearchResultItem
                    key={post.id}
                    post={post}
                    query={query}
                    adminUser={adminUser}
                    highlightText={highlightText}
                  />
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
                第 {currentPage} / {totalPages} 页，共 {total} 条结果
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

// 搜索结果卡片
function SearchResultItem({
  post,
  query,
  adminUser,
  highlightText
}: {
  post: Post;
  query: string;
  adminUser: any;
  highlightText: (text: string, keyword: string) => string;
}) {
  const avatarUrl = getAvatarUrl(adminUser?.avatar, 40);

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      <div className="flex gap-4">
        {/* 封面图 */}
        {post.cover_image && (
          <div className="flex-shrink-0 w-40 h-28 rounded-lg overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          {/* 分类 */}
          {post.category_name && (
            <div className="text-sm text-[var(--accent-primary)] mb-2">
              <span>📁</span> {post.category_name}
            </div>
          )}

          {/* 标题 */}
          <h3
            className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[var(--accent-primary)] transition-colors"
            dangerouslySetInnerHTML={{
              __html: highlightText(post.title, query)
            }}
          />

          {/* 摘要 */}
          {post.excerpt && (
            <p
              className="text-gray-600 text-sm line-clamp-2 mb-3"
              dangerouslySetInnerHTML={{
                __html: highlightText(post.excerpt, query)
              }}
            />
          )}

          {/* 元信息 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
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
              {format(new Date(post.created_at), 'yyyy年MM月dd日', { locale: zhCN })}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
}
