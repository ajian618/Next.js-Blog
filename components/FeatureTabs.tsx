'use client';

import { useState, useEffect, useRef } from 'react';

// 将tabs移到组件外部，避免每次渲染都重新创建
const tabs = [
  { id: 'author', label: '博主' },
  { id: 'moments', label: '片刻' },
  { id: 'comments', label: '评论' },
  { id: 'friends', label: '友人帐' },
];

export default function FeatureTabs() {
  const [activeTab, setActiveTab] = useState('author');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);

  // 更新滑动条位置
  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    const activeTabRef = tabRefs.current[activeIndex];
    if (activeTabRef) {
      setIndicatorStyle({
        left: activeTabRef.offsetLeft,
        width: activeTabRef.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  // 社交链接配置
  const socialLinks = [
    { id: 'github', name: 'GitHub', icon: '/assets/svg/github.svg', url: 'https://github.com/ajian618', title: 'GitHub' },
    { id: 'bilibili', name: '哔哩哔哩', icon: '/assets/svg/bilibili.svg', url: 'https://space.bilibili.com/85597003', title: '哔哩哔哩' },
    { id: 'email', name: 'Email', icon: '/assets/svg/email.svg', url: 'mailto:example@email.com', title: 'Email' },
  ];

  useEffect(() => {
    setIsVisible(true);
    fetchAdminUser();
    fetchComments();
  }, []);

  // 获取管理员信息
  const fetchAdminUser = async () => {
    try {
      const response = await fetch('/api/admin/profile');
      const result = await response.json();
      if (result.success && result.data) {
        setAdminUser(result.data);
      }
    } catch (error) {
      console.error('获取管理员信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取最新评论
  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments?limit=6');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  return (
    <section className="w-full py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* 标题 */}
        <div className={`mb-8 reveal ${isVisible ? 'active' : ''}`}>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 bg-clip-text text-transparent">Feature</h2>
        </div>

        {/* 标签页导航 */}
        <div className={`mb-8 reveal ${isVisible ? 'active' : ''}`}>
          <div className="relative">
            <ul className="flex flex-wrap gap-4 border-b border-gray-200 relative">
              {tabs.map((tab, index) => (
                <li
                  key={tab.id}
                  ref={(el) => { tabRefs.current[index] = el; }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-pointer px-6 py-3 font-medium transition-all duration-300 relative ${
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {tab.label}
                </li>
              ))}
              {/* 滑动条 */}
              <div 
                className="absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width
                }}
              />
            </ul>
          </div>
        </div>

        {/* 标签页内容 */}
        <div className={`reveal ${isVisible ? 'active' : ''}`}>
          {activeTab === 'author' && (
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-8">
              {loading ? (
                <div className="animate-pulse">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  {/* 头像 */}
                  <div className="flex-shrink-0">
                    {adminUser?.avatar ? (
                      <img
                        src={adminUser.avatar}
                        alt={adminUser?.name ?? '博主'}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-2xl font-bold">
                        博
                      </div>
                    )}
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">
                      {adminUser?.name ?? '博主'}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {adminUser?.bio ?? '简单记录在IT生活中遇到的各种有趣的事！'}
                    </p>

                    {/* 社交链接 */}
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      {socialLinks.map(link => (
                        <a
                          key={link.id}
                          href={link.url}
                          target={link.id !== 'email' ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          title={link.title}
                          className="group flex items-center gap-3 px-5 py-3 bg-white/90 border border-gray-200/50 rounded-xl hover:border-blue-600 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-1 transition-all duration-300"
                        >
                          <img
                            src={link.icon}
                            alt={link.name}
                            className="w-5 h-5 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                          />
                          <span className="font-medium text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                            {link.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'moments' && <PlaceholderSection title="片刻" message="暂无动态" />}
          {activeTab === 'comments' && (
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-8">
              {comments.length === 0 ? (
                <PlaceholderSection title="最新评论" message="暂无评论" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comments.slice(0, 6).map((comment) => (
                    <a
                      key={comment.id}
                      href={`/posts/${comment.post_slug}#comment-${comment.id}`}
                      className="group bg-white/80 border border-gray-200/50 rounded-xl p-5 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={comment.author_avatar || '/uploads/avatars/default-avatar.png'}
                          alt={comment.author_name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">{comment.author_name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-3 group-hover:text-gray-700 transition-colors">
                        {comment.content}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'friends' && <PlaceholderSection title="友人帐" message="暂无友情链接" />}
        </div>
      </div>
    </section>
  );
}

// 占位符组件（用于未实现的板块）
function PlaceholderSection({ title, message }: { title: string; message: string }) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-12 text-center">
      <svg
        className="w-16 h-16 mx-auto text-blue-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
