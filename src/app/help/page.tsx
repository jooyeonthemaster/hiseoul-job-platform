'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<'jobseeker' | 'employer'>('jobseeker');

  const jobseekerSteps = [
    {
      icon: UserIcon,
      title: '1. 회원가입 및 프로필 작성',
      description: '기본 정보와 경력 사항을 입력하여 프로필을 완성하세요.',
      details: [
        '이메일 또는 소셜 로그인으로 간편 가입',
        '개인정보, 학력, 경력 사항 입력',
        '관심 분야 및 희망 직무 설정'
      ]
    },
    {
      icon: DocumentTextIcon,
      title: '2. 포트폴리오 작성',
      description: '실무 경험과 프로젝트를 포트폴리오로 정리하여 업로드하세요.',
      details: [
        '프로젝트별 상세 설명 및 성과 기록',
        '사용 기술 스택 및 툴 명시',
        '이미지, 링크 등 증빙 자료 첨부',
        'AI 기반 포트폴리오 최적화 제안 활용'
      ]
    },
    {
      icon: MagnifyingGlassIcon,
      title: '3. 채용공고 탐색',
      description: '맞춤형 채용공고를 확인하고 관심 기업을 팔로우하세요.',
      details: [
        '포트폴리오 기반 맞춤 공고 추천',
        '기업별 상세 정보 및 문화 확인',
        '급여, 복리후생, 근무환경 비교',
        '관심 기업 북마크 및 알림 설정'
      ]
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: '4. 지원 및 소통',
      description: '원클릭 지원으로 간편하게 지원하고 실시간으로 소통하세요.',
      details: [
        '포트폴리오 자동 연동으로 원클릭 지원',
        '지원 현황 실시간 확인',
        '기업과의 직접 메시징',
        '면접 일정 자동 관리'
      ]
    }
  ];

  const employerSteps = [
    {
      icon: BuildingOfficeIcon,
      title: '1. 기업 등록 및 인증',
      description: '서울시 하이서울브랜드 기업 인증을 받고 기업 정보를 등록하세요.',
      details: [
        '사업자 등록증 및 관련 서류 제출',
        '서울시 공식 인증 프로세스 진행',
        '기업 소개, 문화, 복리후생 정보 입력',
        '전담 컨설턴트 배정 및 상담'
      ]
    },
    {
      icon: MagnifyingGlassIcon,
      title: '2. 인재 탐색 및 검색',
      description: '포트폴리오 기반으로 우수한 인재를 발굴하세요.',
      details: [
        '스킬별, 경력별 인재 검색',
        '포트폴리오 상세 검토',
        'AI 기반 매칭 점수 확인',
        '인재 프로필 북마크 및 관리'
      ]
    },
    {
      icon: DocumentTextIcon,
      title: '3. 채용공고 작성',
      description: '매력적인 채용공고를 작성하여 우수한 지원자를 유치하세요.',
      details: [
        '직무별 맞춤 공고 템플릿 제공',
        '급여, 복리후생 정보 상세 입력',
        '근무환경 및 성장 기회 어필',
        '포지션별 필수/우대 스킬 명시'
      ]
    },
    {
      icon: CheckCircleIcon,
      title: '4. 채용 관리',
      description: '효율적인 채용 프로세스로 최적의 인재를 선별하세요.',
      details: [
        '지원자 포트폴리오 일괄 검토',
        '단계별 채용 프로세스 관리',
        '면접 일정 자동 스케줄링',
        '채용 결과 자동 통지'
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
                도움말
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
            도움말 센터
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-8 text-gray-900 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">HiSeoul</span> 
            사용법
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            구직자와 기업을 위한 상세한 가이드를 확인하고,<br />
            HiSeoul의 모든 기능을 효과적으로 활용해보세요.
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-16">
            <div className="bg-gray-100 rounded-2xl p-2">
              <button
                onClick={() => setActiveTab('jobseeker')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'jobseeker'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                구직자 가이드
              </button>
              <button
                onClick={() => setActiveTab('employer')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'employer'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                기업 가이드
              </button>
            </div>
          </div>

          {/* Guide Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {(activeTab === 'jobseeker' ? jobseekerSteps : employerSteps).map((step, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    activeTab === 'jobseeker' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700'
                  }`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">추가 도움이 필요하신가요?</h2>
          <p className="text-xl text-gray-600 mb-12">
            더 자세한 문의사항이 있으시면 언제든 연락주세요
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl">
              문의하기
            </Link>
            <Link href="/faq" className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-all duration-200">
              FAQ 보기
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