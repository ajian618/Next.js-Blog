'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到新的登录页面，并带上回调URL
    router.replace('/login?callbackUrl=/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-gray-600">跳转中...</div>
    </div>
  );
}
