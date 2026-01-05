import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PostRepository } from '@/lib/repositories/post-repository';
import { CommentRepository } from '@/lib/repositories/comment-repository';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const postRepository = new PostRepository();
const commentRepository = new CommentRepository();

async function getPost(slug: string) {
  try {
    console.log('正在查询文章, slug:', slug);
    const post = await postRepository.getPostBySlug(slug);
    console.log('查询结果:', post ? '找到' : '未找到');
    return post;
  } catch (error) {
    console.error('获取文章失败:', error);
    return null;
  }
}

async function getComments(postId: number) {
  try {
    return await commentRepository.getApprovedCommentsByPost(postId);
  } catch (error) {
    console.error('获取评论失败:', error);
    return [];
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const comments = await getComments(post.id);

  return (
    <div className="min-h-screen relative bg-[var(--bg-secondary)]">
      {/* 背景图片 - 使用背景图方式避免模糊 */}
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/images/banners/home-banner.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-gray-100/85" />
      </div>
      
      <Navbar />

      {/* Article - 使用两栏布局 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* 左侧：文章内容和评论 */}
          <div className="min-w-0">
            {/* 返回链接 */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--accent-primary)] text-sm tracking-wide mb-8 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回首页
            </Link>

            {/* 文章内容 */}
            <article className="bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm p-8 mb-8">
              {/* 文章头部 */}
              <header className="mb-8">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-5 uppercase tracking-wider">
                  {post.category_name && (
                    <span className="bg-[var(--accent-secondary)] text-[var(--accent-primary)] px-3 py-1.5 font-medium border border-blue-200">
                      {post.category_name}
                    </span>
                  )}
                  <time dateTime={post.created_at} className="font-medium">
                    {format(new Date(post.created_at), 'yyyy.MM.dd', { locale: zhCN })}
                  </time>
                </div>
                
                <h1 className="text-3xl font-semibold text-gray-900 mb-6 tracking-wide leading-snug">
                  {post.title}
                </h1>
              </header>

              {/* 文章正文 - @tailwindcss/typography 插件样式 */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* 评论区 */}
            <div className="bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm p-8 mt-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 tracking-wide flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                评论 ({comments.length})
              </h2>
              
              <CommentForm postId={post.id} />
              
              <div className="mt-8">
                <CommentList comments={comments} />
              </div>
            </div>
          </div>

          {/* 右侧：博主介绍 - 暂时移除，组件不存在 */}
        </div>
      </main>

      <Footer />
    </div>
  );
}
