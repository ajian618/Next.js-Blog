import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CategoryPostList } from '@/components/CategoryPostList';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;

  // 获取分类信息
  const categoryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/categories/${id}`, {
    cache: 'no-store'
  });
  
  if (!categoryResponse.ok) {
    return notFound();
  }
  
  const categoryResult = await categoryResponse.json();
  const category = categoryResult.success ? categoryResult.data : null;

  if (!category) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-wide mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-500 text-sm tracking-wide">{category.description}</p>
          )}
        </div>

        {/* 文章列表 */}
        <CategoryPostList categoryId={parseInt(id)} />
      </main>

      <Footer />
    </div>
  );
}
