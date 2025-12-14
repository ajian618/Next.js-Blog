import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    
    let query = 'SELECT * FROM comments';
    const params: any[] = [];

    if (postId) {
      query += ' WHERE post_id = ? AND approved = TRUE';
      params.push(postId);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_id, author_name, author_email, content } = body;

    if (!post_id || !author_name || !author_email || !content) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 简单的邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(author_email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO comments (post_id, author_name, author_email, content, approved) VALUES (?, ?, ?, ?, ?)',
      [post_id, author_name, author_email, content, false] // 默认不审核通过
    );

    return NextResponse.json({ 
      id: result.insertId,
      message: '评论提交成功，等待审核' 
    }, { status: 201 });
  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json({ error: '创建评论失败' }, { status: 500 });
  }
}
