'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAvatarUrl } from '@/lib/image-utils';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  created_at: string;
  pending_name?: string;
  pending_avatar?: string;
  review_status?: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // 跟踪新上传的头像 URL（用于取消时删除）
  const [newUploadedAvatarUrl, setNewUploadedAvatarUrl] = useState<string>('');
  // 跟踪是否有未保存的修改
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const result = await response.json();
      
      if (response.ok && result.success) {
        const profileData = result.data;
        setProfile(profileData);
        setFormData({
          name: profileData.name,
          bio: profileData.bio || '',
          avatar: profileData.avatar || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        // 更新 session 中的头像信息（通过重新登录触发 session 更新）
        if (session && profileData.avatar !== session.user.avatar) {
          await signIn('credentials', { 
            redirect: false,
            email: session.user.email,
          });
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setMessage({ type: 'error', text: '请选择要上传的图片文件' });
      return;
    }

    if (avatarFile.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: '文件大小不能超过2MB' });
      return;
    }

    if (!avatarFile.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '请选择图片文件' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('file', avatarFile);
      formData.append('type', 'avatar');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFormData(prev => ({ ...prev, avatar: result.url }));
        setNewUploadedAvatarUrl(result.url);
        setMessage({ type: 'success', text: '头像上传成功！' });
        setAvatarFile(null);
        setHasUnsavedChanges(true);
      } else {
        setMessage({ type: 'error', text: result.error || '上传失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '上传失败，请稍后重试' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!profile) return;

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: '两次输入的密码不一致' });
        return;
      }
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: '请输入当前密码' });
        return;
      }
    }

    try {
      if (formData.newPassword) {
        const passwordResponse = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        });

        if (!passwordResponse.ok) {
          const data = await passwordResponse.json();
          setMessage({ type: 'error', text: data.error || '密码修改失败' });
          return;
        }
      }

      const hasNameChange = formData.name !== profile.name;
      const hasAvatarChange = formData.avatar !== profile.avatar;
      const hasBioChange = formData.bio !== profile.bio;

      const isAdmin = profile.role === 'admin';

      if (hasNameChange || hasAvatarChange || hasBioChange) {
        if (isAdmin) {
          const updateData: any = {};
          if (hasNameChange) updateData.name = formData.name;
          if (hasAvatarChange) updateData.avatar = formData.avatar;
          if (hasBioChange) updateData.bio = formData.bio;

          const updateResponse = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });

          if (updateResponse.ok) {
            setMessage({ type: 'success', text: '资料更新成功！' });
            setEditing(false);
            setHasUnsavedChanges(false);
            setNewUploadedAvatarUrl('');
            if (session && formData.avatar !== session.user.avatar) {
              await signIn('credentials', { 
                redirect: false,
                email: session.user.email,
              });
            }
            fetchProfile();
          } else {
            const data = await updateResponse.json();
            setMessage({ type: 'error', text: data.error || '更新失败' });
          }
        } else {
          const reviewData: any = {};
          if (hasNameChange) reviewData.name = formData.name;
          if (hasAvatarChange) reviewData.avatar = formData.avatar;

          const reviewResponse = await fetch('/api/user/profile/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData),
          });

          const result = await reviewResponse.json();

          if (reviewResponse.ok) {
            setMessage({ type: 'success', text: '资料修改已提交审核，管理员通过后生效' });
            setEditing(false);
            setHasUnsavedChanges(false);
            setNewUploadedAvatarUrl('');
            fetchProfile();
          } else {
            setMessage({ type: 'error', text: result.error || '提交审核失败' });
          }
        }
      } else {
        setEditing(false);
      }

      // 清空密码字段
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: '更新失败，请稍后重试' });
    }
  };

  const deleteUnsavedAvatar = useCallback(async () => {
    if (newUploadedAvatarUrl) {
      try {
        await fetch('/api/delete-image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: newUploadedAvatarUrl }),
        });
        console.log('已删除未保存的头像:', newUploadedAvatarUrl);
      } catch (error) {
        console.error('删除未保存的头像失败:', error);
      }
      setNewUploadedAvatarUrl('');
    }
  }, [newUploadedAvatarUrl]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('您有未保存的修改，确定要放弃吗？新上传的头像将被删除。')) {
        deleteUnsavedAvatar();
        setEditing(false);
        setMessage({ type: '', text: '' });
        if (profile) {
          setFormData({
            name: profile.name,
            bio: profile.bio || '',
            avatar: profile.avatar || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }
        setHasUnsavedChanges(false);
      }
    } else {
      setEditing(false);
      setMessage({ type: '', text: '' });
    }
  };

  useEffect(() => {
    return () => {
      if (editing && newUploadedAvatarUrl && hasUnsavedChanges) {
        deleteUnsavedAvatar();
      }
    };
  }, [editing, newUploadedAvatarUrl, hasUnsavedChanges, deleteUnsavedAvatar]);

  useEffect(() => {
    if (profile) {
      const nameChanged = formData.name !== profile.name;
      const bioChanged = formData.bio !== profile.bio;
      const avatarChanged = formData.avatar !== profile.avatar;
      const passwordChanged = formData.newPassword !== '';
      
      if (nameChanged || bioChanged || avatarChanged || passwordChanged) {
        setHasUnsavedChanges(true);
      } else {
        setHasUnsavedChanges(false);
      }
    }
  }, [formData.name, formData.bio, formData.avatar, formData.newPassword, profile]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {profile.review_status === 'pending' && profile.pending_avatar ? (
                  <div className="relative">
                    <img 
                      src={getAvatarUrl(profile.pending_avatar, 80) || undefined} 
                      alt="待审核头像"
                      className="w-20 h-20 rounded-full object-cover border-2 border-yellow-400"
                    />
                    <span className="absolute bottom-0 right-0 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full border-2 border-white">
                      待审核
                    </span>
                  </div>
                ) : profile.avatar ? (
                  <img 
                    src={getAvatarUrl(profile.avatar, 80) || undefined} 
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profile.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {profile.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                    <span className="text-sm text-gray-500">
                      注册于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  编辑资料
                </button>
              )}
            </div>
            {profile.bio && !editing && (
              <p className="mt-4 text-gray-700">{profile.bio}</p>
            )}
            
            {profile.review_status === 'pending' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>审核中：</strong>您的资料修改正在等待管理员审核，通过后将自动更新。
                </p>
                {profile.pending_name && (
                  <p className="text-xs text-yellow-700 mt-1">
                    待审核用户名：{profile.pending_name}
                  </p>
                )}
                {profile.pending_avatar && (
                  <p className="text-xs text-yellow-700 mt-1">
                    待审核头像已上传
                  </p>
                )}
              </div>
            )}

            {profile.review_status === 'rejected' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>审核未通过：</strong>{profile.review_notes || '资料修改被拒绝'}
                </p>
              </div>
            )}
          </div>

          {profile.role === 'admin' && (
            <div className="px-6 py-4 bg-purple-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-purple-900 mb-3">管理员功能</h3>
              <div className="flex gap-3">
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  进入后台管理
                </Link>
                <Link
                  href="/admin/posts"
                  className="px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 text-sm"
                >
                  文章管理
                </Link>
                <Link
                  href="/admin/comments"
                  className="px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 text-sm"
                >
                  评论管理
                </Link>
              </div>
            </div>
          )}

          {editing && (
            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {message.text && (
                  <div className={`p-3 rounded-md text-sm ${
                    message.type === 'error' 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-green-50 text-green-600'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="介绍一下自己..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">头像上传</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAvatarUpload}
                      disabled={!avatarFile || uploading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {uploading ? '上传中...' : '上传'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    支持 JPG, PNG, GIF 格式，文件大小不超过 2MB
                  </p>
                  {formData.avatar && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">当前头像：</p>
                      <img 
                        src={getAvatarUrl(formData.avatar, 100) || undefined}
                        alt="当前头像"
                        className="w-16 h-16 rounded-full object-cover border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">修改密码</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                      <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    保存修改
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
