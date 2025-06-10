'use client';

import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function StepNavigation({ 
  steps, 
  currentStep, 
  onStepClick 
}: StepNavigationProps) {
  return (
    <div className="w-full">
      {/* 모바일 버전 */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            단계 {currentStep} / {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {steps.find(step => step.id === currentStep)?.name}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 데스크톱 버전 */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, stepIdx) => (
            <div key={step.id} className="flex items-center flex-1">
              {/* 단계 원 */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(step.id)}
                  className={`
                    relative flex h-12 w-12 items-center justify-center rounded-full
                    transition-all duration-200 shadow-sm
                    ${step.id < currentStep
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : step.id === currentStep
                      ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100'
                      : 'bg-white border-2 border-gray-300 text-gray-500 hover:border-gray-400'
                    }
                  `}
                  disabled={!onStepClick}
                >
                  {step.id < currentStep ? (
                    <CheckIcon className="h-6 w-6" />
                  ) : (
                    <span className="text-sm font-bold">
                      {step.id}
                    </span>
                  )}
                </button>
                
                {/* 단계 텍스트 */}
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-20">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* 연결선 */}
              {stepIdx !== steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="h-0.5 bg-gray-200 relative">
                    <div
                      className={`h-full bg-indigo-600 transition-all duration-500`}
                      style={{
                        width: step.id < currentStep ? '100%' : '0%'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}