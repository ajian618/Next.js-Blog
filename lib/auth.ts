import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { UserRepository } from './repositories/user-repository';
import { ApiResponse } from './api-response';

const userRepository = new UserRepository();

// 从数据库获取用户信息（不使用缓存，确保获取最新数据）
async function getUserById(id: string) {
  try {
    const user = await userRepository.findAuthUserById(parseInt(id));
    return user;
  } catch (error) {
    console.error('Database query error:', error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await userRepository.findAuthUser(credentials.email);
        
        if (!user) {
          return null;
        }

        // 检查用户状态
        if (user.status === 'banned') {
          throw new Error('账号已被禁用');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // 清理敏感信息，只返回必要字段
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // 首次登录时存储用户信息
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
        return token;
      }

      // 当 session 更新时（如调用 getSession()），从数据库重新获取最新用户信息
      if (trigger === 'update' || token.iat) {
        try {
          const dbUser = await getUserById(token.id as string);
          if (dbUser) {
            token.name = dbUser.name;
            token.avatar = dbUser.avatar;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'admin';
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24小时
  },
  secret: process.env.NEXTAUTH_SECRET,
  // 启用调试模式仅在开发环境
  debug: process.env.NODE_ENV === 'development',
};
