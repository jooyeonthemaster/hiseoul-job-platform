'use client';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import { WorkHistory as WorkHistoryType } from '../../types/portfolio.types';

interface WorkHistoryProps {
  workHistory: WorkHistoryType[];
}

export default function WorkHistory({ workHistory }: WorkHistoryProps) {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">경력사항</h2>
      <div className="space-y-6">
        {workHistory.map((work, index) => (
          <div key={index} className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BriefcaseIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{work.position}</h3>
              <p className="text-blue-600 font-medium">{work.company}</p>
              <p className="text-gray-500 text-sm mb-2">{work.period}</p>
              <p className="text-gray-700">{work.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}