import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Repository } from './base-repository';
import { Post } from '@/types';

interface PostRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  cover_image: string;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category_id?: number;
  published?: boolean;
  cover_image?: string;
}

interface UpdatePostData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  category_id?: number;
  published?: boolean;
  cover_image?: string;
}

export class PostRepository extends Repository<Post> {
  constructor() {
    super('posts', [
      'id',
      'title',
      'slug',
      'content',
      'excerpt',
      'category_id',
      'cover_image',
      'published',
      'created_at',
      'updated_at'
    ]);
  }

  // 获取所有已发布的文章（带分类名称）
  async getPublishedPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
    const query = `
      SELECT p.id, p.title, p.slug, p.excerpt, p.category_id, p.cover_image, p.created_at, c.name as category_name
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.published = TRUE 
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.pool.query(query, [limit, offset]);
    return rows as Post[];
  }

  // 统计已发布的文章数量
  async countPublishedPosts(): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM posts WHERE published = TRUE`;
    const [rows] = await this.pool.query(query);
    return (rows as any[])[0].total;
  }

  // 根据slug获取文章（带分类名称）
  async getPostBySlug(slug: string): Promise<Post | null> {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.slug = ? AND p.published = TRUE
    `;
    const [rows] = await this.pool.query(query, [slug]);
    return (rows as Post[])[0] || null;
  }

  // 获取文章详情（管理后台用，包含所有状态）
  async getPostById(id: number): Promise<Post | null> {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `;
    const [rows] = await this.pool.query(query, [id]);
    return (rows as Post[])[0] || null;
  }

  // 获取所有文章（管理后台用）
  async getAllPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.pool.query(query, [limit, offset]);
    return rows as Post[];
  }

  // 统计所有文章数量
  async countAllPosts(): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM posts`;
    const [rows] = await this.pool.query(query);
    return (rows as any[])[0].total;
  }

  async create(data: CreatePostData): Promise<number> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO posts (title, slug, content, excerpt, category_id, cover_image, published) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.title, data.slug, data.content, data.excerpt || '', data.category_id || null, data.cover_image || null, data.published || false]
    );
    return result.insertId;
  }

  async update(id: number, data: UpdatePostData): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?');
      values.push(data.slug);
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(data.content);
    }
    if (data.excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(data.excerpt);
    }
    if (data.category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(data.category_id);
    }
    if (data.published !== undefined) {
      updates.push('published = ?');
      values.push(data.published);
    }
    if (data.cover_image !== undefined) {
      updates.push('cover_image = ?');
      values.push(data.cover_image);
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(id);
    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // 检查slug是否已存在
  async checkSlugExists(slug: string, excludeId?: number): Promise<boolean> {
    let query = 'SELECT id FROM posts WHERE slug = ?';
    const params: any[] = [slug];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await this.pool.query(query, params);
    return (rows as any[]).length > 0;
  }

  // 获取指定分类的文章（分页）
  async getPostsByCategory(categoryId: number, limit: number = 10, offset: number = 0): Promise<Post[]> {
    const query = `
      SELECT p.id, p.title, p.slug, p.excerpt, p.category_id, p.created_at, c.name as category_name
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.category_id = ? AND p.published = TRUE 
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.pool.query(query, [categoryId, limit, offset]);
    return rows as Post[];
  }

  // 统计指定分类的文章数量
  async countPostsByCategory(categoryId: number): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM posts WHERE category_id = ? AND published = TRUE`;
    const [rows] = await this.pool.query(query, [categoryId]);
    return (rows as any[])[0].total;
  }

  // 搜索文章（模糊查询）
  async searchPosts(
    query: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Post[]> {
    const searchPattern = `%${query}%`;
    const sql = `
      SELECT p.id, p.title, p.slug, p.excerpt, p.category_id, p.cover_image, p.created_at, c.name as category_name
      FROM posts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.published = TRUE
        AND (p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ?)
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.pool.query(sql, [searchPattern, searchPattern, searchPattern, limit, offset]);
    return rows as Post[];
  }

  // 统计搜索结果数量
  async countSearchResults(query: string): Promise<number> {
    const searchPattern = `%${query}%`;
    const sql = `
      SELECT COUNT(*) as total 
      FROM posts 
      WHERE published = TRUE
        AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)
    `;
    const [rows] = await this.pool.query(sql, [searchPattern, searchPattern, searchPattern]);
    return (rows as any[])[0].total;
  }
}
