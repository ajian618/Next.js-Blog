import Link from 'next/link';
import pool from '@/lib/db';
import { Post } from '@/types';
import { RowDataPacket } from 'mysql2';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface PostWithCategory extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  created_at: Date;
}

async function getPosts(): Promise<Post[]> {
  try {
    const [rows] = await pool.query<PostWithCategory[]>(
      `SELECT p.*, c.name as category_name 
       FROM posts p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.published = TRUE 
       ORDER BY p.created_at DESC 
       LIMIT 10`
    );
    
    console.log('首页文章列表:', rows.map(r => ({ id: r.id, title: r.title, slug: r.slug })));
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      content: '',
      excerpt: row.excerpt,
      category_id: row.category_id,
      category_name: row.category_name,
      created_at: row.created_at.toISOString(),
      updated_at: '',
      published: true,
    }));
  } catch (error) {
    console.error('获取文章失败:', error);
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">我的博客</h1>
            <nav className="flex gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                首页
              </Link>
              <Link href="/admin/login" className="text-gray-600 hover:text-gray-900">
                管理后台
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无文章</p>
            </div>
          ) : (
            posts.map((post) => (
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
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            © 2024 我的博客. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
