import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, c.name as category_name FROM posts p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [params.id]
    );

    const posts = rows as any[];
    if (posts.length === 0) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json(posts[0]);
  } catch (error) {
    console.error('获取文章失败:', error);
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      'UPDATE posts SET title = ?, slug = ?, content = ?, excerpt = ?, category_id = ?, published = ? WHERE id = ?',
      [title, slug, content, excerpt || '', category_id || null, published || false, params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json({ message: '文章更新成功' });
  } catch (error: any) {
    console.error('更新文章失败:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'URL 别名已存在' }, { status: 400 });
    }
    return NextResponse.json({ error: '更新文章失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM posts WHERE id = ?',
      [params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json({ message: '文章删除成功' });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json({ error: '删除文章失败' }, { status: 500 });
  }
}
