import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import CategoriesManager from '@/components/CategoriesManager';
import pool from '@/lib/db';
import { Category } from '@/types';
import { RowDataPacket } from 'mysql2';

interface CategoryRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: Date;
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

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const categories = await getCategories();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">分类管理</h1>
      </div>

      <CategoriesManager initialCategories={categories} />
    </AdminLayout>
  );
}
