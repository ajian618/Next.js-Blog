import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* 左侧：站点信息 */}
          <div className="text-center md:text-left">
            <h3 className="text-gray-900 font-semibold tracking-wide mb-4">天刀绝剑楼</h3>
            <p className="text-gray-600 text-sm leading-relaxed tracking-wide">
              记录生活中的点滴，分享折腾的快乐
            </p>
          </div>

          {/* 右侧：版权信息 */}
          <div className="mt-6 md:mt-0">
            <p className="text-gray-600 text-sm tracking-wide">
              Copyright © 2026 天刀绝剑楼.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
