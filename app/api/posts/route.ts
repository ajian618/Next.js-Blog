import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PostRepository } from '@/lib/repositories/post-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';

const postRepository = new PostRepository();

// GET /api/posts - 获取文章列表
export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const published = searchParams.get('published');
  const categoryId = searchParams.get('categoryId');
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let rows: any[];
  let total: number = 0;
  
  // 处理分页请求
  if (categoryId) {
    // 获取指定分类的文章
    const catId = parseInt(categoryId, 10);
    rows = await postRepository.getPostsByCategory(catId, limit, offset);
    total = await postRepository.countPostsByCategory(catId);
  } else if (published === 'false') {
    // 获取所有文章（管理后台用，分页）
    rows = await postRepository.getAllPosts(limit, offset);
    total = await postRepository.countAllPosts();
  } else {
    // 默认获取已发布的文章（前台展示用，分页）
    rows = await postRepository.getPublishedPosts(limit, offset);
    total = await postRepository.countPublishedPosts();
  }

  // 返回包含 total 的响应
  return NextResponse.json({
    success: true,
    data: rows,
    total
  }, { status: 200 });
});

// POST /api/posts - 创建文章
export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role || session.user.role !== 'admin') {
    return ApiResponse.forbidden('需要管理员权限');
  }

  const body = await request.json();
  const { title, slug, content, excerpt, category_id, published, cover_image } = body;

  // 参数验证
  if (!title || !slug || !content) {
    return ApiResponse.validationError({
      title: !title ? '标题不能为空' : undefined,
      slug: !slug ? 'URL别名不能为空' : undefined,
      content: !content ? '内容不能为空' : undefined
    });
  }

  // 检查slug是否已存在
  const slugExists = await postRepository.checkSlugExists(slug);
  if (slugExists) {
    return ApiResponse.conflict('URL别名已存在，请使用其他别名');
  }

  const postId = await postRepository.create({
    title,
    slug,
    content,
    excerpt,
    category_id,
    published,
    cover_image
  });

  return ApiResponse.created({ id: postId, slug }, '文章创建成功');
});
