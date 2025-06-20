'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { EducationItem } from '@/types';
import { formatDateForInput, createSafeDate } from '@/lib/dateUtils';

interface EducationStepProps {
  data: EducationItem[];
  onChange: (data: EducationItem[]) => void;
}

export default function EducationStep({ data, onChange }: EducationStepProps) {
  const [educations, setEducations] = useState<EducationItem[]>(data);

  const addEducation = () => {
    const newEducation: EducationItem = {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
    };
    const updated = [...educations, newEducation];
    setEducations(updated);
    onChange(updated);
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: any) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
    onChange(updated);
  };

  const removeEducation = (index: number) => {
    const updated = educations.filter((_, i) => i !== index);
    setEducations(updated);
    onChange(updated);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">학력 사항</h3>
          <p className="text-sm text-gray-600 mt-1">
            최종 학력부터 시간 역순으로 입력해주세요.
          </p>
        </div>
        <button
          type="button"
          onClick={addEducation}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          학력 추가
        </button>
      </div>

      {educations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">학력 사항이 없습니다.</p>
          <button
            type="button"
            onClick={addEducation}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            학력 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {educations.map((edu, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-md font-medium text-gray-900">
                  학력 {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    학교명
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    학위
                  </label>
                  <select
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="고등학교">고등학교</option>
                    <option value="전문학사">전문학사</option>
                    <option value="학사">학사</option>
                    <option value="석사">석사</option>
                    <option value="박사">박사</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전공
                  </label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    학점
                  </label>
                  <input
                    type="text"
                    value={edu.grade || ''}
                    onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                    placeholder="예: 3.5/4.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    입학일
                  </label>
                  <input
                    type="text"
                    value={edu.startDate || ''}
                    onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                    placeholder="YYYY-MM 형식으로 입력 (예: 2018-03)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    졸업일
                  </label>
                  <input
                    type="text"
                    value={edu.endDate || ''}
                    onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    placeholder="YYYY-MM 형식으로 입력 (예: 2022-02)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}