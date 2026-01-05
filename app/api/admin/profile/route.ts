import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';
import { UserRepository } from '@/lib/repositories/user-repository';

const userRepository = new UserRepository();

// GET /api/admin/profile - 获取管理员信息
export const GET = withErrorHandling(async (request: NextRequest) => {
  // 获取管理员用户（role = 'admin'）
  const adminUser = await userRepository.getAdminUser();
  
  if (!adminUser) {
    return ApiResponse.notFound('未找到管理员');
  }

  return ApiResponse.success(adminUser, '获取管理员信息成功');
});
