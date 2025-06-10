'use client';

import { SelfIntroduction } from '@/types';

interface IntroductionStepProps {
  data: SelfIntroduction;
  onChange: (data: SelfIntroduction) => void;
}

export default function IntroductionStep({ data, onChange }: IntroductionStepProps) {
  const handleChange = (field: keyof SelfIntroduction, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">자기소개서</h3>
        <p className="text-sm text-gray-600 mb-6">
          각 항목별로 구체적이고 진솔한 내용을 작성해주세요.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            지원동기
          </label>
          <textarea
            value={data.motivation || ''}
            onChange={(e) => handleChange('motivation', e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="이 분야를 선택한 이유와 앞으로의 목표를 구체적으로 작성해주세요."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            성격의 장단점
          </label>
          <textarea
            value={data.personality || ''}
            onChange={(e) => handleChange('personality', e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="자신의 성격과 업무에서의 강점, 개선점을 솔직하게 작성해주세요."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주요 경험 및 성과
          </label>
          <textarea
            value={data.experience || ''}
            onChange={(e) => handleChange('experience', e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="이전 경험 중 가장 의미있었던 프로젝트나 성과를 구체적으로 작성해주세요."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            입사 후 포부
          </label>
          <textarea
            value={data.aspiration || ''}
            onChange={(e) => handleChange('aspiration', e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="입사 후 이루고 싶은 목표와 회사에 기여할 수 있는 부분을 작성해주세요."
          />
        </div>
      </div>
    </div>
  );
}