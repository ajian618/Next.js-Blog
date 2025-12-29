import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PostRepository } from '@/lib/repositories/post-repository';
import { ApiResponse, withErrorHandling } from '@/lib/api-response';

const postRepository = new PostRepository();

// GET /api/posts - 获取文章列表
export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const published = searchParams.get('published');

  let rows: any[];
  
  if (published === 'true') {
    rows = await postRepository.getPublishedPosts();
  } else {
    rows = await postRepository.getAllPosts();
  }

  return ApiResponse.success(rows, '获取文章列表成功');
});

// POST /api/posts - 创建文章
export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role || session.user.role !== 'admin') {
    return ApiResponse.forbidden('需要管理员权限');
  }

  const body = await request.json();
  const { title, slug, content, excerpt, category_id, published } = body;

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
    published
  });

  return ApiResponse.created({ id: postId, slug }, '文章创建成功');
});
