'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggerTextProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'p' | 'span' | 'div';
  highlightRanges?: { start: number; end: number; className: string }[];
}

/**
 * 交错文字动画组件
 * 
 * 使用方式：
 * - 按字拆分（中文按字符）
 * - 支持 highlightRanges 指定高亮范围
 * 
 * 动画特点：
 * - 极小的 Y 轴位移（2-4px）
 * - 简单的 opacity 过渡
 * - 无弹跳、无旋转
 */
export default function StaggerText({ 
  children, 
  delay = 0,
  className = '',
  as: Component = 'span',
  highlightRanges = []
}: StaggerTextProps) {
  return (
    <Component className={className}>
      {typeof children === 'string' ? (
        // 按字拆分（中文按字符）
        children.split('').map((char, index) => {
          // 检查是否在高亮范围内
          const highlight = highlightRanges.find(
            r => index >= r.start && index < r.end
          );
          
          return (
            <motion.span
              key={index}
              style={{ 
                display: 'inline-block',
                whiteSpace: 'pre-wrap'
              }}
              className={highlight?.className}
              initial={{
                opacity: 0,
                y: 4
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
            transition={{
              duration: 0.5,
              delay: delay + (index * 0.1), // 字间隔 100ms
              ease: [0.22, 1, 0.36, 1]
            }}
            >
              {char}
            </motion.span>
          );
        })
      ) : (
        // 非字符串类型，直接动画包装
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {children}
        </motion.span>
      )}
    </Component>
  );
}
