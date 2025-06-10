'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData } from '@/lib/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowLeftIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface JobInquiry {
  id: string;
  jobSeekerId: string;
  jobSeekerName?: string;
  proposedPosition: string;
  proposedSalary: string;
  message: string;
  status: 'sent' | 'read' | 'responded' | 'accepted' | 'rejected';
  sentAt: any;
  recruiterInfo: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
}

export default function InquiriesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<JobInquiry[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'read' | 'responded' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    const loadInquiries = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        const userData = await getUserData(user.uid);
        if (!userData || userData.role !== 'employer') {
          router.push('/');
          return;
        }

        // 채용 문의 목록 가져오기
        const inquiriesQuery = query(
          collection(db, 'jobInquiries'),
          where('employerId', '==', user.uid),
          orderBy('sentAt', 'desc')
        );
        
        const querySnapshot = await getDocs(inquiriesQuery);
        const inquiriesData: JobInquiry[] = [];
        
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          
          // 구직자 정보 가져오기
          const jobSeekerDoc = await getDocs(
            query(collection(db, 'portfolios'), where('userId', '==', data.jobSeekerId))
          );
          
          let jobSeekerName = '알 수 없음';
          if (!jobSeekerDoc.empty) {
            jobSeekerName = jobSeekerDoc.docs[0].data().name || '알 수 없음';
          }
          
          inquiriesData.push({
            id: doc.id,
            ...data,
            jobSeekerName,
            sentAt: data.sentAt
          } as JobInquiry);
        }
        
        setInquiries(inquiriesData);
      } catch (error) {
        console.error('Error loading inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, [user, router]);

  const filteredInquiries = filter === 'all' 
    ? inquiries 
    : inquiries.filter(inquiry => inquiry.status === filter);

  const getStatusBadge = (status: string) => {
    const badges = {
      sent: { color: 'bg-blue-100 text-blue-800', icon: EnvelopeIcon, text: '발송됨' },
      read: { color: 'bg-yellow-100 text-yellow-800', icon: EyeIcon, text: '읽음' },
      responded: { color: 'bg-purple-100 text-purple-800', icon: DocumentTextIcon, text: '응답함' },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: '수락' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: '거절' }
    };
    
    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <badge.icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/employer-dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            대시보드로 돌아가기
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">채용 문의 관리</h1>
          <p className="text-gray-600 mt-2">발송한 채용 제안의 상태를 확인하고 관리하세요.</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <nav className="flex space-x-1 p-1">
            {[
              { key: 'all', label: '전체', count: inquiries.length },
              { key: 'sent', label: '발송됨', count: inquiries.filter(i => i.status === 'sent').length },
              { key: 'read', label: '읽음', count: inquiries.filter(i => i.status === 'read').length },
              { key: 'responded', label: '응답함', count: inquiries.filter(i => i.status === 'responded').length },
              { key: 'accepted', label: '수락', count: inquiries.filter(i => i.status === 'accepted').length },
              { key: 'rejected', label: '거절', count: inquiries.filter(i => i.status === 'rejected').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <span className="ml-2">({tab.count})</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Inquiries List */}
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">채용 문의가 없습니다</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? '아직 발송한 채용 제안이 없습니다.'
                : `${filter} 상태의 채용 제안이 없습니다.`}
            </p>
            <Link
              href="/employer-dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              인재 검색하러 가기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => (
              <motion.div
                key={inquiry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {inquiry.jobSeekerName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
                        {inquiry.jobSeekerName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {inquiry.proposedPosition}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(inquiry.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                    <span>제안 급여: {inquiry.proposedSalary}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span>발송일: {inquiry.sentAt?.toDate?.()?.toLocaleDateString('ko-KR') || '알 수 없음'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span>담당자: {inquiry.recruiterInfo.name}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">발송 메시지</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {inquiry.message.length > 150 
                      ? inquiry.message.substring(0, 150) + '...' 
                      : inquiry.message}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    담당자 연락처: {inquiry.recruiterInfo.phone} • {inquiry.recruiterInfo.email}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/portfolios/${inquiry.jobSeekerId}`}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      포트폴리오 보기
                    </Link>
                    {inquiry.status === 'responded' && (
                      <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        응답 확인
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">채용 문의 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{inquiries.length}</div>
              <div className="text-sm text-gray-600">전체 제안</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {inquiries.filter(i => i.status === 'sent').length}
              </div>
              <div className="text-sm text-gray-600">발송됨</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {inquiries.filter(i => i.status === 'read').length}
              </div>
              <div className="text-sm text-gray-600">읽음</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {inquiries.filter(i => i.status === 'accepted').length}
              </div>
              <div className="text-sm text-gray-600">수락</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {inquiries.length > 0 
                  ? Math.round((inquiries.filter(i => i.status === 'accepted').length / inquiries.length) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">수락률</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}