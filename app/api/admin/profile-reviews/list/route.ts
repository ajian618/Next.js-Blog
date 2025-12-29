import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProfileRepository } from '@/lib/repositories/profile-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';

const profileRepository = new ProfileRepository();

// GET /api/admin/profile-reviews/list - 获取待审核列表
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return ApiResponse.unauthorized('未登录');
    }

    if (session.user.role !== 'admin') {
      return ApiResponse.forbidden('只有管理员可以查看审核列表');
    }

    const reviews = await profileRepository.getPendingReviews();

    return ApiResponse.success(reviews, '获取审核列表成功');
  })(request);
}

// 防止缓存
export const dynamic = 'force-dynamic';
