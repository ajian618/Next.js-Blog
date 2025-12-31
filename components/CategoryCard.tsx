'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function CategoryCard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('获取分类失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <aside className="card-technical p-6">
      <h3 className="text-gray-900 font-semibold tracking-wide mb-5 flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        分类目录
      </h3>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-100 border border-gray-200 animate-pulse rounded" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-gray-500 text-sm tracking-wide">暂无分类</p>
      ) : (
        <ul className="space-y-1.5">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categories/${category.id}`}
                className="flex items-center justify-between px-3 py-2 text-gray-700 text-sm hover:text-[var(--accent-primary)] hover:bg-gray-50 transition-colors border-l-2 border-transparent hover:border-[var(--accent-primary)] tracking-wide"
              >
                <span>{category.name}</span>
                <span className="text-xs text-gray-500">
                  {category.description || ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
