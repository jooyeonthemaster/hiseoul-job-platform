import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// SendGrid 설정
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// 실제 프로덕션에서는 SendGrid, AWS SES, Nodemailer 등을 사용해야 합니다
// 여기서는 구조만 보여드립니다

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      to, 
      cc, 
      subject, 
      type,
      jobSeekerName,
      companyName,
      position,
      salary,
      message,
      recruiterInfo,
      companyInfo,
      action
    } = body;

    let emailHtml = '';

    // 이메일 타입에 따른 템플릿 선택
    if (type === 'inquiry') {
      // 채용 제안 이메일
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${subject}</title>
          <style>
            body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
            .header { background: linear-gradient(135deg, #3B82F6, #6366F1); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .content { background-color: white; padding: 30px; margin: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .info-box { background-color: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3B82F6; }
            .info-box h3 { margin-top: 0; color: #3B82F6; font-size: 18px; }
            .highlight { background-color: #eff6ff; padding: 15px; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #3B82F6, #6366F1); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 채용 제안이 도착했습니다!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">HiSeoul 채용 플랫폼</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937;">안녕하세요, ${jobSeekerName}님!</h2>
              <p style="font-size: 16px; margin-bottom: 20px;"><strong>${companyName}</strong>에서 ${jobSeekerName}님의 포트폴리오를 보고 채용 제안을 드립니다.</p>
              
              <div class="info-box">
                <h3>💼 채용 정보</h3>
                <div class="highlight">
                  <p><strong>제안 포지션:</strong> ${position}</p>
                  <p><strong>예상 급여:</strong> ${salary}</p>
                </div>
              </div>
              
              <div class="info-box">
                <h3>🏢 기업 정보</h3>
                <p><strong>기업명:</strong> ${companyInfo?.name || companyName}</p>
                <p><strong>대표:</strong> ${companyInfo?.ceoName || '-'}</p>
                <p><strong>업종:</strong> ${companyInfo?.industry || '-'}</p>
                <p><strong>위치:</strong> ${companyInfo?.location || '-'}</p>
                ${companyInfo?.description ? `<p><strong>회사소개:</strong> ${companyInfo.description}</p>` : ''}
              </div>
              
              <div class="info-box">
                <h3>📋 채용 담당자 메시지</h3>
                <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div class="info-box">
                <h3>📞 담당자 연락처</h3>
                <p><strong>담당자:</strong> ${recruiterInfo?.name || '-'} ${recruiterInfo?.position || ''}</p>
                <p><strong>연락처:</strong> ${recruiterInfo?.phone || '-'}</p>
                <p><strong>이메일:</strong> ${recruiterInfo?.email || '-'}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 16px; margin-bottom: 20px;">이 제안에 대해 어떻게 생각하시나요?</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile" class="cta-button">HiSeoul에서 응답하기</a>
              </div>
            </div>
            
            <div class="footer">
              <p>본 메일은 HiSeoul Job Platform을 통해 발송되었습니다.</p>
              <p>채용 제안에 대한 응답은 플랫폼에서 직접 하실 수 있습니다.</p>
              <p style="margin-top: 15px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="color: #3B82F6; text-decoration: none;">🔗 HiSeoul 바로가기</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === 'response') {
      // 응답 알림 이메일 (기업에게)
      const actionText = action === 'accepted' ? '수락' : '거절';
      const actionColor = action === 'accepted' ? '#10b981' : '#ef4444';
      
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${subject}</title>
          <style>
            body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
            .header { background: linear-gradient(135deg, #3B82F6, #6366F1); color: white; padding: 30px; text-align: center; }
            .content { background-color: white; padding: 30px; margin: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: white; background-color: ${actionColor}; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 채용 제안 응답 알림</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">HiSeoul 채용 플랫폼</p>
            </div>
            
            <div class="content">
              <h2>채용 제안에 대한 응답이 도착했습니다</h2>
              
              <div style="text-align: center; margin: 20px 0;">
                <span class="status-badge">${actionText}됨</span>
              </div>
              
              <p><strong>${jobSeekerName}</strong>님이 <strong>${companyName}</strong>의 <strong>${position}</strong> 포지션 채용 제안을 <strong>${actionText}</strong>했습니다.</p>
              
              ${action === 'accepted' ? 
                '<p style="color: #10b981; font-weight: bold;">🎉 축하합니다! 구직자가 제안을 수락했습니다. 담당자에게 직접 연락하여 다음 단계를 진행하세요.</p>' :
                '<p style="color: #6b7280;">구직자가 이번 제안을 거절했습니다. 다른 우수한 인재들을 확인해보세요.</p>'
              }
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employer-dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #6366F1); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  대시보드에서 확인하기
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>본 메일은 HiSeoul Job Platform을 통해 발송되었습니다.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // 실제 이메일 발송
    if (process.env.SENDGRID_API_KEY && process.env.DEV_MODE !== 'true') {
      // 프로덕션 환경에서 실제 SendGrid로 발송
      const msg = {
        to: to,
        cc: cc,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@hiseoul.com',
        subject: subject,
        html: emailHtml
      };

      await sgMail.send(msg);
      console.log('Email sent successfully via SendGrid');
    } else {
      // 개발 환경에서는 콘솔에 출력
      console.log('=== EMAIL PREVIEW (DEV MODE) ===');
      console.log('To:', to);
      console.log('CC:', cc);
      console.log('Subject:', subject);
      console.log('HTML Content:', emailHtml);
      console.log('================================');
    }

    return NextResponse.json({ 
      success: true, 
      message: '이메일이 성공적으로 발송되었습니다.',
      dev_mode: process.env.DEV_MODE === 'true'
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '이메일 발송 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}