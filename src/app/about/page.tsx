'use client';

import Link from 'next/link';
import { 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const values = [
    {
      icon: HeartIcon,
      title: '진정성',
      description: '구직자와 기업 모두에게 진정으로 도움이 되는 서비스를 제공합니다.'
    },
    {
      icon: LightBulbIcon,
      title: '혁신',
      description: 'AI 기술과 포트폴리오 기반 매칭으로 채용 시장에 혁신을 가져옵니다.'
    },
    {
      icon: ShieldCheckIcon,
      title: '신뢰',
      description: '서울시 공식 인증을 통해 검증된 기업과 투명한 채용 프로세스를 보장합니다.'
    }
  ];

  const team = [
    {
      name: '김기홍',
      position: '대표 / 전 HBA 사무국장',
      description: '채용 및 인사 전문 경험을 바탕으로 테크벤처 잡 매칭을 설립했습니다.',
      email: 'tvs@techventure.co.kr'
    }
  ];

  const stats = [
    { number: '1,200+', label: '등록된 포트폴리오' },
    { number: '450+', label: '참여 기업' },
    { number: '890+', label: '성공 매칭' },
    { number: '95%', label: '매칭 성공률' }
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
              <span className="text-blue-600 font-semibold">
                소개
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
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            About 테크벤처 잡 매칭
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-8 text-gray-900 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">테크벤처 잡 매칭</span>을 
            소개합니다
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            서울시 중소기업과 우수한 인재를 연결하는 혁신적인 구인구직 플랫폼으로,<br />
            포트폴리오 기반 매칭을 통해 더 나은 채용 문화를 만들어갑니다.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8 text-gray-900">
                우리의 <span className="text-blue-600">미션</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
              테크벤처 잡 매칭은 서울시의 우수한 중소기업들이 필요로 하는 인재와 
                실력 있는 구직자들을 효과적으로 연결하여, 
                모두가 성장할 수 있는 채용 생태계를 구축하는 것을 목표로 합니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">포트폴리오 기반의 실력 중심 채용 문화 조성</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">서울시 중소기업의 인재 확보 지원</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-600">구직자의 역량 개발 및 취업 기회 확대</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8">
              <h2 className="text-4xl font-bold mb-8 text-gray-900">
                우리의 <span className="text-indigo-600">비전</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                2030년까지 서울시 최고의 중소기업 전문 구인구직 플랫폼이 되어, 
                연간 10,000건 이상의 성공적인 매칭을 달성하고, 
                서울시 중소기업의 채용 성공률을 획기적으로 향상시키는 것입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">핵심 가치</h2>
            <p className="text-xl text-gray-600">테크벤처 잡 매칭이 추구하는 가치와 원칙입니다</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed text-center">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">성과와 현황</h2>
            <p className="text-xl text-gray-600">테크벤처 잡 매칭이 만들어낸 성과를 숫자로 확인하세요</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">팀 소개</h2>
            <p className="text-xl text-gray-600">테크벤처 잡 매칭을 이끌어가는 전문가를 만나보세요</p>
          </div>
          
          <div className="flex justify-center">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg max-w-md">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900 text-center">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-4 text-center">{member.position}</p>
                <p className="text-gray-600 leading-relaxed mb-6 text-center">{member.description}</p>
                <div className="text-center">
                  <a 
                    href={`mailto:${member.email}`} 
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    문의하기
                  </a>
                </div>
              </div>
            ))}
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