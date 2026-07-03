'use client';

import { CheckIcon } from '@heroicons/react/24/solid';
import { motion, useReducedMotion } from 'framer-motion';

interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  variant?: 'classic' | 'rail';
}

export default function StepNavigation({
  steps,
  currentStep,
  onStepClick,
  variant = 'classic',
}: StepNavigationProps) {
  const reduce = useReducedMotion();

  if (variant === 'rail') {
    return (
      <div className="w-full">
        <div className="md:hidden">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-azure-600">
              단계 {currentStep} / {steps.length}
            </span>
            <span className="truncate text-sm font-semibold text-ink-800">
              {steps.find(step => step.id === currentStep)?.name}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full border border-white/60 bg-azure-50/80">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-azure-400 via-sky-cool-400 to-azure-600"
              initial={false}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <div className="hidden gap-2 md:grid md:grid-cols-2 xl:grid-cols-1">
          {steps.map((step) => {
            const isComplete = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <motion.button
                key={step.id}
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={!onStepClick}
                whileHover={onStepClick && !reduce ? { x: 3 } : undefined}
                whileTap={onStepClick && !reduce ? { scale: 0.98 } : undefined}
                className={`
                  group flex min-h-[58px] w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left
                  transition-all duration-200
                  ${isCurrent
                    ? 'border-azure-200 bg-white/85 text-ink-900 shadow-glass'
                    : isComplete
                    ? 'border-white/70 bg-white/60 text-ink-700 shadow-glass-sm'
                    : 'border-white/50 bg-white/35 text-ink-500 hover:bg-white/65 hover:text-ink-800'
                  }
                `}
              >
                <span
                  className={`
                    flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold
                    ${isComplete || isCurrent
                      ? 'bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow'
                      : 'bg-azure-50 text-ink-400 ring-1 ring-inset ring-white/70'
                    }
                  `}
                >
                  {isComplete ? <CheckIcon className="h-5 w-5" /> : step.id}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{step.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-ink-400">{step.description}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full glass-card rounded-4xl px-6 py-6 md:px-10 md:py-8 shadow-glass">
      {/* 모바일 버전 */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-tight text-azure-600">
            단계 {currentStep} / {steps.length}
          </span>
          <span className="text-sm font-medium text-ink-700">
            {steps.find(step => step.id === currentStep)?.name}
          </span>
        </div>
        <div className="w-full bg-azure-50/80 rounded-full h-2.5 border border-white/60 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-azure-400 via-sky-cool-400 to-azure-600 shadow-glow"
            initial={false}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* 데스크톱 버전 */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const isComplete = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* 단계 원 */}
                <div className="flex flex-col items-center">
                  <motion.button
                    onClick={() => onStepClick?.(step.id)}
                    whileHover={onStepClick && !reduce ? { y: -4 } : undefined}
                    whileTap={onStepClick && !reduce ? { scale: 0.94 } : undefined}
                    className={`
                      relative flex h-14 w-14 items-center justify-center rounded-2xl
                      transition-all duration-300 ease-out border
                      ${isComplete
                        ? 'bg-gradient-to-br from-azure-400 to-azure-600 text-white border-white/60 shadow-glass'
                        : isCurrent
                        ? 'bg-gradient-to-br from-azure-500 to-azure-600 text-white border-white/70 shadow-glass-lg'
                        : 'glass-strong text-ink-400 border-white/60 hover:text-azure-600'
                      }
                    `}
                    disabled={!onStepClick}
                  >
                    {/* 활성 링 표시 — 부드러운 슬라이드 */}
                    {isCurrent && (
                      <motion.span
                        layoutId="step-active-ring"
                        className="absolute -inset-1.5 rounded-3xl ring-2 ring-azure-300/70 ring-offset-2 ring-offset-white/40 pointer-events-none"
                        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    {isComplete ? (
                      <CheckIcon className="h-6 w-6" />
                    ) : (
                      <span className="font-display text-base font-bold">
                        {step.id}
                      </span>
                    )}
                  </motion.button>

                  {/* 단계 텍스트 */}
                  <div className="mt-4 text-center">
                    <p className={`text-sm font-semibold tracking-tight transition-colors duration-300 ${
                      step.id <= currentStep ? 'text-ink-900' : 'text-ink-400'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-ink-400 mt-1 max-w-24 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* 연결선 */}
                {stepIdx !== steps.length - 1 && (
                  <div className="flex-1 mx-4 -mt-12">
                    <div className="h-1 rounded-full bg-azure-50/80 border border-white/50 relative overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-azure-400 to-azure-600"
                        initial={false}
                        animate={{ width: step.id < currentStep ? '100%' : '0%' }}
                        transition={reduce ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
