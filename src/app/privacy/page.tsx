'use client';

import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ClockIcon,
  UserGroupIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  const sections = [
    {
      icon: ShieldCheckIcon,
      title: '개인정보 수집 및 이용 목적',
      content: [
        '회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지',
        '구인구직 서비스 제공: 포트폴리오 관리, 채용공고 추천, 매칭 서비스, 지원 및 채용 프로세스 관리',
        '고객 서비스 운영: 고객 문의 처리, 공지사항 전달, 불만처리 등 의사소통 경로 확보',
        '서비스 개선 및 마케팅: 신규 서비스 개발, 이벤트 및 광고성 정보 제공, 서비스 이용 통계 분석'
      ]
    },
    {
      icon: DocumentTextIcon,
      title: '수집하는 개인정보 항목',
      content: [
        '필수항목: 이름, 이메일 주소, 연락처, 생년월일, 성별',
        '선택항목: 학력, 경력, 기술 스택, 포트폴리오 정보, 희망 근무지역, 희망 연봉',
        '서비스 이용 과정에서 자동 수집: IP 주소, 쿠키, 방문일시, 서비스 이용 기록, 불량 이용 기록',
        '기업회원 추가 수집 항목: 사업자등록번호, 회사명, 회사주소, 담당자 정보'
      ]
    },
    {
      icon: ClockIcon,
      title: '개인정보의 보유 및 이용기간',
      content: [
        '회원탈퇴 시까지: 회원가입 정보, 서비스 이용 기록',
        '탈퇴 후 1년: 부정 이용 방지를 위한 최소한의 정보 (이메일, IP)',
        '관련 법령에 따른 보존: 전자상거래법, 통신비밀보호법 등에 따른 의무 보존 기간',
        '채용 관련 정보: 채용 프로세스 완료 후 1년간 보관 (분쟁 해결 목적)'
      ]
    },
    {
      icon: UserGroupIcon,
      title: '개인정보의 제3자 제공',
      content: [
        '원칙적으로 개인정보를 외부에 제공하지 않습니다',
        '구직자-기업 간 매칭 시에만 상호 동의 하에 제한적 정보 공유',
        '법령에 의한 요구가 있을 경우에만 관련 기관에 제공',
        '개인정보 처리 위탁 업체: 클라우드 서비스(AWS), 결제대행사 등 (별도 계약으로 보안 관리)'
      ]
    },
    {
      icon: LockClosedIcon,
      title: '개인정보 보호를 위한 기술적/관리적 조치',
      content: [
        '기술적 조치: 암호화 전송(SSL), 데이터베이스 암호화, 접근제한시스템, 백신프로그램 설치',
        '관리적 조치: 개인정보보호책임자 지정, 정기적 직원 교육, 접근권한 최소화',
        '물리적 조치: 전산실 출입통제, 개인정보 보관 장소 잠금장치',
        '정기적 보안 점검 및 취약점 개선'
      ]
    },
    {
      icon: ExclamationTriangleIcon,
      title: '정보주체의 권리와 행사 방법',
      content: [
        '개인정보 열람권: 처리 현황, 처리 목적 등에 대한 열람 요구',
        '정정·삭제권: 잘못된 정보의 수정이나 삭제 요구',
        '처리정지권: 개인정보 처리 중단 요구',
        '손해배상청구권: 개인정보 침해로 인한 손해배상 청구',
        '권리 행사 방법: 서면, 전화, 이메일을 통해 개인정보보호책임자에게 연락'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">HiSeoul</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/portfolios" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                포트폴리오
              </Link>
              <Link href="/companies" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                기업정보
              </Link>
              <Link href="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                채용공고
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                소개
              </Link>
              <span className="text-blue-600 font-semibold">
                개인정보처리방침
              </span>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-blue-700 font-medium text-sm mb-8">
            <ShieldCheckIcon className="w-4 h-4 mr-2" />
            개인정보 보호
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-8 text-gray-900 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">개인정보</span>
            처리방침
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            HiSeoul은 이용자의 개인정보를 소중히 여기며,<br />
            관련 법령에 따라 안전하게 보호하고 있습니다.
          </p>
          <div className="mt-8 text-sm text-gray-500">
            시행일자: 2024년 1월 1일 | 최종 수정일: 2024년 12월 15일
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">개인정보처리방침 개요</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              HiSeoul('https://hiseoul.com' 이하 'HiSeoul')은 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 
              개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 수립·공개합니다.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 shadow-lg">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                </div>
                
                <ul className="space-y-3 ml-16">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Report Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Privacy Officer */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">개인정보보호책임자</h3>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-gray-700">성명:</span>
                  <span className="ml-2 text-gray-600">김기홍</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">직책:</span>
                  <span className="ml-2 text-gray-600">대표</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">연락처:</span>
                  <span className="ml-2 text-gray-600">010-3721-0204</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">이메일:</span>
                  <a href="mailto:hiseoulnewjob@naver.com" className="ml-2 text-blue-600 hover:text-blue-700">
                    hiseoulnewjob@naver.com
                  </a>
                </div>
              </div>
            </div>

            {/* External Report */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">개인정보 침해 신고</h3>
              <div className="space-y-4">
                <div>
                  <div className="font-semibold text-gray-700">개인정보보호위원회</div>
                  <div className="text-gray-600">privacy.go.kr / 국번없이 182</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">개인정보 침해신고센터</div>
                  <div className="text-gray-600">privacy.kisa.or.kr / 국번없이 118</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">대검찰청 사이버수사과</div>
                  <div className="text-gray-600">spo.go.kr / (02) 3480-3571</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">경찰청 사이버안전국</div>
                  <div className="text-gray-600">cyberbureau.police.go.kr / 국번없이 182</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">중요 안내사항</h3>
            <div className="space-y-4 text-left">
              <p className="text-gray-700">
                • 본 개인정보처리방침은 2024년 1월 1일부터 적용됩니다.
              </p>
              <p className="text-gray-700">
                • 개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일 전부터 홈페이지의 '공지사항'을 통하여 고지할 것입니다.
              </p>
              <p className="text-gray-700">
                • 이전의 개인정보처리방침은 아래에서 확인하실 수 있습니다.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                개인정보 관련 문의하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold">HiSeoul</span>
          </Link>
          <p className="text-gray-400">
            &copy; 2024 HiSeoul Job Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 