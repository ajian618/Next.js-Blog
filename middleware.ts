import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

    // 如果是管理员路由但用户不是管理员，重定向到首页
    if (isAdminRoute && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 管理员路由需要登录且是管理员
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token && token.role === 'admin';
        }
        // 个人中心需要登录
        if (req.nextUrl.pathname.startsWith('/profile')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
