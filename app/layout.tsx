import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SmartLoader } from '@/components/animations';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '天刀绝剑楼 - AJian\'s Blog',
  description: '基于 Next.js 和 MySQL 的个人博客系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <SmartLoader minDuration={800}>
          <Providers>{children}</Providers>
        </SmartLoader>
      </body>
    </html>
  );
}
