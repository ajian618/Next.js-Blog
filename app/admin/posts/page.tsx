import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import PostsTable from '@/components/PostsTable';
import pool from '@/lib/db';
import { Post } from '@/types';
import { RowDataPacket } from 'mysql2';
import Link from 'next/link';

interface PostRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

async function getPosts(): Promise<Post[]> {
  try {
    const [rows] = await pool.query<PostRow[]>(
      `SELECT p.*, c.name as category_name 
       FROM posts p 
       LEFT JOIN categories c ON p.category_id = c.id 
       ORDER BY p.created_at DESC`
    );

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      content: '',
      excerpt: row.excerpt,
      category_id: row.category_id,
      category_name: row.category_name,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      published: row.published,
    }));
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return [];
  }
}

export default async function PostsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const posts = await getPosts();

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">文章管理</h1>
        <Link
          href="/admin/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + 新建文章
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <PostsTable posts={posts} />
      </div>
    </AdminLayout>
  );
}
