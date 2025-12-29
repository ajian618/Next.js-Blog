'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getAvatarUrl } from '@/lib/image-utils';
import { useRouter } from 'next/navigation';

interface Review {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  pending_name?: string;
  pending_avatar?: string;
  review_status: string;
  created_at: string;
}

export default function ProfileReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        // 调用管理员专用的获取待审核列表 API
        const listResponse = await fetch('/api/admin/profile-reviews/list');
        if (listResponse.ok) {
          const result = await listResponse.json();
          if (result.success && Array.isArray(result.data)) {
            setReviews(result.data);
          } else {
            setReviews([]);
          }
        }
      }
    } catch (error) {
      console.error('获取待审核列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (userId: number) => {
    setProcessing(userId);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('userId', userId.toString());

      const response = await fetch('/api/admin/profile-reviews/approve', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: '审核通过成功' });
        await fetchReviews(); // 刷新列表
      } else {
        setMessage({ type: 'error', text: result.error || '审核失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '审核失败' });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId: number) => {
    setProcessing(userId);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('userId', userId.toString());

      const response = await fetch('/api/admin/profile-reviews/reject', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: '已拒绝该审核请求' });
        await fetchReviews(); // 刷新列表
      } else {
        setMessage({ type: 'error', text: result.error || '拒绝失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '拒绝失败' });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">加载中...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">用户资料审核</h1>
        <p className="mt-2 text-gray-600">
          管理用户提交的用户名和头像修改请求
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            暂无待审核的资料修改请求
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900">{review.name}</span>
                      <span className="text-sm text-gray-500">{review.email}</span>
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        待审核
                      </span>
                    </div>
                    
                    {/* 待审核内容 */}
                    <div className="space-y-2 mt-3">
                      {review.pending_name && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">新用户名：</span>
                          <span className="text-gray-900">{review.pending_name}</span>
                          <span className="text-gray-500 ml-2">(当前: {review.name})</span>
                        </div>
                      )}
                      
                      {review.pending_avatar && (
                        <div className="flex items-center gap-4 mt-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">新头像：</span>
                            <a 
                              href={review.pending_avatar} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              查看原图
                            </a>
                          </div>
                          <img 
                            src={getAvatarUrl(review.pending_avatar || undefined, 100) || ''}
                            alt="新头像预览"
                            className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                          />
                          {review.avatar && (
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <span>当前:</span>
                              <img 
                                src={getAvatarUrl(review.avatar || undefined, 100) || ''}
                                alt="当前头像"
                                className="w-12 h-12 rounded-full object-cover border"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      提交时间：{new Date(review.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={processing === review.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                    >
                      {processing === review.id ? '处理中...' : '通过'}
                    </button>
                    
                    <button
                      onClick={() => handleReject(review.id)}
                      disabled={processing === review.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
                    >
                      {processing === review.id ? '处理中...' : '拒绝'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
