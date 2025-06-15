import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary 설정
console.log('Cloudinary 환경변수 체크:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***설정됨***' : '❌ 없음',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***설정됨***' : '❌ 없음'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'PDF 파일이 필요합니다.' }, { status: 400 });
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: '파일 크기는 10MB를 초과할 수 없습니다.' }, { status: 400 });
    }

    // PDF 파일 형식 검증
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'PDF 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('PDF 업로드 시작:', file.name);

    // PDF를 Cloudinary에 업로드
    const uniqueId = `pdf_${Date.now()}`;
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image', // image 타입으로 업로드 (PDF도 지원)
          folder: 'hiseoul-portfolios/pdfs',
          public_id: uniqueId,
          format: 'pdf',
          access_mode: 'public', // 공개 접근 허용
          flags: 'attachment' // 다운로드 허용
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const pdfResult = uploadResponse as any;
    console.log('PDF 업로드 완료:', pdfResult.secure_url);

    return NextResponse.json({
      success: true,
      url: pdfResult.secure_url,
      publicId: pdfResult.public_id,
      fileName: file.name
    });

  } catch (error) {
    console.error('PDF 업로드 및 변환 에러:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PDF 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 