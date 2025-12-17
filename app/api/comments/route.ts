import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    
    let query = `
      SELECT c.*, u.name as user_name, u.avatar as user_avatar 
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
    `;
    const params: any[] = [];

    if (postId) {
      query += ' WHERE c.post_id = ? AND c.approved = TRUE';
      params.push(postId);
    }

    query += ' ORDER BY c.created_at DESC';

    const [rows] = await pool.query(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { post_id, author_name, author_email, content } = body;

    if (!post_id || !content) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    let userId = null;
    let finalAuthorName = author_name;
    let finalAuthorEmail = author_email;

    // 如果用户已登录，使用用户信息
    if (session?.user) {
      userId = parseInt(session.user.id);
      finalAuthorName = session.user.name;
      finalAuthorEmail = session.user.email;
    } else {
      // 未登录用户需要提供姓名和邮箱
      if (!author_name || !author_email) {
        return NextResponse.json({ error: '请填写姓名和邮箱' }, { status: 400 });
      }

      // 简单的邮箱验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(author_email)) {
        return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
      }
    }

    // 管理员的评论自动审核通过
    const approved = session?.user?.role === 'admin';

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO comments (post_id, user_id, author_name, author_email, content, approved) VALUES (?, ?, ?, ?, ?, ?)',
      [post_id, userId, finalAuthorName, finalAuthorEmail, content, approved]
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
