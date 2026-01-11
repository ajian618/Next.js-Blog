'use client';

import { motion } from 'framer-motion';

/**
 * 加载中蓝色方块跳动动画
 * - 单个蓝色方块沿椭圆轨迹滚动
 * - 伴随弹跳效果
 */
export default function LoadingSpinner() {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      {/* 椭圆轨迹背景 */}
      <motion.div
        className="absolute w-16 h-8 border-2 border-blue-200 rounded-full"
        style={{ transform: 'rotate(-15deg)' }}
      />
      
      {/* 跳动的方块 */}
      <motion.div
        className="relative w-6 h-6 bg-blue-500 rounded-sm shadow-lg shadow-blue-500/30"
        animate={{
          x: [0, 28, 0, -28, 0],
          y: [0, -10, 0, -10, 0],
          rotate: [0, 360, 720, 1080, 1440],
          scale: [1, 1.1, 1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.25, 0.5, 0.75, 1]
        }}
        style={{
          transformOrigin: 'center'
        }}
      />
    </div>
  );
}
