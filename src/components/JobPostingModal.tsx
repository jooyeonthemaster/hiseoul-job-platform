'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function JobPostingModal({ isOpen, onClose, onSubmit }: JobPostingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    jobCategory: '개발',
    description: '',
    requirements: [''],
    responsibilities: [''],
    location: '',
    workingHours: '09:00 ~ 18:00',
    workType: 'fulltime',
    benefits: [''],
    preferredQualifications: [''],
    skills: [''],
    salary: {
      type: '연봉',
      amount: '',
      negotiable: true
    },
    recruiterInfo: {
      name: '',
      position: '',
      phone: '',
      email: ''
    },
    deadline: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (field: string, subField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field as keyof typeof prev] as any,
        [subField]: value
      }
    }));
  };

  const handleArrayInputChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 빈 문자열 제거
    const cleanedData = {
      ...formData,
      requirements: formData.requirements.filter(item => item.trim() !== ''),
      responsibilities: formData.responsibilities.filter(item => item.trim() !== ''),
      benefits: formData.benefits.filter(item => item.trim() !== ''),
      preferredQualifications: formData.preferredQualifications.filter(item => item.trim() !== ''),
      skills: formData.skills.filter(item => item.trim() !== ''),
      employerId: 'employer-001' // 임시 값
    };

    onSubmit(cleanedData);
    onClose();
    
    // 폼 초기화
    setFormData({
      title: '',
      jobCategory: '개발',
      description: '',
      requirements: [''],
      responsibilities: [''],
      location: '',
      workingHours: '09:00 ~ 18:00',
      workType: 'fulltime',
      benefits: [''],
      preferredQualifications: [''],
      skills: [''],
      salary: {
        type: '연봉',
        amount: '',
        negotiable: true
      },
      recruiterInfo: {
        name: '',
        position: '',
        phone: '',
        email: ''
      },
      deadline: ''
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">채용공고 작성</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 기본 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        채용 제목 *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="input-field"
                        placeholder="예: 시니어 백엔드 개발자"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        직무 카테고리 *
                      </label>
                      <select
                        required
                        value={formData.jobCategory}
                        onChange={(e) => handleInputChange('jobCategory', e.target.value)}
                        className="input-field"
                      >
                        <option value="개발">개발</option>
                        <option value="디자인">디자인</option>
                        <option value="데이터">데이터</option>
                        <option value="마케팅/시장조사">마케팅/시장조사</option>
                        <option value="영업/제휴">영업/제휴</option>
                        <option value="기획/경영">기획/경영</option>
                        <option value="인사/총무">인사/총무</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      채용 공고 설명 *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="input-field resize-none"
                      placeholder="회사 소개와 채용 포지션에 대한 설명을 작성해주세요."
                    />
                  </div>
                </div>

                {/* 근무 조건 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">근무 조건</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        근무 지역 *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="input-field"
                        placeholder="예: 서울특별시 강남구"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        근무 시간
                      </label>
                      <input
                        type="text"
                        value={formData.workingHours}
                        onChange={(e) => handleInputChange('workingHours', e.target.value)}
                        className="input-field"
                        placeholder="예: 09:00 ~ 18:00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        고용 형태
                      </label>
                      <select
                        value={formData.workType}
                        onChange={(e) => handleInputChange('workType', e.target.value)}
                        className="input-field"
                      >
                        <option value="fulltime">정규직</option>
                        <option value="parttime">계약직</option>
                        <option value="contract">파트타임</option>
                        <option value="intern">인턴</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        지원 마감일
                      </label>
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange('deadline', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                {/* 급여 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">급여 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        급여 형태
                      </label>
                      <select
                        value={formData.salary.type}
                        onChange={(e) => handleNestedInputChange('salary', 'type', e.target.value)}
                        className="input-field"
                      >
                        <option value="연봉">연봉</option>
                        <option value="월급">월급</option>
                        <option value="시급">시급</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        급여 범위
                      </label>
                      <input
                        type="text"
                        value={formData.salary.amount}
                        onChange={(e) => handleNestedInputChange('salary', 'amount', e.target.value)}
                        className="input-field"
                        placeholder="예: 3,000만원 ~ 5,000만원"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center mt-6">
                        <input
                          type="checkbox"
                          checked={formData.salary.negotiable}
                          onChange={(e) => handleNestedInputChange('salary', 'negotiable', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">협의 가능</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 배열 필드들 */}
                {[
                  { field: 'requirements', label: '지원 자격', placeholder: '예: Java 개발 경험 3년 이상' },
                  { field: 'responsibilities', label: '주요 업무', placeholder: '예: RESTful API 설계 및 개발' },
                  { field: 'benefits', label: '복리후생', placeholder: '예: 4대보험, 연차' },
                  { field: 'preferredQualifications', label: '우대사항', placeholder: '예: AWS 경험자 우대' },
                  { field: 'skills', label: '필요 기술', placeholder: '예: Java, Spring' }
                ].map(({ field, label, placeholder }) => (
                  <div key={field} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                      <button
                        type="button"
                        onClick={() => addArrayItem(field)}
                        className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        추가
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {(formData[field as keyof typeof formData] as string[]).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayInputChange(field, index, e.target.value)}
                            className="flex-1 input-field"
                            placeholder={placeholder}
                          />
                          {(formData[field as keyof typeof formData] as string[]).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(field, index)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* 채용 담당자 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">채용 담당자 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        담당자 이름
                      </label>
                      <input
                        type="text"
                        value={formData.recruiterInfo.name}
                        onChange={(e) => handleNestedInputChange('recruiterInfo', 'name', e.target.value)}
                        className="input-field"
                        placeholder="김채용"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        직책
                      </label>
                      <input
                        type="text"
                        value={formData.recruiterInfo.position}
                        onChange={(e) => handleNestedInputChange('recruiterInfo', 'position', e.target.value)}
                        className="input-field"
                        placeholder="인사팀 매니저"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        연락처
                      </label>
                      <input
                        type="tel"
                        value={formData.recruiterInfo.phone}
                        onChange={(e) => handleNestedInputChange('recruiterInfo', 'phone', e.target.value)}
                        className="input-field"
                        placeholder="02-1234-5678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일
                      </label>
                      <input
                        type="email"
                        value={formData.recruiterInfo.email}
                        onChange={(e) => handleNestedInputChange('recruiterInfo', 'email', e.target.value)}
                        className="input-field"
                        placeholder="hr@company.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  채용공고 등록
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 