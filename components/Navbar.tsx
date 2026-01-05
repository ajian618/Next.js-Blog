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

// 搜索组件
function SearchBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // 自动聚焦输入框
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-[var(--accent-primary)] transition-colors rounded-lg hover:bg-gray-100"
        title="搜索"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-in z-50">
          <form onSubmit={handleSearch} className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索文章标题、内容..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:bg-white transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!query.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-hover)] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                搜索
              </button>
            </div>
            
            <div className="mt-3 text-xs text-gray-400">
              <span className="font-medium">提示：</span>支持模糊查询和相似内容搜索
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// 用户菜单组件
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
        className="p-2 text-gray-600 hover:text-[var(--accent-primary)] transition-colors"
        title={userData.name || session.user.name}
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={session.user.name}
            className="w-6 h-6 rounded object-cover border border-gray-300"
          />
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 py-1 animate-slide-in shadow-lg rounded-lg z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{userData.name || session.user.name}</p>
            <p className="text-xs text-gray-500 mt-1">{session.user.email}</p>
          </div>
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:text-[var(--accent-primary)] hover:bg-gray-50 transition-colors"
            onClick={() => setShowDropdown(false)}
          >
            个人中心
          </Link>
          
          {session.user.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              className="block px-4 py-2 text-sm text-[var(--accent-primary)] hover:bg-blue-50 transition-colors"
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
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}

// 导航菜单项组件
function NavItem({ label, children, active, onToggle }: { label: string; children: React.ReactNode; active: boolean; onToggle: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          onToggle();
        }}
        className={`text-sm font-medium transition-colors tracking-wide ${
          active || isOpen 
            ? 'text-[var(--accent-primary)]' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {label}
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 py-2 shadow-lg rounded-lg animate-slide-in z-50">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData>({ name: '' });
  const [activeMenu, setActiveMenu] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isLoading = status === 'loading';

  // 滚动检测
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-sm' 
        : 'bg-gradient-to-b from-white via-white/70 via-white/50 via-white/30 via-white/20 to-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className={`flex justify-between items-center transition-all duration-500 ${
          isScrolled ? 'justify-center' : ''
        }`}>
          {/* 左侧：LOGO + 导航菜单 */}
          <div className={`flex items-center gap-8 transition-all duration-500 ${
            isScrolled ? 'flex-1 justify-center' : ''
          }`}>
            <Link 
              href="/" 
              className={`font-bold tracking-wider hover:text-[var(--accent-primary)] transition-all duration-500 uppercase ${
              isScrolled ? 'text-xl' : 'text-2xl'
            } text-gray-900`} style={{ letterSpacing: '0.1em' }}>
              天刀绝剑楼
            </Link>
            
            {!isLoading && !isScrolled && (
              <nav className="hidden md:flex items-center gap-6">
                <NavItem
                  label="档案馆"
                  active={activeMenu === 'archive'}
                  onToggle={() => setActiveMenu(activeMenu === 'archive' ? '' : 'archive')}
                >
                  <Link href="/posts" className="block px-4 py-2 text-sm text-gray-700 hover:text-[var(--accent-primary)] hover:bg-gray-50 transition-colors">
                    文章列表
                  </Link>
                  <Link href="/categories" className="block px-4 py-2 text-sm text-gray-700 hover:text-[var(--accent-primary)] hover:bg-gray-50 transition-colors">
                    文章分类
                  </Link>
                  {/* 占位 */}
                  <div className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                    文章标签
                  </div>
                  {/* 占位 */}
                  <div className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                    文章归档
                  </div>
                </NavItem>

                <NavItem
                  label="更多内容"
                  active={activeMenu === 'more'}
                  onToggle={() => setActiveMenu(activeMenu === 'more' ? '' : 'more')}
                >
                  {/* 占位 */}
                  <div className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                    片刻瞬间
                  </div>
                  {/* 占位 */}
                  <div className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                    臻藏家画展
                  </div>
                  <Link href="/about" className="block px-4 py-2 text-sm text-gray-700 hover:text-[var(--accent-primary)] hover:bg-gray-50 transition-colors">
                    关于本站
                  </Link>
                  <a
                    href="https://www.travellings.cn/go.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-700 hover:text-[var(--accent-primary)] hover:bg-gray-50 transition-colors"
                  >
                    开往 ↗
                  </a>
                </NavItem>

                <Link
                  href="/friends"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors tracking-wide">
                  友人帐
                </Link>
              </nav>
            )}
          </div>
          
          {/* 右侧：搜索 + 用户图标 */}
          <div className={`flex items-center gap-3 transition-all duration-500 ${
            isScrolled ? 'hidden' : ''
          }`}>
            {!isLoading && (
              <>
                <SearchBox />
                
                {session?.user ? (
                  <UserMenu 
                    session={session}
                    userData={userData}
                    onSignOut={() => signOut({ callbackUrl: '/' })}
                  />
                ) : (
                  <Link 
                    href="/login"
                    className={`p-2 transition-colors ${
                      isScrolled 
                        ? 'text-gray-600 hover:text-[var(--accent-primary)]' 
                        : 'text-gray-600 hover:text-[var(--accent-primary)]'
                    }`}
                    title="登录"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                )}

                {/* 移动端菜单按钮 */}
                <button
                  className={`md:hidden transition-colors ${
                    isScrolled 
                      ? 'text-gray-600 hover:text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveMenu(activeMenu === 'mobile' ? '' : 'mobile')}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
