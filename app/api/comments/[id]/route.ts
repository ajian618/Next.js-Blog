import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { approved } = body;

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE comments SET approved = ? WHERE id = ?',
      [approved, params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    }

    return NextResponse.json({ message: '评论状态更新成功' });
  } catch (error) {
    console.error('更新评论失败:', error);
    return NextResponse.json({ error: '更新评论失败' }, { status: 500 });
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
      'DELETE FROM comments WHERE id = ?',
      [params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    }

    return NextResponse.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json({ error: '删除评论失败' }, { status: 500 });
  }
}
