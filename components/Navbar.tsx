'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { getAvatarUrl } from '@/lib/image-utils';

// 用户数据接口
interface UserData {
  avatar?: string;
  name: string;
}

// 简化的用户菜单组件
function UserMenu({ session, userData, onSignOut }: { session: any; userData: UserData; onSignOut: () => void }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 优先使用最新的用户数据头像，否则使用 session 头像
  const currentAvatar = userData.avatar || session.user.avatar;
  const avatarUrl = getAvatarUrl(currentAvatar, 32);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors group"
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={session.user.name}
            className="w-8 h-8 rounded object-cover border border-gray-300 group-hover:border-[var(--accent-primary)] transition-colors"
          />
        ) : (
          <div className="w-8 h-8 bg-[var(--bg-tertiary)] border border-gray-300 flex items-center justify-center text-[var(--accent-primary)] text-sm font-bold tracking-wider group-hover:border-[var(--accent-primary)] transition-colors">
            {session.user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden md:inline font-medium tracking-wide text-sm">{userData.name || session.user.name}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform text-gray-500 ${showDropdown ? 'rotate-180 text-[var(--accent-primary)]' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 py-1 animate-slide-in shadow-lg rounded-lg">
          <Link
            href="/profile"
            className="block px-4 py-2.5 text-sm text-gray-700 hover:text-[var(--accent-primary)] hover:bg-gray-50 transition-colors border-l-2 border-transparent hover:border-[var(--accent-primary)]"
            onClick={() => setShowDropdown(false)}
          >
            个人中心
          </Link>
          
          {session.user.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              className="block px-4 py-2.5 text-sm text-[var(--accent-primary)] hover:bg-blue-50 transition-colors border-l-2 border-transparent hover:border-[var(--accent-primary)]"
              onClick={() => setShowDropdown(false)}
            >
              管理后台
            </Link>
          )}
          
          <div className="h-px bg-gray-200 my-1"></div>
          <button
            onClick={() => {
              setShowDropdown(false);
              onSignOut();
            }}
            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors border-l-2 border-transparent hover:border-red-600"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData>({ name: '' });
  
  // 优化：使用更短的加载超时
  const isLoading = status === 'loading';

  // 获取最新的用户信息
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/profile');
          const result = await response.json();
          if (result.success && result.data) {
            setUserData({
              avatar: result.data.avatar,
              name: result.data.name
            });
          }
        } catch (err) {
          console.error('获取用户信息失败:', err);
        }
      }
    };

    fetchUserData();

    // 每分钟刷新一次用户数据，确保头像更新能及时显示
    const interval = setInterval(fetchUserData, 60000);

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-wider hover:text-[var(--accent-primary)] transition-colors uppercase" style={{ letterSpacing: '0.1em' }}>
            天刀绝剑楼
          </Link>
          
          <nav className="flex items-center gap-8">
            
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 border border-gray-200 animate-pulse rounded"></div>
              </div>
            ) : session?.user ? (
              <UserMenu 
                session={session}
                userData={userData}
                onSignOut={() => signOut({ callbackUrl: '/' })}
              />
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm tracking-wide"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] transition-colors text-sm font-medium tracking-wide border border-[var(--accent-primary)] hover:border-[var(--accent-hover)] rounded"
                >
                  注册
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
