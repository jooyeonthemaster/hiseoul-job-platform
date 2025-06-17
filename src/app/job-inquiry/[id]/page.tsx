'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData } from '@/lib/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  UserIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function JobInquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const inquiryId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [inquiry, setInquiry] = useState<any>(null);
  const [responding, setResponding] = useState(false);
  const [response, setResponse] = useState<'accepted' | 'rejected' | null>(null);

  useEffect(() => {
    const loadInquiry = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        const userData = await getUserData(user.uid);
        if (!userData || userData.role !== 'jobseeker') {
          router.push('/');
          return;
        }

        // 채용 제안 정보 가져오기
        const inquiryDoc = await getDoc(doc(db, 'jobInquiries', inquiryId));
        if (!inquiryDoc.exists()) {
          router.push('/profile');
          return;
        }

        const inquiryData = inquiryDoc.data();
        
        // 권한 확인
        if (inquiryData.jobSeekerId !== user.uid) {
          router.push('/profile');
          return;
        }

        setInquiry({
          id: inquiryDoc.id,
          ...inquiryData
        });

        // 읽음 처리
        if (inquiryData.status === 'sent') {
          await updateDoc(doc(db, 'jobInquiries', inquiryId), {
            status: 'read',
            readAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error('Error loading inquiry:', error);
        router.push('/profile');
      } finally {
        setLoading(false);
      }
    };

    loadInquiry();
  }, [user, inquiryId, router]);

  const handleResponse = async (action: 'accepted' | 'rejected') => {
    if (!user || !inquiry) return;

    try {
      setResponding(true);
      setResponse(action);

      await updateDoc(doc(db, 'jobInquiries', inquiryId), {
        status: action,
        respondedAt: serverTimestamp()
      });

      // 이메일 알림 발송
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: inquiry.recruiterInfo.email,
          cc: 'jooyeon74397430@gmail.com',
          subject: `[테크벤처 잡 매칭] 채용 제안에 대한 응답이 도착했습니다`,
          type: 'response',
          jobSeekerName: inquiry.jobSeekerName || '구직자',
          companyName: inquiry.companyInfo.name,
          action: action,
          position: inquiry.proposedPosition
        })
      });

      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error responding to inquiry:', error);
      setResponding(false);
      setResponse(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!inquiry) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            프로필로 돌아가기
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">채용 제안 상세</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Company Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {inquiry.companyInfo.name}
                </h2>
                <p className="text-blue-100">
                  {inquiry.companyInfo.industry} • {inquiry.companyInfo.businessType}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  inquiry.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  inquiry.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
                  inquiry.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  inquiry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {inquiry.status === 'sent' ? '새 제안' :
                   inquiry.status === 'read' ? '읽음' :
                   inquiry.status === 'accepted' ? '수락함' :
                   inquiry.status === 'rejected' ? '거절함' : inquiry.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* 제안 정보 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BriefcaseIcon className="w-6 h-6 mr-2 text-blue-600" />
                채용 정보
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">제안 직무</p>
                  <p className="text-lg font-medium text-gray-900">{inquiry.proposedPosition}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">제안 급여</p>
                  <p className="text-lg font-medium text-gray-900">{inquiry.proposedSalary}</p>
                </div>
                
                {inquiry.jobCategory && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">직무 내용</p>
                    <p className="text-gray-900">{inquiry.jobCategory}</p>
                  </div>
                )}
                
                {inquiry.workingHours && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">근무 시간</p>
                    <p className="text-gray-900">{inquiry.workingHours}</p>
                  </div>
                )}
                
                {inquiry.workType && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">근무 형태</p>
                    <p className="text-gray-900">
                      {inquiry.workType === 'fulltime' ? '정규직' :
                       inquiry.workType === 'parttime' ? '파트타임' :
                       inquiry.workType === 'contract' ? '계약직' :
                       inquiry.workType === 'intern' ? '인턴' : inquiry.workType}
                    </p>
                  </div>
                )}
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">제안 일자</p>
                  <p className="text-gray-900">
                    {inquiry.sentAt?.toDate?.()?.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) || '날짜 정보 없음'}
                  </p>
                </div>
              </div>

              {inquiry.benefits && inquiry.benefits.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">복리후생</p>
                  <div className="flex flex-wrap gap-2">
                    {inquiry.benefits.map((benefit: string, idx: number) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* 기업 정보 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="w-6 h-6 mr-2 text-blue-600" />
                기업 정보
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">대표이사</p>
                    <p className="text-gray-900 font-medium">{inquiry.companyInfo.ceoName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">위치</p>
                    <p className="text-gray-900 font-medium flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {inquiry.companyInfo.location}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">기업 소개</p>
                  <p className="text-gray-900">{inquiry.companyInfo.description}</p>
                </div>

                {inquiry.companyInfo.companyAttraction && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">회사의 매력</p>
                    <div className="flex flex-wrap gap-2">
                      {inquiry.companyInfo.companyAttraction.remoteWork && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          재택근무 가능
                        </span>
                      )}
                      {inquiry.companyInfo.companyAttraction.growthOpportunity && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          높은 성장 기회
                        </span>
                      )}
                      {inquiry.companyInfo.companyAttraction.stockOptions && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                          스톡옵션 제공
                        </span>
                      )}
                      {inquiry.companyInfo.companyAttraction.trainingSupport && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          교육비 지원
                        </span>
                      )}
                      {inquiry.companyInfo.companyAttraction.familyFriendly && (
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                          가족친화 기업
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 채용 담당자 메시지 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <EnvelopeIcon className="w-6 h-6 mr-2 text-blue-600" />
                채용 담당자 메시지
              </h3>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-gray-800 whitespace-pre-wrap">{inquiry.message}</p>
              </div>
            </div>

            {/* 담당자 정보 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
                채용 담당자 정보
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">담당자</p>
                    <p className="text-gray-900 font-medium">
                      {inquiry.recruiterInfo.name} {inquiry.recruiterInfo.position}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">연락처</p>
                    <p className="text-gray-900 font-medium flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-1" />
                      {inquiry.recruiterInfo.phone}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">이메일</p>
                    <p className="text-gray-900 font-medium flex items-center">
                      <EnvelopeIcon className="w-4 h-4 mr-1" />
                      {inquiry.recruiterInfo.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 응답 버튼 */}
            {inquiry.status === 'sent' || inquiry.status === 'read' ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleResponse('accepted')}
                  disabled={responding}
                  className="flex-1 sm:flex-none sm:min-w-[200px] bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-8 rounded-xl flex items-center justify-center disabled:opacity-50"
                >
                  {responding && response === 'accepted' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                  )}
                  제안 수락
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleResponse('rejected')}
                  disabled={responding}
                  className="flex-1 sm:flex-none sm:min-w-[200px] bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-8 rounded-xl flex items-center justify-center disabled:opacity-50"
                >
                  {responding && response === 'rejected' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <XCircleIcon className="w-5 h-5 mr-2" />
                  )}
                  제안 거절
                </motion.button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  {inquiry.status === 'accepted' ? '이 제안을 수락하셨습니다.' : '이 제안을 거절하셨습니다.'}
                </p>
                <Link
                  href="/profile"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  프로필로 돌아가기
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}