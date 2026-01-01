'use client';

import { useState, useTransition, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import VideoBackground from '@/components/VideoBackground';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('邮箱或密码错误');
        } else {
          const callbackUrl = searchParams.get('callbackUrl') || '/';
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (err) {
        setError('登录失败，请稍后重试');
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <VideoBackground />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-2xl font-bold text-white mb-2 tracking-wide" style={{ letterSpacing: '0.05em' }}>
          欢迎回来
        </h1>
        <p className="text-center text-white/80">
          登录到您的账户
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5 tracking-wide">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isPending}
                className="block w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors tracking-wide rounded"
                placeholder="•••••••"
                autoComplete="current-password"
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
                    登录中...
                  </span>
                ) : (
                  '登录'
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
                href="/register"
                className="font-medium text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors tracking-wide"
              >
                还没有账户？立即注册
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">加载中...</div>}>
      <LoginForm />
    </Suspense>
  );
}
