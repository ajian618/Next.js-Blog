// 图片处理工具函数

/**
 * 生成处理后的图片URL
 * @param originalPath 原始图片路径 (如: /uploads/avatars/avatar-123.jpg)
 * @param width 宽度
 * @param height 高度
 * @returns 处理后的图片URL
 */
export function getProcessedImageUrl(
  originalPath: string | null | undefined,
  width?: number,
  height?: number
): string | null {
  if (!originalPath) return null;

  // 如果是外部URL，直接返回
  if (originalPath.startsWith('http://') || originalPath.startsWith('https://')) {
    return originalPath;
  }

  // 构建处理API的URL
  const params = new URLSearchParams();
  params.append('path', originalPath);
  
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());

  return `/api/images/resize?${params.toString()}`;
}

/**
 * 获取头像URL（统一处理）
 * @param avatar 头像路径
 * @param size 头像尺寸 (默认: 64)
 * @returns 处理后的头像URL
 */
export function getAvatarUrl(avatar: string | null | undefined, size: number = 64): string | null {
  if (!avatar) return null;
  return getProcessedImageUrl(avatar, size, size);
}

/**
 * 获取文章图片URL
 * @param imagePath 图片路径
 * @param width 宽度
 * @returns 处理后的图片URL
 */
export function getArticleImageUrl(imagePath: string | null | undefined, width: number = 800): string | null {
  if (!imagePath) return null;
  return getProcessedImageUrl(imagePath, width, undefined);
}
