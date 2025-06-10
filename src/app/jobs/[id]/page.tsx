'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  TagIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { JobPosting } from '@/types';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!params.id) return;
      
      try {
        const response = await fetch(`/api/job-postings/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setJob(data);
        } else {
          console.error('채용공고를 불러오는데 실패했습니다.');
          router.push('/jobs');
        }
      } catch (error) {
        console.error('API 호출 오류:', error);
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.id, router]);

  const getWorkTypeLabel = (workType: string) => {
    const labels: { [key: string]: string } = {
      'fulltime': '정규직',
      'parttime': '계약직',
      'contract': '파트타임',
      'intern': '인턴'
    };
    return labels[workType] || workType;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '상시모집';
    
    // 문자열인 경우 Date 객체로 변환
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // 유효한 날짜인지 확인
    if (isNaN(dateObj.getTime())) return '상시모집';
    
    return dateObj.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleApply = async () => {
    setIsApplying(true);
    // TODO: 실제 지원 로직 구현
    setTimeout(() => {
      setIsApplying(false);
      alert('지원이 완료되었습니다!');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-slate-600 font-medium">채용공고를 불러오고 있습니다...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <BriefcaseIcon className="mx-auto w-16 h-16 text-slate-300 mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">채용공고를 찾을 수 없습니다</h1>
            <p className="text-slate-600 mb-6">요청하신 채용공고가 삭제되었거나 존재하지 않습니다.</p>
            <Link
              href="/jobs"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              채용공고 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/jobs"
            className="inline-flex items-center text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            채용공고 목록으로 돌아가기
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800">
                    <TagIcon className="w-4 h-4 mr-1" />
                    {job.jobCategory}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                    <BriefcaseIcon className="w-4 h-4 mr-1" />
                    {getWorkTypeLabel(job.workType)}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  {job.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-slate-600">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">{job.companyName}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    <span>마감: {formatDate(job.deadline)}</span>
                  </div>
                </div>
              </div>
              
              {/* Apply Button */}
              <div className="mt-6 lg:mt-0 lg:ml-8 space-y-3">
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full lg:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors text-lg"
                >
                  {isApplying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      지원 중...
                    </>
                  ) : (
                    '지원하기'
                  )}
                </button>
                

                
                {/* 크롤링 소스 표시 */}
                {(job as any).source && (
                  <div className="text-sm text-gray-500 text-center">
                    출처: {(job as any).source === 'jobkorea' ? '잡코리아' : (job as any).source === 'jobplanet' ? '잡플래닛' : (job as any).source}
                  </div>
                )}
              </div>
            </div>

            {/* Key Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {job.salary.amount && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center text-slate-600 mb-2">
                    <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">급여</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {job.salary.amount}
                    {job.salary.negotiable && (
                      <span className="text-sm text-blue-600 ml-2">(협의가능)</span>
                    )}
                  </p>
                </div>
              )}
              
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center text-slate-600 mb-2">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">근무시간</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {job.workingHours}
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center text-slate-600 mb-2">
                  <TagIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">급여 형태</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {job.salary.type}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Description */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">채용 상세</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">지원 자격</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Responsibilities */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">주요 업무</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preferred Qualifications */}
              {job.preferredQualifications.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">우대사항</h2>
                  <ul className="space-y-3">
                    {job.preferredQualifications.map((qual, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">복리후생</h2>
                  <ul className="space-y-3">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Required Skills */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">필요 기술</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recruiter Info */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">채용 담당자</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <UserIcon className="w-5 h-5 text-slate-400 mr-3" />
                    <div>
                      <p className="font-medium text-slate-900">{job.recruiterInfo.name}</p>
                      <p className="text-sm text-slate-600">{job.recruiterInfo.position}</p>
                    </div>
                  </div>
                  
                  {job.recruiterInfo.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="w-5 h-5 text-slate-400 mr-3" />
                      <span className="text-slate-700">{job.recruiterInfo.phone}</span>
                    </div>
                  )}
                  
                  {job.recruiterInfo.email && (
                    <div className="flex items-center">
                      <EnvelopeIcon className="w-5 h-5 text-slate-400 mr-3" />
                      <span className="text-slate-700">{job.recruiterInfo.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">지원하기</h3>
                <p className="text-slate-600 mb-4">
                  이 채용공고에 관심이 있으시다면 지금 바로 지원해보세요!
                </p>
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors"
                >
                  {isApplying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      지원 중...
                    </>
                  ) : (
                    '지원하기'
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 