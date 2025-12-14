import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');
    
    let query = 'SELECT p.*, c.name as category_name FROM posts p LEFT JOIN categories c ON p.category_id = c.id';
    const params: any[] = [];

    if (published === 'true') {
      query += ' WHERE p.published = TRUE';
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('获取文章失败:', error);
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, category_id, published } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO posts (title, slug, content, excerpt, category_id, published) VALUES (?, ?, ?, ?, ?, ?)',
      [title, slug, content, excerpt || '', category_id || null, published || false]
    );

    return NextResponse.json({ 
      id: result.insertId,
      message: '文章创建成功' 
    }, { status: 201 });
  } catch (error: any) {
    console.error('创建文章失败:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'URL 别名已存在' }, { status: 400 });
    }
    return NextResponse.json({ error: '创建文章失败' }, { status: 500 });
  }
}
