'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  QuestionMarkCircleIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  CogIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<'jobseeker' | 'employer' | 'general'>('jobseeker');
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const categories = [
    {
      id: 'jobseeker' as const,
      title: '구직자',
      icon: UserIcon,
      count: 8
    },
    {
      id: 'employer' as const,
      title: '기업',
      icon: BuildingOfficeIcon,
      count: 8
    },
    {
      id: 'general' as const,
      title: '일반',
      icon: CogIcon,
      count: 8
    }
  ];

  const faqs = {
    jobseeker: [
      {
        question: '테크벤처 잡 매칭에 회원가입하려면 어떻게 해야 하나요?',
        answer: '메인 페이지 우상단의 "시작하기" 버튼을 클릭하거나 /auth 페이지에서 이메일 또는 구글 소셜 로그인으로 간편하게 가입할 수 있습니다.'
      },
      {
        question: '포트폴리오는 어떻게 작성하나요?',
        answer: '로그인 후 "포트폴리오 작성하기" 메뉴에서 프로젝트별로 상세한 설명, 사용 기술, 성과 등을 입력할 수 있습니다. AI가 최적화 제안도 제공합니다.'
      },
      {
        question: '채용공고는 어떻게 찾나요?',
        answer: '작성하신 포트폴리오를 기반으로 맞춤형 채용공고가 자동으로 추천됩니다. "채용공고" 메뉴에서 직접 검색도 가능합니다.'
      },
      {
        question: '지원은 어떻게 하나요?',
        answer: '관심 있는 채용공고에서 "지원하기" 버튼을 클릭하면 포트폴리오가 자동으로 연동되어 원클릭으로 지원할 수 있습니다.'
      },
      {
        question: '면접 일정은 어떻게 관리되나요?',
        answer: '지원 후 기업에서 면접 제안을 하면 플랫폼 내에서 자동으로 일정이 관리되며, 알림을 통해 확인할 수 있습니다.'
      },
      {
        question: '포트폴리오 작성 시 주의사항이 있나요?',
        answer: '실제 경험과 성과를 바탕으로 작성해주세요. 프로젝트별로 구체적인 역할, 사용 기술, 결과물을 상세히 기술하는 것이 좋습니다.'
      },
      {
        question: '서비스 이용료가 있나요?',
        answer: '구직자는 모든 서비스를 무료로 이용할 수 있습니다. 포트폴리오 작성, 채용공고 검색, 지원 등 모든 기능이 무료입니다.'
      },
      {
        question: '개인정보는 어떻게 보호되나요?',
        answer: '개인정보보호법에 따라 안전하게 관리되며, 본인 동의 없이 제3자에게 제공되지 않습니다. 언제든 수정·삭제 요청이 가능합니다.'
      }
    ],
    employer: [
      {
        question: '테크벤처 잡 매칭 기업 회원가입 조건이 있나요?',
        answer: '서울시 소재 중소기업으로 테크벤처 잡 매칭 인증을 받은 기업이 가입 가능합니다. 사업자등록증과 관련 서류 제출이 필요합니다.'
      },
      {
        question: '채용공고는 어떻게 등록하나요?',
        answer: '기업 인증 완료 후 "채용공고 작성" 메뉴에서 직무, 자격요건, 우대사항 등을 입력하여 등록할 수 있습니다.'
      },
      {
        question: '인재 검색은 어떻게 하나요?',
        answer: '포트폴리오 기반으로 스킬, 경력, 분야별로 인재를 검색할 수 있으며, AI 매칭 점수를 통해 적합한 인재를 추천받을 수 있습니다.'
      },
      {
        question: '채용 프로세스는 어떻게 관리하나요?',
        answer: '지원자 관리, 면접 일정 조율, 합격/불합격 통보 등 모든 채용 프로세스를 플랫폼 내에서 통합 관리할 수 있습니다.'
      },
      {
        question: '서비스 이용료는 얼마인가요?',
        answer: '기본 서비스는 무료이며, 성공 채용 시에만 합리적인 수수료가 발생합니다. 자세한 요금 정책은 별도 문의 바랍니다.'
      },
      {
        question: '어떤 지원을 받을 수 있나요?',
        answer: '전담 컨설턴트가 배정되어 채용 전략 수립, 공고 작성 지원, 면접 프로세스 개선 등 맞춤형 컨설팅을 제공합니다.'
      },
      {
        question: '채용 성공률은 어느 정도인가요?',
        answer: '포트폴리오 기반 매칭으로 기존 대비 약 30% 향상된 채용 성공률을 보이고 있으며, 평균 채용 기간도 단축되었습니다.'
      },
      {
        question: '지원자와 직접 소통할 수 있나요?',
        answer: '플랫폼 내 메시징 시스템을 통해 지원자와 직접 소통할 수 있으며, 면접 일정 조율 등이 가능합니다.'
      }
    ],
    general: [
      {
        question: '테크벤처 잡 매칭은 어떤 서비스인가요?',
        answer: '서울시 중소기업과 우수한 인재를 연결하는 포트폴리오 기반 구인구직 플랫폼으로, AI 매칭 기술을 활용한 혁신적인 채용 서비스입니다.'
      },
      {
        question: '기존 구인구직 사이트와 무엇이 다른가요?',
        answer: '이력서 대신 포트폴리오 중심의 매칭으로 실무 능력을 정확히 평가할 수 있으며, 서울시 공식 인증 기업만 참여하여 신뢰성이 높습니다.'
      },
      {
        question: '서울시가 아닌 지역에서도 이용할 수 있나요?',
        answer: '현재는 서울시 중소기업과 서울 지역 구직자를 우선 대상으로 하고 있으나, 향후 수도권 지역으로 확대 예정입니다.'
      },
      {
        question: 'AI 매칭은 어떻게 작동하나요?',
        answer: '포트폴리오의 기술 스택, 프로젝트 경험, 성과 등을 분석하여 기업의 요구사항과 매칭 점수를 산출하고 최적의 매칭을 제안합니다.'
      },
      {
        question: '모바일 앱도 있나요?',
        answer: '현재는 웹 서비스만 제공하고 있으며, 반응형 웹 디자인으로 모바일에서도 최적화되어 이용 가능합니다. 앱 출시도 검토 중입니다.'
      },
      {
        question: '기술적 문제가 발생했을 때 어떻게 해야 하나요?',
        answer: '고객센터(tvs@techventure.co.kr)로 문의하시거나 플랫폼 내 문의하기 기능을 이용해주세요. 빠른 기술 지원을 제공합니다.'
      },
      {
        question: '회원 탈퇴는 어떻게 하나요?',
        answer: '마이페이지의 "회원 정보 관리"에서 탈퇴 신청이 가능하며, 개인정보는 관련 법령에 따라 안전하게 삭제됩니다.'
      },
      {
        question: '서비스 개선 제안은 어디로 하나요?',
        answer: '문의하기 페이지의 "개선 제안" 카테고리로 의견을 보내주시면 적극적으로 검토하여 서비스 개선에 반영하겠습니다.'
      }
    ]
  };

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
              <span className="text-2xl font-bold text-gray-900">테크벤처 잡 매칭</span>
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
                FAQ
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
            <QuestionMarkCircleIcon className="w-4 h-4 mr-2" />
            자주 묻는 질문
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-8 text-gray-900 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">FAQ</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            테크벤처 잡 매칭 이용 중 궁금한 점들을 모아두었습니다.<br />
            찾는 답변이 없다면 언제든 문의해주세요.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-16">
            <div className="bg-gray-100 rounded-2xl p-2 flex">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <category.icon className="w-5 h-5 mr-2" />
                  {category.title}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeCategory === category.id
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs[activeCategory].map((faq, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-8 py-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    {openItems.has(index) ? (
                      <ChevronUpIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openItems.has(index) && (
                    <div className="px-8 pb-6">
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">답변을 찾지 못하셨나요?</h2>
          <p className="text-xl text-gray-600 mb-12">
            더 자세한 문의사항이 있으시면 언제든 연락주세요
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl">
              문의하기
            </Link>
            <Link href="/help" className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-all duration-200">
              사용법 보기
            </Link>
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
            <span className="text-2xl font-bold">테크벤처 잡 매칭</span>
          </Link>
          <p className="text-gray-400">
            &copy; 2025 테크벤처 잡 매칭 Job Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 