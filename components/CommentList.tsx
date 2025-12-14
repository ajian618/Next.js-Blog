import { Comment } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无评论
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {comment.author_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{comment.author_name}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(comment.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
              </p>
            </div>
          </div>
          <p className="text-gray-700 ml-13">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
