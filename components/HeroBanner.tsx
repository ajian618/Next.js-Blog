'use client';

import { useState, useEffect } from 'react';

export default function HeroBanner() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟图片加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const scrollToContent = () => {
    console.log('scrollToContent被调用');
    const heroSection = document.querySelector('section');
    const nextSection = document.getElementById('main-content');
    
    if (heroSection && nextSection) {
      const navbar = document.querySelector('header');
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const heroHeight = heroSection.offsetHeight;
      // 滚动到HeroBanner底部减去Navbar高度，再加上额外10px确保完全跳过
      const offsetPosition = heroHeight - navbarHeight + 12;
      
      console.log('滚动到位置:', offsetPosition, 'heroHeight:', heroHeight, 'navbarHeight:', navbarHeight);
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* 背景图片 - 全屏覆盖 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed pointer-events-none"
        style={{ backgroundImage: 'url(/assets/images/banners/home-banner.jpg)' }}
      >
        {/* 渐变遮罩 - 顶部黑色渐变 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent" />
      </div>

      {/* 预加载动画 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 pointer-events-none">
          <div className="w-12 h-12 border-4 border-[var(--theme-color-pri)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 文字和箭头容器 - 垂直居中 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pointer-events-auto">
        {/* 文字内容 */}
        <div className="animate-fade-in mb-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            让<span className="text-[var(--theme-color-sub)]">美好</span>持续发生
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-light">
            Let <span className="text-[var(--theme-color-pri)]">beauty</span> continue to happen
          </p>
        </div>

        {/* 向下滚动按钮 */}
        <button
          onClick={scrollToContent}
          className="w-14 h-14 bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-full flex items-center justify-center text-white hover:bg-white/30 hover:border-white/80 transition-all duration-300 hover:scale-110 cursor-pointer z-20 pointer-events-auto"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
