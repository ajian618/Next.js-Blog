import { notFound } from 'next/navigation';
import Link from 'next/link';
import pool from '@/lib/db';
import { Post, Comment } from '@/types';
import { RowDataPacket } from 'mysql2';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';

interface PostWithCategory extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  created_at: Date;
  updated_at: Date;
}

interface CommentRow extends RowDataPacket {
  id: number;
  post_id: number;
  author_name: string;
  author_email: string;
  content: string;
  created_at: Date;
  approved: boolean;
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const [rows] = await pool.query<PostWithCategory[]>(
      `SELECT p.*, c.name as category_name 
       FROM posts p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.slug = ? AND p.published = TRUE`,
      [slug]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      content: row.content,
      excerpt: row.excerpt,
      category_id: row.category_id,
      category_name: row.category_name,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      published: true,
    };
  } catch (error) {
    console.error('获取文章失败:', error);
    return null;
  }
}

async function getComments(postId: number): Promise<Comment[]> {
  try {
    const [rows] = await pool.query<CommentRow[]>(
      'SELECT * FROM comments WHERE post_id = ? AND approved = TRUE ORDER BY created_at DESC',
      [postId]
    );

    return rows.map(row => ({
      id: row.id,
      post_id: row.post_id,
      author_name: row.author_name,
      author_email: row.author_email,
      content: row.content,
      created_at: row.created_at.toISOString(),
      approved: row.approved,
    }));
  } catch (error) {
    console.error('获取评论失败:', error);
    return [];
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const comments = await getComments(post.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 返回首页
          </Link>
        </div>
      </header>

      {/* Article */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <header className="mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
              {post.category_name && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {post.category_name}
                </span>
              )}
              <time dateTime={post.created_at}>
                {format(new Date(post.created_at), 'yyyy年MM月dd日', { locale: zhCN })}
              </time>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          </header>

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            评论 ({comments.length})
          </h2>
          
          <CommentForm postId={post.id} />
          
          <div className="mt-8">
            <CommentList comments={comments} />
          </div>
        </div>
      </main>
    </div>
  );
}
