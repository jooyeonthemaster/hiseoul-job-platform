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
    console.log('프로필 이미지 업로드 API 호출됨');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    console.log('받은 데이터:', {
      file: file ? { name: file.name, size: file.size, type: file.type } : null,
      userId: userId
    });

    if (!file) {
      console.error('파일이 없습니다');
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    if (!userId) {
      console.error('사용자 ID가 없습니다');
      return NextResponse.json({ error: '사용자 ID가 없습니다.' }, { status: 400 });
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 });
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: '지원되지 않는 파일 형식입니다. JPG, PNG, WebP만 가능합니다.' 
      }, { status: 400 });
    }

    // 파일을 Buffer로 변환
    console.log('파일을 Buffer로 변환 중...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('Buffer 크기:', buffer.length);

    // Cloudinary 설정 확인
    console.log('Cloudinary 설정:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '설정됨' : '없음',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '설정됨' : '없음'
    });

    // Cloudinary에 업로드
    console.log('Cloudinary 업로드 시작...');
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: `hiseoul/profile-images/${userId}`,
          public_id: `profile_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary 업로드 에러:', error);
            reject(error);
          } else {
            console.log('Cloudinary 업로드 성공:', result?.secure_url);
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const result = uploadResult as any;
    
    console.log('최종 업로드 결과:', {
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
    
    return NextResponse.json({ 
      success: true, 
      imageUrl: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('프로필 이미지 업로드 오류:', error);
    return NextResponse.json({ 
      error: '이미지 업로드 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 