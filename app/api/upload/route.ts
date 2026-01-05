import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // 验证登录状态
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '没有选择文件' }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '只支持图片格式 (JPEG, PNG, GIF, WebP)' }, { status: 400 });
    }

    // 验证文件大小 (5MB 限制)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: '文件大小不能超过 5MB' }, { status: 400 });
    }

    // 检查上传类型
    const uploadType = formData.get('type') as string || 'image'; // 'avatar', 'category', 'image'
    
    // 根据类型确定上传目录
    let uploadDir: string;
    let prefix: string;
    
    if (uploadType === 'avatar') {
      uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      prefix = 'avatar-';
    } else if (uploadType === 'category') {
      uploadDir = path.join(process.cwd(), 'public', 'uploads', 'category');
      prefix = 'category-';
    } else {
      uploadDir = path.join(process.cwd(), 'public', 'uploads');
      prefix = 'image-';
    }
    
    // 创建上传目录
    await mkdir(uploadDir, { recursive: true });

    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.name);
    const filename = `${prefix}${timestamp}-${random}${extension}`;
    const filepath = path.join(uploadDir, filename);

    // 保存文件
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // 返回文件 URL
    const fileUrl = uploadType === 'avatar'
      ? `/uploads/avatars/${filename}`
      : uploadType === 'category'
      ? `/uploads/category/${filename}`
      : `/uploads/${filename}`;
    
    return NextResponse.json({ 
      success: true,
      url: fileUrl,
      filename: filename,
      message: '图片上传成功'
    }, { status: 200 });

  } catch (error) {
    console.error('图片上传失败:', error);
    return NextResponse.json({ error: '图片上传失败' }, { status: 500 });
  }
}

// 防止缓存
export const dynamic = 'force-dynamic';
