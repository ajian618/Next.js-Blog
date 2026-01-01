'use client';

import { useEffect, useState } from 'react';
import { getAvatarUrl } from '@/lib/image-utils';

interface AuthorData {
  name: string;
  avatar?: string;
}

export default function AuthorCard() {
  const [author, setAuthor] = useState<AuthorData>({ name: '博主' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminInfo() {
      try {
        // 获取管理员用户信息（role='admin'）
        const response = await fetch('/api/user/profile?role=admin');
        const result = await response.json();
        if (result.success && result.data) {
          setAuthor({
            name: result.data.name,
            avatar: result.data.avatar
          });
        }
      } catch (error) {
        console.error('获取博主信息失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminInfo();
  }, []);

  const avatarUrl = author.avatar ? getAvatarUrl(author.avatar, 64) : null;
  const initial = author.name.charAt(0).toUpperCase();

  return (
    <aside className="bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm p-6 mb-6">
      <div className="text-center mb-5">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={author.name}
            className="w-16 h-16 mx-auto border-2 border-[var(--accent-secondary)] rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 mx-auto bg-gray-100 border-2 border-[var(--accent-secondary)] flex items-center justify-center text-[var(--accent-primary)] text-xl font-bold tracking-wider mb-3 rounded-full">
            {initial}
          </div>
        )}
        <h3 className="text-gray-900 font-semibold tracking-wide">{author.name}</h3>
        <p className="text-gray-500 text-xs mt-1 tracking-wide uppercase">技术 · 生活 · 分享</p>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <p className="text-gray-600 text-sm leading-relaxed tracking-wide">
          热爱技术，专注于 Web 开发与用户体验。在这里记录学习心得与生活感悟。
        </p>
      </div>
    </aside>
  );
}
