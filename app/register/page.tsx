'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少需要6位');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error((result as any).error || '注册失败');
        }

        if (!result.success) {
          throw new Error((result as any).error || '注册失败');
        }

        setSuccess('注册成功！3秒后跳转到登录页面...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat bg-fixed relative">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/images/banners/home-banner.jpg)' }}
      />
      <div className="absolute inset-0 bg-black/40" />
      
      {/* 内容 */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-2xl font-bold text-white mb-2 tracking-wide" style={{ letterSpacing: '0.05em' }}>
          创建账户
        </h1>
        <p className="text-center text-white/80">
          注册一个新的账户
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm py-10 px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-sm animate-fade-in tracking-wide rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 text-sm animate-fade-in tracking-wide rounded">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5 tracking-wide">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isPending}
                className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors tracking-wide rounded"
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5 tracking-wide">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isPending}
                className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors tracking-wide rounded"
                placeholder="•••••••"
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-gray-500">密码长度至少6位</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5 tracking-wide">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isPending}
                className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors tracking-wide rounded"
                placeholder="•••••••"
                autoComplete="new-password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-[var(--accent-primary)] text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors tracking-wide font-medium rounded"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-none animate-spin"></span>
                    注册中...
                  </span>
                ) : (
                  '注册'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">或</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="font-medium text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors tracking-wide"
              >
                已有账户？立即登录
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors tracking-wide"
              >
                ← 返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
