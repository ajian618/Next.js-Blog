import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');
    const width = searchParams.get('width');
    const height = searchParams.get('height');

    if (!imagePath) {
      return NextResponse.json({ error: '图片路径必填' }, { status: 400 });
    }

    // 构建完整的文件路径
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    
    // 调试日志
    const fileExists = existsSync(fullPath);
    console.log('图片处理请求:', { 
      imagePath, 
      fullPath, 
      exists: fileExists 
    });

    if (!fileExists) {
      return NextResponse.json({ 
        error: '图片文件不存在',
        path: fullPath,
        requestedPath: imagePath
      }, { status: 404 });
    }
    
    // 读取图片文件
    const imageBuffer = await readFile(fullPath);

    // 使用sharp处理图片
    let sharpInstance = sharp(imageBuffer);

    // 如果指定了尺寸，进行缩放
    if (width || height) {
      const resizeOptions: sharp.ResizeOptions = {
        fit: 'cover',
        withoutEnlargement: true
      };
      
      if (width) resizeOptions.width = parseInt(width);
      if (height) resizeOptions.height = parseInt(height);
      
      sharpInstance = sharpInstance.resize(resizeOptions);
    }

    // 根据原始图片类型返回
    const ext = path.extname(imagePath).toLowerCase();
    let contentType = 'image/jpeg';
    
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';

    const processedBuffer = await sharpInstance.toBuffer();

    return new NextResponse(processedBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // 缓存1年
      },
    });

  } catch (error) {
    console.error('图片处理失败:', error);
    return NextResponse.json({ error: '图片处理失败' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
