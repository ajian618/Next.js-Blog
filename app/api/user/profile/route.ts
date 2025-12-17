import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

// 获取用户信息
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, name, avatar, bio, role, status, created_at FROM users WHERE id = ?',
      [session.user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const { name, bio, avatar, currentPassword, newPassword } = await request.json();

    // 如果要修改密码，先验证当前密码
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: '请输入当前密码' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: '新密码长度至少为6个字符' },
          { status: 400 }
        );
      }

      // 验证当前密码
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT password FROM users WHERE id = ?',
        [session.user.id]
      );

      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '当前密码不正确' },
          { status: 400 }
        );
      }

      // 更新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, session.user.id]
      );
    }

    // 更新其他信息
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }

    if (updates.length > 0) {
      values.push(session.user.id);
      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    );
  }
}
