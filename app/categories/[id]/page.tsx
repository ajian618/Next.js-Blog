import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CategoryPostList } from '@/components/CategoryPostList';
import { notFound } from 'next/navigation';
import { CategoryRepository } from '@/lib/repositories/category-repository';
import AuthorCard from '@/components/AuthorCard';
import VideoBackground from '@/components/VideoBackground';

const categoryRepository = new CategoryRepository();

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;
  const categoryId = parseInt(id);

  // 直接使用 Repository 获取分类信息
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    return notFound();
  }

  return (
    <div className="min-h-screen">
      <VideoBackground />
      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 页面标题 */}
        <div className="bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-wide mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-500 text-sm tracking-wide">{category.description}</p>
          )}
        </div>

        {/* 使用两栏布局：左侧文章列表，右侧博主介绍 */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* 左侧：文章列表 */}
          <div className="min-w-0">
            <CategoryPostList categoryId={categoryId} />
          </div>

          {/* 右侧：博主介绍 */}
          <aside>
            <AuthorCard />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
