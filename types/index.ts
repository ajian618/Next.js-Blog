export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: number;
  category_name?: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
  approved: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}
