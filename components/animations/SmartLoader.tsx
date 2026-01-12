'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

/**
 * 智能加载状态管理器
 * - 顶部蓝色进度条，真实反映加载进度
 * - 中间显示跳动方块动画
 * - 页面加载完成后平滑过渡到首页
 */
export default function SmartLoader({ 
  children, 
  minDuration = 1500
}: { 
  children: React.ReactNode;
  minDuration?: number;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 如果页面已经加载完成
    if (document.readyState === 'complete') {
      const timer = setTimeout(() => {
        setIsLoading(false);
        window.dispatchEvent(new CustomEvent('smart-loader-ready'));
      }, Math.max(0, minDuration - 500));
      return () => clearTimeout(timer);
    }

    // 监听资源加载
    const handleProgress = () => {
      const resources = window.performance.getEntriesByType('resource');
      const loaded = resources.filter((r: any) => r.duration > 0 || r.transferSize > 0);
      const total = Math.max(resources.length, 10);
      // 真实反映进度，可能超过 95%，由 handleComplete 负责走到 100%
      const percent = (loaded.length / total) * 100;
      setProgress(Math.min(percent, 99));
    };

    // 监听页面完成
    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        window.dispatchEvent(new CustomEvent('smart-loader-ready'));
      }, 300);
    };

    if (window.performance) {
      handleProgress();
      const interval = setInterval(handleProgress, 200);
      window.addEventListener('load', handleComplete);
      return () => {
        clearInterval(interval);
        window.removeEventListener('load', handleComplete);
      };
    } else {
      const timer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          window.dispatchEvent(new CustomEvent('smart-loader-ready'));
        }, 300);
      }, minDuration);
      return () => clearTimeout(timer);
    }
  }, [minDuration]);

  return (
    <>
      {/* 进度条随遮罩一起消失 */}
      <AnimatePresence>
        {isLoading && (
          <>
            {/* 顶部进度条 */}
            <motion.div
              className="fixed top-0 left-0 h-1 bg-blue-500 z-[100]"
              style={{ width: '100%' }}
              initial={{ scaleX: 0, transformOrigin: 'left' }}
              animate={{ 
                scaleX: Math.max(0.02, progress / 100) // 至少显示一点点
              }}
              exit={{ 
                opacity: 0,
                transition: { duration: 0.3 }
              }}
              transition={{ duration: 0.2 }}
            />

            {/* 中间 Loading 动画遮罩 */}
            <motion.div
              className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ 
                opacity: 0,
                transition: { duration: 0.4 }
              }}
            >
              <LoadingSpinner />
              <p className="mt-4 text-sm text-gray-400 font-medium">
                {Math.round(Math.min(100, progress))}%
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {children}
    </>
  );
}
