'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroBackground, StaggerText } from '@/components/animations';

export default function HeroBanner() {
  const [showContent, setShowContent] = useState(false);

  // 页面加载时滚动回顶部
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // SmartLoader 完成后会派发此事件
    const handleReady = () => setShowContent(true);
    window.addEventListener('smart-loader-ready', handleReady);
    
    // 如果已经加载完成，立即显示
    if (document.readyState === 'complete') {
      setTimeout(() => setShowContent(true), 800);
    }
    
    return () => window.removeEventListener('smart-loader-ready', handleReady);
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
      {/* 背景图片 - 使用渐进式呈现组件 */}
      <HeroBackground 
        imageSrc="/assets/images/banners/home-banner.jpg" 
        isReady={showContent} 
      />

      {/* 文字和箭头容器 - 垂直居中 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pointer-events-auto">
        {/* 主标题 - 按字 stagger 动画 */}
        <div className="mb-8">
          <StaggerText
            as="h1"
            delay={0.3}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight inline"
            highlightRanges={[
              { start: 4, end: 9, className: 'text-blue-400' } // "天刀绝剑楼" 五个字
            ]}
          >
            欢迎来到天刀绝剑楼
          </StaggerText>
        </div>

        {/* 副标题 - 晚于主标题出现，动画更弱 */}
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: showContent ? 1 : 0, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 1.2, // 主标题完成后 + 延迟
            ease: [0.22, 1, 0.36, 1]
          }}
          className="text-xl md:text-2xl lg:text-3xl text-white/90 font-light"
        >
          AJian's Blog
        </motion.p>

        {/* 向下滚动按钮 - 在副标题之后出现 */}
        <motion.button
          onClick={scrollToContent}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: showContent ? 1 : 0, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 1.8, // 在副标题之后
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute bottom-20 w-14 h-14 bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-full flex items-center justify-center text-white hover:bg-white/30 hover:border-white/80 transition-all duration-300 hover:scale-110 cursor-pointer z-20 pointer-events-auto"
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
        </motion.button>
      </div>
    </section>
  );
}
