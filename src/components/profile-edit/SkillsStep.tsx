'use client';

import { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CertificateItem, AwardItem } from '@/types';

interface SkillsStepProps {
  data: {
    skills: string[];
    languages: string[];
    certificates: CertificateItem[];
    awards: AwardItem[];
  };
  onChange: (data: any) => void;
}

export default function SkillsStep({ data, onChange }: SkillsStepProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  // 안전한 날짜 포맷 함수
  const formatDateForInput = (dateValue: any): string => {
    if (!dateValue) return '';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Invalid date value:', dateValue);
      return '';
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const updated = [...data.skills, newSkill.trim()];
      onChange({ ...data, skills: updated });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updated = data.skills.filter((_, i) => i !== index);
    onChange({ ...data, skills: updated });
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      const updated = [...data.languages, newLanguage.trim()];
      onChange({ ...data, languages: updated });
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (index: number) => {
    const updated = data.languages.filter((_, i) => i !== index);
    onChange({ ...data, languages: updated });
  };
  const addCertificate = () => {
    const newCert: CertificateItem = {
      name: '',
      issuer: '',
      issueDate: new Date(),
    };
    const updated = [...(data.certificates || []), newCert];
    onChange({ ...data, certificates: updated });
  };

  const updateCertificate = (index: number, field: keyof CertificateItem, value: any) => {
    const updated = [...(data.certificates || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, certificates: updated });
  };

  const removeCertificate = (index: number) => {
    const updated = data.certificates?.filter((_, i) => i !== index) || [];
    onChange({ ...data, certificates: updated });
  };

  const addAward = () => {
    const newAward: AwardItem = {
      title: '',
      organization: '',
      date: new Date(),
    };
    const updated = [...(data.awards || []), newAward];
    onChange({ ...data, awards: updated });
  };

  const updateAward = (index: number, field: keyof AwardItem, value: any) => {
    const updated = [...(data.awards || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, awards: updated });
  };

  const removeAward = (index: number) => {
    const updated = data.awards?.filter((_, i) => i !== index) || [];
    onChange({ ...data, awards: updated });
  };
  return (
    <div className="space-y-8">
      {/* Skills Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">보유 스킬</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="예: JavaScript, React, Node.js"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Languages Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">사용 가능 언어</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
              placeholder="예: 한국어, 영어, 일본어"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddLanguage}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.languages.map((language, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                {language}
                <button
                  type="button"
                  onClick={() => handleRemoveLanguage(index)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Certificates Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">자격증</h3>
          <button
            type="button"
            onClick={addCertificate}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            자격증 추가
          </button>
        </div>
        {data.certificates?.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">등록된 자격증이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.certificates?.map((cert, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                    placeholder="자격증명"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateCertificate(index, 'issuer', e.target.value)}
                    placeholder="발급기관"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={formatDateForInput(cert.issueDate)}
                      onChange={(e) => updateCertificate(index, 'issueDate', new Date(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertificate(index)}
                      className="text-red-600 hover:text-red-700 px-2"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Awards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">수상 경력</h3>
          <button
            type="button"
            onClick={addAward}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            수상 경력 추가
          </button>
        </div>
        {data.awards?.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">등록된 수상 경력이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.awards?.map((award, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={award.title}
                    onChange={(e) => updateAward(index, 'title', e.target.value)}
                    placeholder="수상명"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={award.organization}
                    onChange={(e) => updateAward(index, 'organization', e.target.value)}
                    placeholder="수여기관"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={formatDateForInput(award.date)}
                      onChange={(e) => updateAward(index, 'date', new Date(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeAward(index)}
                      className="text-red-600 hover:text-red-700 px-2"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}