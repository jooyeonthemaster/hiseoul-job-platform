'use client';
import { 
  XCircleIcon, 
  BuildingOfficeIcon, 
  UserIcon, 
  BriefcaseIcon, 
  EnvelopeIcon 
} from '@heroicons/react/24/outline';

interface JobInquiry {
  id: string;
  jobSeekerId: string;
  employerId: string;
  portfolioId: string;
  proposedPosition: string;
  proposedSalary: string;
  message: string;
  jobCategory: string;
  workingHours: string;
  workType: string;
  benefits: string[];
  companyInfo: {
    name: string;
    ceoName: string;
    industry: string;
    businessType: string;
    location: string;
    description: string;
  };
  recruiterInfo: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  status: 'sent' | 'read' | 'responded' | 'accepted' | 'rejected';
  sentAt: any;
  readAt?: any;
  respondedAt?: any;
  jobSeekerName?: string;
  jobSeekerEmail?: string;
}

interface JobInquiryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: JobInquiry | null;
  showJobSeekerName?: boolean; // 관리자 페이지에서만 구직자 이름 표시
  onStatusUpdate?: (inquiryId: string, status: string) => void; // 구직자가 상태 변경할 때 사용
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'sent':
        return { text: '새 제안', color: 'bg-blue-100 text-blue-800', icon: '📧' };
      case 'read':
        return { text: '읽음', color: 'bg-yellow-100 text-yellow-800', icon: '👀' };
      case 'responded':
        return { text: '답변함', color: 'bg-purple-100 text-purple-800', icon: '💬' };
      case 'accepted':
        return { text: '수락함', color: 'bg-green-100 text-green-800', icon: '✅' };
      case 'rejected':
        return { text: '거절함', color: 'bg-red-100 text-red-800', icon: '❌' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: '📄' };
    }
  };

  const statusInfo = getStatusInfo(status);
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
      <span className="mr-1">{statusInfo.icon}</span>
      {statusInfo.text}
    </span>
  );
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return '';
  
  let date: Date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }
  
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function JobInquiryDetailModal({ 
  isOpen, 
  onClose, 
  inquiry, 
  showJobSeekerName = false,
  onStatusUpdate 
}: JobInquiryDetailModalProps) {
  if (!isOpen || !inquiry) return null;

  const handleStatusUpdate = async (newStatus: string) => {
    if (onStatusUpdate) {
      await onStatusUpdate(inquiry.id, newStatus);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">채용 제안서 상세</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <XCircleIcon className="w-8 h-8" />
            </button>
          </div>

          <div className="space-y-8">
            {/* 기본 정보 - 상단 헤더 */}
            <div className="border-b pb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {inquiry.companyInfo?.name}
                    </h3>
                    <p className="text-lg text-gray-600">
                      {showJobSeekerName 
                        ? `${inquiry.jobSeekerName}님에게 채용 제안`
                        : '채용 제안서'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={inquiry.status} />
                  <p className="text-sm text-gray-500 mt-2">
                    발송일: {formatDate(inquiry.sentAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* 메인 콘텐츠 - 2단 레이아웃 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 왼쪽 컬럼 */}
              <div className="space-y-6">
                {/* 회사 정보 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <BuildingOfficeIcon className="w-6 h-6 mr-2 text-blue-600" />
                    회사 정보
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p><span className="font-medium text-gray-700">회사명:</span> <span className="text-gray-900">{inquiry.companyInfo?.name}</span></p>
                      <p><span className="font-medium text-gray-700">대표자:</span> <span className="text-gray-900">{inquiry.companyInfo?.ceoName}</span></p>
                      <p><span className="font-medium text-gray-700">업종:</span> <span className="text-gray-900">{inquiry.companyInfo?.industry}</span></p>
                    </div>
                    <div className="space-y-2">
                      <p><span className="font-medium text-gray-700">사업 형태:</span> <span className="text-gray-900">{inquiry.companyInfo?.businessType}</span></p>
                      <p><span className="font-medium text-gray-700">위치:</span> <span className="text-gray-900">{inquiry.companyInfo?.location}</span></p>
                    </div>
                  </div>
                  {inquiry.companyInfo?.description && (
                    <div className="mt-4">
                      <p className="font-medium text-gray-700 mb-2">회사 소개:</p>
                      <p className="text-gray-900 bg-white p-3 rounded border">{inquiry.companyInfo.description}</p>
                    </div>
                  )}
                </div>

                {/* 담당자 정보 */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
                    채용 담당자 정보
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p><span className="font-medium text-gray-700">담당자명:</span> <span className="text-gray-900">{inquiry.recruiterInfo?.name}</span></p>
                      <p><span className="font-medium text-gray-700">직위/직책:</span> <span className="text-gray-900">{inquiry.recruiterInfo?.position}</span></p>
                    </div>
                    <div className="space-y-2">
                      <p><span className="font-medium text-gray-700">연락처:</span> <span className="text-gray-900">{inquiry.recruiterInfo?.phone}</span></p>
                      <p><span className="font-medium text-gray-700">이메일:</span> <span className="text-gray-900">{inquiry.recruiterInfo?.email}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 오른쪽 컬럼 */}
              <div className="space-y-6">
                {/* 채용 정보 */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <BriefcaseIcon className="w-6 h-6 mr-2 text-green-600" />
                    채용 정보
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded border">
                      <p className="font-medium text-gray-700 mb-1">제안 직무</p>
                      <p className="text-lg text-gray-900 font-semibold">{inquiry.proposedPosition}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded border">
                        <p className="font-medium text-gray-700 text-sm">직무 카테고리</p>
                        <p className="text-gray-900">{inquiry.jobCategory}</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="font-medium text-gray-700 text-sm">근무 형태</p>
                        <p className="text-gray-900">{inquiry.workType}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded border">
                        <p className="font-medium text-gray-700 text-sm">제안 급여</p>
                        <p className="text-gray-900 font-semibold">{inquiry.proposedSalary}</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="font-medium text-gray-700 text-sm">근무 시간</p>
                        <p className="text-gray-900">{inquiry.workingHours}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 복리후생 */}
                {inquiry.benefits && inquiry.benefits.length > 0 && (
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">복리후생</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {inquiry.benefits.map((benefit, index) => (
                        <div key={index} className="bg-white p-3 rounded border text-center">
                          <span className="text-sm font-medium text-purple-800">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 채용 제안 메시지 - 전체 폭 */}
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <EnvelopeIcon className="w-6 h-6 mr-2 text-yellow-600" />
                채용 제안 메시지
              </h4>
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{inquiry.message}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center">
            {/* 구직자용 액션 버튼 (onStatusUpdate가 있을 때만 표시) */}
            {onStatusUpdate && inquiry.status === 'sent' && (
              <div className="flex space-x-4">
                <button
                  onClick={() => handleStatusUpdate('accepted')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  제안 수락
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  제안 거절
                </button>
              </div>
            )}
            
            <div className="flex-1"></div>
            
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 