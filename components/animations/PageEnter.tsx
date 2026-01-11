'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageEnterProps {
  children: ReactNode;
  isReady: boolean;
  className?: string;
}

/**
 * 页面进入动画容器
 * 
 * 功能：
 * - 立即渲染子组件（避免白屏）
 * - 通过 isReady 控制内容渐显
 * - 使用简单的 opacity 过渡，不做复杂位移
 */
export default function PageEnter({ children, isReady, className = '' }: PageEnterProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isReady ? 1 : 0.3
        }}
        transition={{ 
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1] // 自然的缓动曲线
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
