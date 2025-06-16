'use client';

import { useState } from 'react';
import { SelfIntroduction, SelfIntroductionSection } from '@/types';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface IntroductionStepProps {
  data: SelfIntroduction;
  onChange: (data: SelfIntroduction) => void;
}

const DEFAULT_SECTIONS = [
  { title: '지원동기', placeholder: '이 분야를 선택한 이유와 앞으로의 목표를 구체적으로 작성해주세요.', color: 'blue' },
  { title: '성격의 장단점', placeholder: '자신의 성격과 업무에서의 강점, 개선점을 솔직하게 작성해주세요.', color: 'green' },
  { title: '주요 경험 및 성과', placeholder: '이전 경험 중 가장 의미있었던 프로젝트나 성과를 구체적으로 작성해주세요.', color: 'purple' },
  { title: '입사 후 포부', placeholder: '입사 후 이루고 싶은 목표와 회사에 기여할 수 있는 부분을 작성해주세요.', color: 'orange' }
];

const SECTION_COLORS = [
  'blue', 'green', 'purple', 'orange', 'red', 'indigo', 'pink', 'yellow'
];

export default function IntroductionStep({ data, onChange }: IntroductionStepProps) {
  const [isCustomMode, setIsCustomMode] = useState(data.useCustomSections || false);

  // 기존 데이터를 새로운 섹션 형태로 변환
  const convertLegacyToSections = (): SelfIntroductionSection[] => {
    const sections: SelfIntroductionSection[] = [];
    
    if (data.motivation) {
      sections.push({
        id: 'motivation',
        title: '지원동기',
        content: data.motivation,
        order: 0,
        color: 'blue'
      });
    }
    
    if (data.personality) {
      sections.push({
        id: 'personality',
        title: '성격의 장단점',
        content: data.personality,
        order: 1,
        color: 'green'
      });
    }
    
    if (data.experience) {
      sections.push({
        id: 'experience',
        title: '주요 경험 및 성과',
        content: data.experience,
        order: 2,
        color: 'purple'
      });
    }
    
    if (data.aspiration) {
      sections.push({
        id: 'aspiration',
        title: '입사 후 포부',
        content: data.aspiration,
        order: 3,
        color: 'orange'
      });
    }

    return sections;
  };

  // 현재 섹션 데이터 가져오기
  const getCurrentSections = (): SelfIntroductionSection[] => {
    if (isCustomMode && data.sections) {
      return data.sections.sort((a, b) => a.order - b.order);
    }
    return convertLegacyToSections();
  };

  // 기존 모드에서 필드 업데이트
  const handleLegacyChange = (field: keyof SelfIntroduction, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // 커스텀 모드로 전환
  const switchToCustomMode = () => {
    const convertedSections = convertLegacyToSections();
    
    // 빈 섹션이 있으면 기본 섹션으로 채우기
    if (convertedSections.length === 0) {
      const defaultSections = DEFAULT_SECTIONS.map((section, index) => ({
        id: `section_${Date.now()}_${index}`,
        title: section.title,
        content: '',
        order: index,
        color: section.color
      }));
      
      onChange({
        ...data,
        sections: defaultSections,
        useCustomSections: true
      });
    } else {
      onChange({
        ...data,
        sections: convertedSections,
        useCustomSections: true
      });
    }
    
    setIsCustomMode(true);
  };

  // 기존 모드로 전환
  const switchToLegacyMode = () => {
    const sections = getCurrentSections();
    const legacyData: SelfIntroduction = {
      motivation: sections.find(s => s.id === 'motivation' || s.title === '지원동기')?.content || '',
      personality: sections.find(s => s.id === 'personality' || s.title === '성격의 장단점')?.content || '',
      experience: sections.find(s => s.id === 'experience' || s.title === '주요 경험 및 성과')?.content || '',
      aspiration: sections.find(s => s.id === 'aspiration' || s.title === '입사 후 포부')?.content || '',
      useCustomSections: false
    };
    
    onChange(legacyData);
    setIsCustomMode(false);
  };

  // 새 섹션 추가
  const addSection = () => {
    const currentSections = getCurrentSections();
    const newSection: SelfIntroductionSection = {
      id: `section_${Date.now()}`,
      title: '',
      content: '',
      order: currentSections.length,
      color: SECTION_COLORS[currentSections.length % SECTION_COLORS.length]
    };
    
    onChange({
      ...data,
      sections: [...currentSections, newSection],
      useCustomSections: true
    });
  };

  // 섹션 업데이트
  const updateSection = (id: string, field: keyof SelfIntroductionSection, value: string | number) => {
    const currentSections = getCurrentSections();
    const updatedSections = currentSections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    );
    
    onChange({
      ...data,
      sections: updatedSections,
      useCustomSections: true
    });
  };

  // 섹션 삭제
  const removeSection = (id: string) => {
    const currentSections = getCurrentSections();
    const filteredSections = currentSections.filter(section => section.id !== id);
    
    // 순서 재정렬
    const reorderedSections = filteredSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    onChange({
      ...data,
      sections: reorderedSections,
      useCustomSections: true
    });
  };

  // 섹션 순서 변경
  const moveSection = (id: string, direction: 'up' | 'down') => {
    const currentSections = getCurrentSections();
    const sectionIndex = currentSections.findIndex(s => s.id === id);
    
    if (
      (direction === 'up' && sectionIndex === 0) ||
      (direction === 'down' && sectionIndex === currentSections.length - 1)
    ) {
      return;
    }
    
    const newSections = [...currentSections];
    const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    
    // 순서 교체
    [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]];
    
    // order 값 재설정
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    onChange({
      ...data,
      sections: reorderedSections,
      useCustomSections: true
    });
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'border-blue-500 bg-blue-50',
      green: 'border-green-500 bg-green-50',
      purple: 'border-purple-500 bg-purple-50',
      orange: 'border-orange-500 bg-orange-50',
      red: 'border-red-500 bg-red-50',
      indigo: 'border-indigo-500 bg-indigo-50',
      pink: 'border-pink-500 bg-pink-50',
      yellow: 'border-yellow-500 bg-yellow-50'
    };
    return colorMap[color] || 'border-gray-500 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">자기소개서</h3>
        <p className="text-sm text-gray-600 mb-6">
          각 항목별로 구체적이고 진솔한 내용을 작성해주세요.
        </p>
        
        {/* 모드 전환 버튼 */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">
              {isCustomMode ? '사용자 정의 섹션' : '기본 섹션'}
            </h4>
            <p className="text-sm text-gray-600">
              {isCustomMode 
                ? '소제목과 내용을 자유롭게 구성할 수 있습니다.' 
                : '정해진 4개 섹션으로 구성됩니다.'
              }
            </p>
          </div>
          <button
            onClick={isCustomMode ? switchToLegacyMode : switchToCustomMode}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowsRightLeftIcon className="w-4 h-4" />
            <span>{isCustomMode ? '기본 모드로' : '사용자 정의로'}</span>
          </button>
        </div>
      </div>

      {/* 기존 모드 */}
      {!isCustomMode && (
        <div className="space-y-6">
          {DEFAULT_SECTIONS.map((section, index) => {
            const fieldMap = ['motivation', 'personality', 'experience', 'aspiration'] as const;
            const field = fieldMap[index];
            const value = data[field] || '';
            
            return (
              <div key={field} className={`border-l-4 ${getColorClasses(section.color)} p-4 rounded-r-lg`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {section.title}
                </label>
                <textarea
                  value={value}
                  onChange={(e) => handleLegacyChange(field, e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={section.placeholder}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 커스텀 모드 */}
      {isCustomMode && (
        <div className="space-y-4">
          {getCurrentSections().map((section, index) => (
            <div key={section.id} className={`border-l-4 ${getColorClasses(section.color || 'blue')} p-4 rounded-r-lg`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">섹션 {index + 1}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={index === getCurrentSections().length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDownIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeSection(section.id)}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* 소제목 입력 */}
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                placeholder="소제목을 입력하세요 (예: 지원동기, 성격의 장점, 특별한 경험 등)"
                className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-medium"
              />
              
              {/* 내용 입력 */}
              <textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                rows={5}
                placeholder="내용을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              
              {/* 색상 선택 */}
              <div className="mt-3 flex items-center space-x-2">
                <span className="text-sm text-gray-600">색상:</span>
                <div className="flex space-x-1">
                  {SECTION_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => updateSection(section.id, 'color', color)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        section.color === color ? 'border-gray-800' : 'border-gray-300'
                      } ${getColorClasses(color).split(' ')[1]}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {/* 섹션 추가 버튼 */}
          <button
            onClick={addSection}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>새 섹션 추가</span>
          </button>
        </div>
      )}
    </div>
  );
}