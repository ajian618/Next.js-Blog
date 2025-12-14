import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [name, slug, description || '']
    );

    return NextResponse.json({ 
      id: result.insertId,
      message: '分类创建成功' 
    }, { status: 201 });
  } catch (error: any) {
    console.error('创建分类失败:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: '分类别名已存在' }, { status: 400 });
    }
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 });
  }
}
