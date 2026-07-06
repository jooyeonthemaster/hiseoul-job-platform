import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// SendGrid API 키 설정
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// 근무 형태 한국어 변환
const getWorkTypeKorean = (workType: string) => {
  const workTypeMap: { [key: string]: string } = {
    'fulltime': '정규직',
    'parttime': '계약직', 
    'contract': '파트타임',
    'intern': '인턴'
  };
  return workTypeMap[workType] || workType;
};

// 이메일 템플릿 생성 함수
const createEmailTemplate = (data: any) => {
  const {
    jobSeekerName,
    companyName,
    proposedPosition,
    jobCategory,
    proposedSalary,
    workType,
    workingHours,
    benefits,
    message,
    recruiterName,
    recruiterPosition,
    recruiterPhone,
    recruiterEmail,
    companyInfo
  } = data;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>채용 제안서 - ${companyName}</title>
    <style>
        body {
            font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 30px;
            color: #1f2937;
        }
        .section {
            margin-bottom: 35px;
            border-left: 4px solid #3b82f6;
            padding-left: 20px;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .section-title::before {
            content: '';
            width: 8px;
            height: 8px;
            background-color: #3b82f6;
            border-radius: 50%;
            margin-right: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .info-label {
            font-weight: bold;
            color: #475569;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .info-value {
            color: #1f2937;
            font-size: 16px;
        }
        .benefits-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        .benefit-tag {
            background-color: #dbeafe;
            color: #1e40af;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        .message-box {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
            font-size: 16px;
            line-height: 1.7;
            white-space: pre-line;
        }
        .contact-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
        }
        .contact-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .contact-avatar {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 20px;
            margin-right: 15px;
        }
        .contact-info h3 {
            margin: 0;
            color: #1f2937;
            font-size: 18px;
        }
        .contact-info p {
            margin: 5px 0 0 0;
            color: #6b7280;
        }
        .contact-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 12px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 10px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;
        }
        .footer {
            background-color: #1f2937;
            color: #9ca3af;
            padding: 30px;
            text-align: center;
        }
        .footer-logo {
            color: white;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .divider {
            height: 2px;
            background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
            margin: 30px 0;
            border-radius: 1px;
        }
        @media (max-width: 600px) {
            .content { padding: 20px; }
            .info-grid { grid-template-columns: 1fr; }
            .contact-details { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- 헤더 -->
        <div class="header">
            <h1>🎉 채용 제안이 도착했습니다!</h1>
            <p>면접심사 매칭 플랫폼</p>
        </div>

        <!-- 메인 콘텐츠 -->
        <div class="content">
            <div class="greeting">
                안녕하세요, <strong>${jobSeekerName}</strong>님!<br>
                <strong>${companyName}</strong>에서 ${jobSeekerName}님의 포트폴리오를 보고 채용 제안을 드립니다.
            </div>

            <div class="divider"></div>

            <!-- 채용 정보 섹션 -->
            <div class="section">
                <div class="section-title">💼 채용 정보</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">제안 포지션</div>
                        <div class="info-value">${proposedPosition || '미지정'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">직무 내용</div>
                        <div class="info-value">${jobCategory || '미지정'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">예상 급여</div>
                        <div class="info-value">${proposedSalary || '협의 후 결정'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">근무 형태</div>
                        <div class="info-value">${getWorkTypeKorean(workType) || '미지정'}</div>
                    </div>
                    ${workingHours ? `
                    <div class="info-item">
                        <div class="info-label">근무 시간</div>
                        <div class="info-value">${workingHours}</div>
                    </div>
                    ` : ''}
                </div>
                
                ${benefits && benefits.length > 0 ? `
                <div class="info-label">복리후생</div>
                <div class="benefits-list">
                    ${benefits.map((benefit: string) => `<span class="benefit-tag">${benefit}</span>`).join('')}
                </div>
                ` : ''}
            </div>

            <!-- 기업 정보 섹션 -->
            <div class="section">
                <div class="section-title">🏢 기업 정보</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">기업명</div>
                        <div class="info-value">${companyName}</div>
                    </div>
                    ${companyInfo?.ceoName ? `
                    <div class="info-item">
                        <div class="info-label">대표</div>
                        <div class="info-value">${companyInfo.ceoName}</div>
                    </div>
                    ` : ''}
                    ${companyInfo?.industry ? `
                    <div class="info-item">
                        <div class="info-label">업종</div>
                        <div class="info-value">${companyInfo.industry}</div>
                    </div>
                    ` : ''}
                    ${companyInfo?.location ? `
                    <div class="info-item">
                        <div class="info-label">위치</div>
                        <div class="info-value">${companyInfo.location}</div>
                    </div>
                    ` : ''}
                </div>
                
                ${companyInfo?.description ? `
                <div class="info-item" style="margin-top: 15px;">
                    <div class="info-label">회사소개</div>
                    <div class="info-value">${companyInfo.description}</div>
                </div>
                ` : ''}
            </div>

            <!-- 채용 담당자 메시지 -->
            ${message ? `
            <div class="section">
                <div class="section-title">📋 채용 담당자 메시지</div>
                <div class="message-box">${message}</div>
            </div>
            ` : ''}

            <!-- 담당자 연락처 -->
            <div class="section">
                <div class="section-title">📞 담당자 연락처</div>
                <div class="contact-card">
                    <div class="contact-header">
                        <div class="contact-avatar">${recruiterName ? recruiterName.charAt(0) : 'H'}</div>
                        <div class="contact-info">
                            <h3>${recruiterName || '채용 담당자'} ${recruiterPosition ? recruiterPosition : ''}</h3>
                            <p>${companyName} 채용 담당자</p>
                        </div>
                    </div>
                    <div class="contact-details">
                        ${recruiterPhone ? `
                        <div class="info-item">
                            <div class="info-label">연락처</div>
                            <div class="info-value">${recruiterPhone}</div>
                        </div>
                        ` : ''}
                        ${recruiterEmail ? `
                        <div class="info-item">
                            <div class="info-label">이메일</div>
                            <div class="info-value">${recruiterEmail}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- CTA 섹션 -->
            <div class="cta-section">
                <h3 style="color: #1f2937; margin-bottom: 15px;">관심이 있으시다면 언제든 연락주세요!</h3>
                <p style="color: #6b7280; margin-bottom: 25px;">
                    위 연락처로 직접 연락하시거나, 면접심사 매칭 플랫폼을 통해 응답해주세요.
                </p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://techventure-job-matching.vercel.app'}" class="cta-button">
                    면접심사 매칭 플랫폼에서 응답하기
                </a>
            </div>
        </div>

        <!-- 푸터 -->
        <div class="footer">
            <div class="footer-logo">면접심사 매칭 플랫폼</div>
            <p>이 이메일은 면접심사 매칭 플랫폼 자동 알림 시스템에서 발송되었습니다.</p>
            <p style="font-size: 12px; margin-top: 15px;">
                시간: ${new Date().toLocaleString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'Asia/Seoul'
                })}
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received email request:', body);

    const {
      to,
      cc,
      subject,
      jobSeekerName,
      companyName,
      proposedPosition,
      jobCategory,
      proposedSalary,
      workType,
      workingHours,
      benefits,
      message,
      recruiterName,
      recruiterPosition,
      recruiterPhone,
      recruiterEmail,
      companyInfo
    } = body;

    // 이메일 제목 생성
    const emailSubject = subject || `[면접심사 매칭 플랫폼] ${companyName}에서 ${jobSeekerName}님께 채용 제안을 드립니다`;

    // HTML 이메일 템플릿 생성
    const htmlContent = createEmailTemplate({
      jobSeekerName,
      companyName,
      proposedPosition,
      jobCategory,
      proposedSalary,
      workType,
      workingHours,
      benefits,
      message,
      recruiterName,
      recruiterPosition,
      recruiterPhone,
      recruiterEmail,
      companyInfo
    });

    // 텍스트 버전 (HTML을 지원하지 않는 이메일 클라이언트용)
    const textContent = `
채용 제안이 도착했습니다!

안녕하세요, ${jobSeekerName}님!
${companyName}에서 ${jobSeekerName}님의 포트폴리오를 보고 채용 제안을 드립니다.

💼 채용 정보
- 제안 포지션: ${proposedPosition || '미지정'}
- 직무 내용: ${jobCategory || '미지정'}
- 예상 급여: ${proposedSalary || '협의 후 결정'}
- 근무 형태: ${getWorkTypeKorean(workType) || '미지정'}
${workingHours ? `- 근무 시간: ${workingHours}` : ''}
${benefits && benefits.length > 0 ? `- 복리후생: ${benefits.join(', ')}` : ''}

🏢 기업 정보
- 기업명: ${companyName}
${companyInfo?.ceoName ? `- 대표: ${companyInfo.ceoName}` : ''}
${companyInfo?.industry ? `- 업종: ${companyInfo.industry}` : ''}
${companyInfo?.location ? `- 위치: ${companyInfo.location}` : ''}
${companyInfo?.description ? `- 회사소개: ${companyInfo.description}` : ''}

${message ? `📋 채용 담당자 메시지\n${message}\n` : ''}

📞 담당자 연락처
- 담당자: ${recruiterName || '채용 담당자'} ${recruiterPosition || ''}
${recruiterPhone ? `- 연락처: ${recruiterPhone}` : ''}
${recruiterEmail ? `- 이메일: ${recruiterEmail}` : ''}

관심이 있으시다면 언제든 연락주세요!

--
이 이메일은 면접심사 매칭 플랫폼 자동 알림 시스템에서 발송되었습니다.
시간: ${new Date().toLocaleString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Seoul'
    })}
    `;

    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('=== 개발 모드: 이메일 내용 ===');
      console.log('To:', to);
      console.log('CC:', cc);
      console.log('Subject:', emailSubject);
      console.log('HTML Content:', htmlContent);
      console.log('================================');
      
      return NextResponse.json({ 
        success: true, 
        message: '개발 모드에서 이메일이 콘솔에 출력되었습니다.',
        emailData: {
          to,
          cc,
          subject: emailSubject,
          htmlPreview: htmlContent.substring(0, 500) + '...'
        }
      });
    }

    // 프로덕션 환경에서는 실제 이메일 발송
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is not configured');
    }

    const msg = {
      to: to,
      cc: cc || 'nadr.jooyeon@gmail.com, tvs@techventure.co.kr',
      from: 'noreply@hiseoul.com',
      subject: emailSubject,
      text: textContent,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log('Email sent successfully');

    return NextResponse.json({ 
      success: true, 
      message: '이메일이 성공적으로 발송되었습니다.' 
    });

  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '이메일 발송에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}