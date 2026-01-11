'use client';

import { motion } from 'framer-motion';

interface HeroBackgroundProps {
  imageSrc: string;
  isReady: boolean;
}

/**
 * Hero 区域背景图渐进式呈现
 * 
 * 设计原则：
 * - 初始状态：低透明度 + 模糊 + 轻微放大（预留过渡空间）
 * - Ready 后：逐渐清晰、放大效果收敛
 * - 避免"突然出现"的感觉
 */
export default function HeroBackground({ imageSrc, isReady }: HeroBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 主背景图 */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${imageSrc})`,
          willChange: 'opacity, filter, transform'
        }}
        initial={{
          opacity: 0.3,
          filter: 'blur(8px) brightness(0.7)',
          scale: 1.05
        }}
        animate={{
          opacity: isReady ? 1 : 0.3,
          filter: isReady ? 'blur(0px) brightness(1)' : 'blur(8px) brightness(0.7)',
          scale: isReady ? 1 : 1.05
        }}
        transition={{
          duration: 1.8,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      />
      
      {/* 渐变遮罩 - 始终存在 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent" />
    </div>
  );
}
