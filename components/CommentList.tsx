import { Comment } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getAvatarUrl } from '@/lib/image-utils';

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 tracking-wide">
        暂无评论
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
          <div className="flex items-center gap-3 mb-3">
            {comment.author_avatar ? (
              <img
                src={getAvatarUrl(comment.author_avatar, 40) || comment.author_avatar}
                alt={comment.author_name}
                className="w-10 h-10 rounded object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center text-[var(--accent-primary)] font-bold tracking-wider rounded-full">
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 tracking-wide">{comment.author_name}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(comment.created_at), 'yyyy.MM.dd HH:mm', { locale: zhCN })}
              </p>
            </div>
          </div>
          <p className="text-gray-700 ml-13 leading-relaxed">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
