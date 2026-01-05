import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import FeatureTabs from '../components/FeatureTabs';
import PostGrid from '../components/PostGrid';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />

      {/* 横幅区域 - 全屏显示 */}
      <HeroBanner />

      {/* 主要内容区域 */}
      <div id="main-content" className="relative">
        {/* Feature 标签页区域 */}
        <FeatureTabs />

        {/* 最新文章 */}
        <PostGrid title="Newest" limit={9} showAll={true} />
      </div>

      <Footer />
    </div>
  );
}
