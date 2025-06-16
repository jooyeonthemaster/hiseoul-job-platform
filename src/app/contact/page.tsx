'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: '이메일',
      value: 'tvs@techventure.co.kr',
      description: '일반 문의 및 기술 지원',
      link: 'mailto:tvs@techventure.co.kr'
    },
    {
      icon: PhoneIcon,
      title: '전화번호',
      value: '010-3721-0204',
      description: '평일 09:00 ~ 18:00',
      link: 'tel:010-3721-0204'
    },
    {
      icon: MapPinIcon,
      title: '주소',
      value: '서울특별시',
      description: '정확한 주소는 문의 시 안내',
      link: null
    },
    {
      icon: ClockIcon,
      title: '업무시간',
      value: '평일 09:00 ~ 18:00',
      description: '토/일/공휴일 휴무',
      link: null
    }
  ];

  const categories = [
    { value: 'general', label: '일반 문의' },
    { value: 'technical', label: '기술 지원' },
    { value: 'business', label: '사업 제휴' },
    { value: 'complaint', label: '불만/신고' },
    { value: 'suggestion', label: '개선 제안' }
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
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                소개
              </Link>
              <span className="text-blue-600 font-semibold">
                문의
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
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
            Contact Us
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-8 text-gray-900 leading-tight">
            언제든 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">문의하세요</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            테크벤처 잡 매칭에 대한 궁금한 점이나 제안사항이 있으시면<br />
            언제든지 편하게 연락주세요. 빠르게 답변드리겠습니다.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{info.title}</h3>
                {info.link ? (
                  <a 
                    href={info.link} 
                    className="text-blue-600 hover:text-blue-700 font-semibold text-lg block mb-2 transition-colors"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-gray-900 font-semibold text-lg mb-2">{info.value}</p>
                )}
                <p className="text-gray-600">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">문의 보내기</h2>
            <p className="text-xl text-gray-600">아래 폼을 작성해 주시면 빠르게 답변드리겠습니다</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            {isSubmitted && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                  <p className="text-green-800 font-semibold">문의가 성공적으로 전송되었습니다!</p>
                </div>
                <p className="text-green-700 mt-2">빠른 시일 내에 답변드리겠습니다.</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="홍길동"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                    문의 유형 *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="문의 제목을 입력해주세요"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  메시지 *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="문의 내용을 자세히 입력해주세요..."
                ></textarea>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-12 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  문의 보내기
                </button>
              </div>
            </form>
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