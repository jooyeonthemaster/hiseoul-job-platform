import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary 설정
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

    // Cloudinary에 업로드
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw', // PDF는 raw 타입으로 업로드
          folder: 'hiseoul-portfolios/pdfs',
          public_id: `pdf_${Date.now()}`,
          format: 'pdf'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: (uploadResponse as any).secure_url,
      publicId: (uploadResponse as any).public_id
    });

  } catch (error) {
    console.error('PDF 업로드 에러:', error);
    return NextResponse.json(
      { error: 'PDF 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 