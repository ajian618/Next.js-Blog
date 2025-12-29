import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProfileRepository } from '@/lib/repositories/profile-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';

const profileRepository = new ProfileRepository();

// POST /api/admin/profile-reviews/approve - 审核通过
export async function POST(request: NextRequest) {
  return withErrorHandling(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (session.user.role !== 'admin') {
      return ApiResponse.forbidden('只有管理员可以审核资料');
    }

    const formData = await req.formData();
    const userId = parseInt(formData.get('userId') as string);

    if (!userId) {
      return ApiResponse.validationError({ userId: '用户ID必填' });
    }

    const success = await profileRepository.approveProfile(userId);

    if (!success) {
      return ApiResponse.error('审核操作失败');
    }

    // 返回成功响应，让前端处理刷新
    return ApiResponse.success(null, '审核通过成功');
  })(request);
}
