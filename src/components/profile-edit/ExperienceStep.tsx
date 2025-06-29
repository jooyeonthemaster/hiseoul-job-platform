'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ExperienceItem } from '@/types';
import { formatDateForInput, createSafeDate } from '@/lib/dateUtils';

interface ExperienceStepProps {
  data: ExperienceItem[];
  onChange: (data: ExperienceItem[]) => void;
}

export default function ExperienceStep({ data, onChange }: ExperienceStepProps) {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(data);

  const addExperience = () => {
    const newExperience: ExperienceItem = {
      company: '',
      position: '',
      startDate: '',
      isCurrent: false,
      description: ''
    };
    const updated = [...experiences, newExperience];
    setExperiences(updated);
    onChange(updated);
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
    onChange(updated);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">경력 사항</h3>
          <p className="text-sm text-gray-600 mt-1">
            이전 근무 경험을 추가해주세요.
          </p>
        </div>
        <button
          type="button"
          onClick={addExperience}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          경력 추가
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">경력 사항이 없습니다.</p>
          <button
            type="button"
            onClick={addExperience}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            첫 경력 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-md font-medium text-gray-900">
                  경력 {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    회사명
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    직책/직급
                  </label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일
                  </label>
                  <input
                    type="text"
                    value={exp.startDate || ''}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    placeholder="YYYY-MM 형식으로 입력 (예: 2020-03)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료일
                  </label>
                  <input
                    type="text"
                    value={exp.endDate || ''}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    disabled={exp.isCurrent}
                    placeholder="YYYY-MM 형식으로 입력 (예: 2022-12)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`current-${index}`}
                      checked={exp.isCurrent}
                      onChange={(e) => updateExperience(index, 'isCurrent', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`current-${index}`} className="ml-2 text-sm text-gray-700">
                      현재 재직중
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    업무 내용
                  </label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="담당했던 업무와 성과를 구체적으로 작성해주세요."
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