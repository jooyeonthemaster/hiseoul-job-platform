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
    const { pdfUrl, fileName } = await request.json();

    if (!pdfUrl) {
      return NextResponse.json({ error: 'PDF URL이 필요합니다.' }, { status: 400 });
    }

    // Cloudinary의 PDF 변환 기능을 사용
    // format을 jpg로 변환하고, page를 지정
    const pages = [];
    const maxPages = 20;
    
    // PDF URL에서 public_id 추출
    let publicId = '';
    
    // Cloudinary URL 패턴 분석
    const urlMatch = pdfUrl.match(/\/upload\/v\d+\/(.+)\.pdf$/);
    if (urlMatch) {
      publicId = urlMatch[1];
    } else {
      // 다른 패턴 시도
      const parts = pdfUrl.split('/upload/');
      if (parts.length === 2) {
        const pathParts = parts[1].split('/');
        if (pathParts.length > 1) {
          publicId = pathParts.slice(1).join('/').replace('.pdf', '');
        }
      }
    }

    if (!publicId) {
      return NextResponse.json({ 
        error: 'Cloudinary URL에서 public ID를 추출할 수 없습니다.' 
      }, { status: 400 });
    }

    console.log('Extracted publicId:', publicId);

    // 각 페이지를 이미지로 변환
    for (let i = 0; i < maxPages; i++) {
      try {
        // Cloudinary transformation URL 생성
        const imageUrl = cloudinary.url(publicId, {
          resource_type: 'image',
          format: 'jpg',
          page: i + 1,
          width: 1200,
          quality: 'auto',
          flags: 'progressive',
        });

        const thumbnailUrl = cloudinary.url(publicId, {
          resource_type: 'image', 
          format: 'jpg',
          page: i + 1,
          width: 300,
          quality: 'auto',
          flags: 'progressive',
        });

        // 첫 페이지는 항상 추가
        if (i === 0) {
          pages.push({
            pageNumber: i + 1,
            url: imageUrl,
            thumbnailUrl: thumbnailUrl
          });
        } else {
          // 이후 페이지는 존재 여부 확인
          const checkUrl = cloudinary.url(publicId, {
            resource_type: 'image',
            format: 'jpg', 
            page: i + 1,
            width: 1,
            quality: 1,
          });

          const response = await fetch(checkUrl, { method: 'HEAD' });
          if (response.ok) {
            pages.push({
              pageNumber: i + 1,
              url: imageUrl,
              thumbnailUrl: thumbnailUrl
            });
          } else {
            break;
          }
        }
      } catch (error) {
        // 페이지가 없으면 중단
        if (i === 0) {
          console.error('첫 페이지 변환 실패:', error);
        }
        break;
      }
    }

    if (pages.length === 0) {
      return NextResponse.json({ 
        error: 'PDF에서 이미지를 추출할 수 없습니다. PDF 파일이 올바르게 업로드되었는지 확인해주세요.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      fileName,
      pageCount: pages.length,
      pages
    });

  } catch (error) {
    console.error('PDF 변환 에러:', error);
    return NextResponse.json(
      { error: 'PDF 변환 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}