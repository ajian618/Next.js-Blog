import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import CommentsManager from '@/components/CommentsManager';
import pool from '@/lib/db';
import { Comment } from '@/types';
import { RowDataPacket } from 'mysql2';

interface CommentRow extends RowDataPacket {
  id: number;
  post_id: number;
  post_title: string;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  created_at: Date;
}

async function getComments(): Promise<(Comment & { post_title: string })[]> {
  try {
    const [rows] = await pool.query<CommentRow[]>(
      `SELECT c.*, p.title as post_title 
       FROM comments c 
       LEFT JOIN posts p ON c.post_id = p.id 
       ORDER BY c.created_at DESC`
    );

    return rows.map(row => ({
      id: row.id,
      post_id: row.post_id,
      post_title: row.post_title,
      author_name: row.author_name,
      author_email: row.author_email,
      content: row.content,
      approved: row.approved,
      created_at: row.created_at.toISOString(),
    }));
  } catch (error) {
    console.error('获取评论失败:', error);
    return [];
  }
}

export default async function CommentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const comments = await getComments();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">评论管理</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <CommentsManager initialComments={comments} />
      </div>
    </AdminLayout>
  );
}
