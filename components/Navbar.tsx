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
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={session.user.name}
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {session.user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden md:inline font-medium">{userData.name || session.user.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setShowDropdown(false)}
          >
            个人中心
          </Link>
          
          {session.user.role === 'admin' && (
            <>
              <div className="border-t border-gray-100"></div>
              <Link
                href="/admin/dashboard"
                className="block px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                管理后台
              </Link>
            </>
          )}
          
          <div className="border-t border-gray-100"></div>
          <button
            onClick={() => {
              setShowDropdown(false);
              onSignOut();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
    <header className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            我的博客
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              首页
            </Link>
            
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
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
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
