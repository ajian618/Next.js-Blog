import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProfileRepository } from '@/lib/repositories/profile-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';
import bcrypt from 'bcryptjs';

const profileRepository = new ProfileRepository();

// 获取用户信息
export async function GET(request: NextRequest) {
  return withErrorHandling(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    
    // 检查是否要获取指定角色的用户信息（用于获取管理员信息显示在首页）
    const roleParam = req.nextUrl.searchParams.get('role');
    
    if (roleParam === 'admin') {
      // 获取管理员用户信息（用于首页展示）
      const adminProfile = await profileRepository.getProfileByRole('admin');
      
      if (!adminProfile) {
        return ApiResponse.notFound('管理员用户不存在');
      }

      return ApiResponse.success(adminProfile, '获取管理员信息成功');
    }
    
    // 默认获取当前登录用户信息
    if (!session?.user) {
      return ApiResponse.unauthorized('未登录');
    }

    const profile = await profileRepository.getProfile(parseInt(session.user.id));
    
    if (!profile) {
      return ApiResponse.notFound('用户不存在');
    }

    return ApiResponse.success(profile, '获取用户信息成功');
  })(request);
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  return withErrorHandling(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return ApiResponse.unauthorized('未登录');
    }

    const { name, bio, avatar, currentPassword, newPassword } = await req.json();
    const userId = parseInt(session.user.id);

    // 如果要修改密码，先验证当前密码
    if (newPassword) {
      if (!currentPassword) {
        return ApiResponse.validationError({ currentPassword: '请输入当前密码' });
      }

      if (newPassword.length < 6) {
        return ApiResponse.validationError({ newPassword: '新密码长度至少为6个字符' });
      }

      // 验证当前密码
      const currentHashedPassword = await profileRepository.getUserPassword(userId);
      
      if (!currentHashedPassword) {
        return ApiResponse.notFound('用户不存在');
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, currentHashedPassword);

      if (!isPasswordValid) {
        return ApiResponse.validationError({ currentPassword: '当前密码不正确' });
      }

      // 更新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await profileRepository.updatePassword(userId, hashedPassword);
    }

    // 更新其他信息
    if (name !== undefined || bio !== undefined || avatar !== undefined) {
      await profileRepository.updateProfile(userId, { name, bio, avatar });
    }

    return ApiResponse.updated(undefined, '更新成功');
  })(request);
}
