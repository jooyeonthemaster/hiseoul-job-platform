import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 브라우저에서 Cloudinary 로 PDF 를 직접 업로드하기 위한 서명 발급.
// 이유: 서버 라우트(/api/upload-pdf)는 Vercel 서버리스 요청 본문 한도(~4.5MB)에 걸려
//       대용량 PDF 업로드가 실패한다. 서명 업로드로 브라우저 → Cloudinary 직행하여 이 한도를 우회한다.
// PDF 뷰어(/api/convert-pdf-to-images)가 image 리소스의 페이지 변환을 사용하므로 resource_type=image 로 올린다.
export async function POST(_request: NextRequest) {
  try {
    if (
      !process.env.CLOUDINARY_API_SECRET ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_CLOUD_NAME
    ) {
      return NextResponse.json({ error: 'Cloudinary 설정이 누락되었습니다.' }, { status: 500 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const randomId = Math.random().toString(36).slice(2, 11);
    // 폴더 경로를 public_id 에 포함해 기존 /api/upload-pdf 와 동일한 URL 구조를 유지한다.
    // (secure_url 이 .../hiseoul-portfolios/pdfs/xxx.pdf 로 끝나야 convert-pdf-to-images 의 정규식이 통과)
    const publicId = `hiseoul-portfolios/pdfs/pdf_${timestamp}_${randomId}`;

    // Cloudinary SDK 로 서명 생성. 서명 대상 파라미터는 클라이언트가 그대로 전송해야 서명이 일치한다.
    const paramsToSign = { public_id: publicId, timestamp };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      success: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      publicId,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    });
  } catch (error) {
    console.error('PDF 업로드 서명 생성 오류:', error);
    return NextResponse.json({ error: 'PDF 업로드 준비에 실패했습니다.' }, { status: 500 });
  }
}
