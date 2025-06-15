'use client';
import { ProjectDetail } from '../../types/portfolio.types';

interface ProjectDetailsProps {
  projectDetails: ProjectDetail[];
  currentCourse?: string;
}

export default function ProjectDetails({ projectDetails, currentCourse }: ProjectDetailsProps) {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">주요 프로젝트</h2>
      <div className="space-y-8">
        {/* 수행 중인 과정 */}
        {currentCourse && (
          <div className="border-l-4 border-green-500 pl-6 bg-green-50/50 p-4 rounded-r-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">수행 중인 과정</h3>
            <p className="text-gray-700 mb-4">{currentCourse}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">상태</h4>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
                  진행 중
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">분류</h4>
                <p className="text-gray-600">교육 과정</p>
              </div>
            </div>
          </div>
        )}