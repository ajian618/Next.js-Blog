'use client';

import { useEffect, useRef } from 'react';

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 尝试自动播放视频
    video.play().catch((error) => {
      console.log('视频自动播放被阻止，需要用户交互:', error);
    });
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      {/* 视频背景 */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
      >
        <source src="/assets/animations/background-home.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
