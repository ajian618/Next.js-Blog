import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import CategoryEditor from '@/components/CategoryEditor';
import { CategoryRepository } from '@/lib/repositories/category-repository';

const categoryRepository = new CategoryRepository();

async function getCategory(id: string) {
  try {
    return await categoryRepository.findById(parseInt(id));
  } catch (error) {
    console.error('获取分类失败:', error);
    return null;
  }
}

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const category = await getCategory(params.id);

  if (!category) {
    notFound();
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">编辑分类</h1>
      </div>

      <CategoryEditor category={category} />
    </AdminLayout>
  );
}
