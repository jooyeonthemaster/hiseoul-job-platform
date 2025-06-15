'use client';
import { SelfIntroduction as SelfIntroductionType } from '../../types/portfolio.types';

interface SelfIntroductionProps {
  selfIntroduction?: SelfIntroductionType;
}

export default function SelfIntroduction({ selfIntroduction }: SelfIntroductionProps) {
  if (!selfIntroduction) return null;

  const sections = [
    { 
      title: '지원 동기', 
      content: selfIntroduction.motivation,
      color: 'border-blue-500'
    },
    { 
      title: '성격의 장단점', 
      content: selfIntroduction.personality,
      color: 'border-green-500'
    },
    { 
      title: '경험 및 역량', 
      content: selfIntroduction.experience,
      color: 'border-purple-500'
    },
    { 
      title: '입사 후 포부', 
      content: selfIntroduction.aspiration,
      color: 'border-orange-500'
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">상세 자기소개</h2>
      <div className="space-y-6">
        {sections.map((section, index) => 
          section.content && (
            <div key={index} className={`border-l-4 ${section.color} pl-6`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}