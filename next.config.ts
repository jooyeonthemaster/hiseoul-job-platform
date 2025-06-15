import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // PDF.js worker 파일을 정적 자산으로 복사
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
  // PDF.js 관련 정적 파일 처리
  async headers() {
    return [
      {
        source: '/pdf.worker.min.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
