import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Repository } from './base-repository';
import { User } from '@/types';

interface ProfileRow extends RowDataPacket {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  pending_name?: string;
  pending_avatar?: string;
  review_status: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
  created_at: Date;
  updated_at: Date;
}

interface UpdateProfileData {
  name?: string;
  avatar?: string;
  bio?: string;
  pending_name?: string;
  pending_avatar?: string;
  review_status?: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
}

export class ProfileRepository extends Repository<User> {
  constructor() {
    super('users', [
      'id',
      'email',
      'name',
      'avatar',
      'bio',
      'role',
      'status',
      'created_at',
      'updated_at'
    ]);
  }

  // 实现抽象方法 - 但ProfileRepository主要用于查询，这些方法很少使用
  async create(data: Partial<User>): Promise<number> {
    const keys = Object.keys(data) as (keyof User)[];
    const values = keys.map(key => data[key]);
    const placeholders = keys.map(() => '?').join(', ');
    
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
    return result.insertId;
  }

  async update(id: number, data: Partial<User>): Promise<boolean> {
    const keys = Object.keys(data) as (keyof User)[];
    if (keys.length === 0) return false;
    
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => data[key]);
    values.push(id);
    
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE users SET ${updates} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // 获取用户资料（不包含密码，包含审核状态）
  async getProfile(id: number): Promise<any> {
    const query = `
      SELECT id, email, name, avatar, bio, role, status, 
             pending_name, pending_avatar, review_status, review_notes,
             created_at, updated_at
      FROM users 
      WHERE id = ?
    `;
    const result = await this.pool.query(query, [id]);
    const rows = result[0] as any[];
    
    if (!rows || rows.length === 0) return null;
    
    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatar: row.avatar,
      bio: row.bio,
      role: row.role,
      status: row.status,
      pending_name: row.pending_name,
      pending_avatar: row.pending_avatar,
      review_status: row.review_status,
      review_notes: row.review_notes,
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString()
    };
  }

  // 获取用户密码（用于验证）
  async getUserPassword(id: number): Promise<string | null> {
    const result = await this.pool.query(
      'SELECT password FROM users WHERE id = ?',
      [id]
    );
    // mysql2返回 [rows, fields]，我们需要第一个元素
    const rows = result[0] as any;
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0].password;
    }
    return null;
  }

  // 根据角色获取用户资料（用于获取管理员信息）
  async getProfileByRole(role: string): Promise<any> {
    const query = `
      SELECT id, name, avatar, bio, role, status, created_at, updated_at
      FROM users 
      WHERE role = ? AND status = 'active'
      LIMIT 1
    `;
    const result = await this.pool.query(query, [role]);
    const rows = result[0] as any[];
    
    if (!rows || rows.length === 0) return null;
    
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      avatar: row.avatar,
      bio: row.bio,
      role: row.role,
      status: row.status,
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString()
    };
  }

  async updateProfile(id: number, data: UpdateProfileData): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    // 普通字段直接更新
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(data.avatar);
    }
    if (data.bio !== undefined) {
      updates.push('bio = ?');
      values.push(data.bio);
    }

    // 审核相关字段
    if (data.pending_name !== undefined) {
      updates.push('pending_name = ?');
      values.push(data.pending_name);
    }
    if (data.pending_avatar !== undefined) {
      updates.push('pending_avatar = ?');
      values.push(data.pending_avatar);
    }
    if (data.review_status !== undefined) {
      updates.push('review_status = ?');
      values.push(data.review_status);
    }
    if (data.review_notes !== undefined) {
      updates.push('review_notes = ?');
      values.push(data.review_notes);
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(id);
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // 提交资料修改请求（放入待审核队列）
  async submitProfileReview(id: number, data: { name?: string; avatar?: string }): Promise<boolean> {
    const updates: string[] = ['review_status = ?'];
    const values: any[] = ['pending'];

    if (data.name !== undefined) {
      updates.push('pending_name = ?');
      values.push(data.name);
    }
    if (data.avatar !== undefined) {
      updates.push('pending_avatar = ?');
      values.push(data.avatar);
    }

    if (updates.length === 1) {
      return false;
    }

    values.push(id);
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // 管理员审核通过
  async approveProfile(id: number): Promise<boolean> {
    const query = `
      UPDATE users 
      SET 
        name = COALESCE(pending_name, name),
        avatar = COALESCE(pending_avatar, avatar),
        pending_name = NULL,
        pending_avatar = NULL,
        review_status = 'approved',
        review_notes = NULL
      WHERE id = ?
    `;
    const [result] = await this.pool.query<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  // 管理员审核拒绝
  async rejectProfile(id: number, notes?: string): Promise<boolean> {
    const query = `
      UPDATE users 
      SET 
        pending_name = NULL,
        pending_avatar = NULL,
        review_status = 'rejected',
        review_notes = ?
      WHERE id = ?
    `;
    const [result] = await this.pool.query<ResultSetHeader>(query, [notes || '资料修改被拒绝', id]);
    return result.affectedRows > 0;
  }

  // 获取待审核的用户列表
  async getPendingReviews(): Promise<any[]> {
    const query = `
      SELECT id, email, name, pending_name, pending_avatar, review_status, review_notes, created_at
      FROM users 
      WHERE review_status = 'pending'
      ORDER BY created_at DESC
    `;
    const [rows] = await this.pool.query(query);
    return rows as any[];
  }

  // 更新密码
  async updatePassword(id: number, hashedPassword: string): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }
}
