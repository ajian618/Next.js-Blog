import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import PostEditor from '@/components/PostEditor';
import pool from '@/lib/db';
import { Post, Category } from '@/types';
import { RowDataPacket } from 'mysql2';

interface PostRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: number;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CategoryRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: Date;
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const [rows] = await pool.query<PostRow[]>(
      'SELECT * FROM posts WHERE id = ?',
      [id]
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
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      published: row.published,
    };
  } catch (error) {
    console.error('获取文章失败:', error);
    return null;
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const [rows] = await pool.query<CategoryRow[]>(
      'SELECT * FROM categories ORDER BY name ASC'
    );

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      created_at: row.created_at.toISOString(),
    }));
  } catch (error) {
    console.error('获取分类失败:', error);
    return [];
  }
}

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const [post, categories] = await Promise.all([
    getPost(params.id),
    getCategories(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">编辑文章</h1>
      </div>

      <PostEditor post={post} categories={categories} />
    </AdminLayout>
  );
}
