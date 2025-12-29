import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unlink } from 'fs/promises';
import path from 'path';

// DELETE /api/delete-image - 删除图片文件
export async function DELETE(request: NextRequest) {
  try {
    // 验证登录状态
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: '图片URL不能为空' }, { status: 400 });
    }

    // 安全检查：只允许删除 public 目录下的文件
    if (!imageUrl.startsWith('/uploads/')) {
      return NextResponse.json({ error: '无效的图片路径' }, { status: 400 });
    }

    // 构建文件系统路径
    const filePath = path.join(process.cwd(), 'public', imageUrl);

    // 删除文件
    try {
      await unlink(filePath);
      console.log('删除图片成功:', filePath);
      return NextResponse.json({ 
        success: true, 
        message: '图片删除成功' 
      });
    } catch (error: any) {
      // 如果文件不存在，也算成功
      if (error.code === 'ENOENT') {
        console.log('图片文件不存在，跳过删除:', filePath);
        return NextResponse.json({ 
          success: true, 
          message: '图片不存在或已删除' 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('删除图片失败:', error);
    return NextResponse.json({ 
      error: '删除图片失败' 
    }, { status: 500 });
  }
}

// 防止缓存
export const dynamic = 'force-dynamic';
