import Navbar from '../components/Navbar';
import { PostList } from '../components/PostList';
import AuthorCard from '../components/AuthorCard';
import CategoryCard from '../components/CategoryCard';
import Footer from '../components/Footer';
import VideoBackground from '../components/VideoBackground';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 视频背景 */}
      <VideoBackground />

      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* 左侧：文章列表区域 */}
          <div className="min-w-0">
            <div className="bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm p-6 mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-wide mb-2">最新文章</h1>
              <p className="text-gray-500 text-sm tracking-wide">探索技术、分享见解</p>
            </div>
            <PostList />
          </div>

          {/* 右侧：侧边栏 */}
          <aside className="space-y-6">
            <AuthorCard />
            <CategoryCard />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
