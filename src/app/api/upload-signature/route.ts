import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 개선된 서명 생성 함수
function generateSignature(params: Record<string, any>, apiSecret: string): string {
  // 1. API secret 제외하고 파라미터 정렬 (Cloudinary 공식 방식)
  const sortedParams = Object.keys(params)
    .filter(key => key !== 'api_key' && key !== 'resource_type') // resource_type도 서명에서 제외
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // 2. resource_type을 추가 (서명에는 포함하지 않지만 업로드 시 필요)
  const signString = sortedParams;
  
  // 3. HMAC SHA1으로 서명 생성
  const signature = crypto.createHmac('sha1', apiSecret).update(signString).digest('hex');
  
  console.log('개선된 서명 생성 과정:');
  console.log('- 서명용 문자열:', signString);
  console.log('- API Secret 길이:', apiSecret.length);
  console.log('- 생성된 서명:', signature);
  
  return signature;
}

export async function POST(request: NextRequest) {
  try {
    // 환경변수 확인
    console.log('클라우디너리 환경변수 체크:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***설정됨***' : '❌ 없음',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***설정됨***' : '❌ 없음',
      api_secret_length: process.env.CLOUDINARY_API_SECRET?.length || 0,
      api_secret_first_chars: process.env.CLOUDINARY_API_SECRET?.substring(0, 5) || 'NONE'
    });

    const requestBody = await request.json();
    console.log('받은 요청 데이터:', requestBody);
    
    const { fileName, fileType } = requestBody;

    if (!fileName || !fileType) {
      console.error('파일 정보 누락:', { fileName, fileType });
      return NextResponse.json({ 
        error: '파일명과 파일 타입이 필요합니다.' 
      }, { status: 400 });
    }

    console.log('파일 정보 확인됨:', { fileName, fileType });

    // 파일 확장자 추출
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    
    // 지원되는 문서 파일 형식 확인
    const allowedExtensions = [
      'pdf', 'doc', 'docx', 'hwp', 'txt', 'rtf',
      'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar'
    ];

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ 
        error: '지원되지 않는 파일 형식입니다.' 
      }, { status: 400 });
    }

    // 더 안전한 public_id 생성 (한글 파일명 완전 제거)
    const timestamp = Math.round(new Date().getTime() / 1000);
    const randomId = Math.random().toString(36).substr(2, 9);
    const publicId = `documents/${timestamp}_${randomId}.${fileExtension}`;
    console.log('최종 public_id:', publicId);
    console.log('원본 파일명:', fileName);

    // 서명을 위한 파라미터 (필수 파라미터만)
    const signatureParams = {
      public_id: publicId,
      timestamp: timestamp
    };

    // 서명 생성
    console.log('서명 생성용 파라미터:', signatureParams);
    const signature = generateSignature(signatureParams, process.env.CLOUDINARY_API_SECRET!);

    // 클라이언트에서 업로드할 때 필요한 정보 반환
    const uploadData = {
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      public_id: publicId,
      resource_type: 'raw', // 이건 서명에 포함하지 않지만 업로드 시 필요
      // 업로드 URL
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload`
    };

    return NextResponse.json({
      success: true,
      uploadData,
      publicId,
      originalFileName: fileName  // 원본 파일명도 함께 전달
    });

  } catch (error) {
    console.error('서명 생성 오류:', error);
    return NextResponse.json({ 
      error: '서명 생성 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 