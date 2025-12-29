import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProfileRepository } from '@/lib/repositories/profile-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';

const profileRepository = new ProfileRepository();

// POST /api/user/profile/review - 提交资料审核请求
export async function POST(request: NextRequest) {
  return withErrorHandling(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return ApiResponse.unauthorized('未登录');
    }

    const { name, avatar } = await req.json();
    const userId = parseInt(session.user.id);

    // 验证至少有一个字段需要审核
    if (!name && !avatar) {
      return ApiResponse.validationError({ 
        general: '至少需要提供用户名或头像之一' 
      });
    }

    // 提交审核请求
    const success = await profileRepository.submitProfileReview(userId, {
      name,
      avatar
    });

    if (!success) {
      return ApiResponse.error('提交审核失败');
    }

    return ApiResponse.success(undefined, '审核请求已提交，等待管理员处理');
  })(request);
}

// PUT /api/user/profile/review - 管理员审核资料
export async function PUT(request: NextRequest) {
  return withErrorHandling(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return ApiResponse.unauthorized('未登录');
    }

    if (session.user.role !== 'admin') {
      return ApiResponse.forbidden('只有管理员可以审核资料');
    }

    const { userId, action, notes } = await req.json();

    if (!userId || !action) {
      return ApiResponse.validationError({ 
        userId: '用户ID必填',
        action: '审核动作必填'
      });
    }

    let success;
    if (action === 'approve') {
      success = await profileRepository.approveProfile(userId);
    } else if (action === 'reject') {
      success = await profileRepository.rejectProfile(userId, notes);
    } else {
      return ApiResponse.validationError({ 
        action: '审核动作必须是approve或reject' 
      });
    }

    if (!success) {
      return ApiResponse.error('审核操作失败');
    }

    const message = action === 'approve' ? '审核已通过' : '审核已拒绝';
    return ApiResponse.success(undefined, message);
  })(request);
}

// GET /api/user/profile/review - 获取待审核列表（管理员用）
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return ApiResponse.unauthorized('未登录');
    }

    if (session.user.role !== 'admin') {
      return ApiResponse.forbidden('只有管理员可以查看待审核列表');
    }

    // 使用Repository方法获取待审核列表
    const rows = await profileRepository.getPendingReviews();
    
    return ApiResponse.success(rows, '获取待审核列表成功');
  })(request);
}
