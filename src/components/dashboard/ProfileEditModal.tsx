'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { Field, GlassInput, GlassSelect } from '@/components/ui/GlassField';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  onSave: (data: any) => Promise<void>;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  formData: initialData,
  onSave
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const reduce = useReducedMotion();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            {/* 오버레이 */}
            <motion.div
              className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* 글래스 패널 */}
            <motion.div
              className="glass-strong relative w-full max-w-2xl rounded-4xl shadow-glass-lg p-7 sm:p-9"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* 상단 오로라 하이라이트 */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 right-6 h-40 w-40 rounded-full bg-azure-300/30 blur-3xl"
              />

              <div className="relative flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow">
                    <PencilSquareIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-azure-600">
                      PROFILE
                    </p>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900">
                      프로필 편집
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="닫기"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 backdrop-blur-md border border-white/70 text-ink-400 shadow-glass-sm transition-all duration-200 hover:bg-white/90 hover:text-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/60"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="relative space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="이름" required>
                    <GlassInput
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </Field>
                  <Field label="전화번호">
                    <GlassInput
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                    />
                  </Field>

                  <Field label="주소">
                    <GlassInput
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                    />
                  </Field>

                  <Field label="전문분야">
                    <GlassSelect
                      name="speciality"
                      value={formData.speciality || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">선택하세요</option>
                      <option value="SNS마케팅">SNS마케팅</option>
                      <option value="키워드광고">키워드광고</option>
                      <option value="브랜드마케팅">브랜드마케팅</option>
                      <option value="퍼포먼스마케팅">퍼포먼스마케팅</option>
                      <option value="콘텐츠마케팅">콘텐츠마케팅</option>
                      <option value="마케팅기획">마케팅기획</option>
                      <option value="이커머스마케팅">이커머스마케팅</option>
                      <option value="데이터마케팅">데이터마케팅</option>
                      <option value="웹개발">웹개발</option>
                      <option value="앱개발">앱개발</option>
                      <option value="디자인">디자인</option>
                      <option value="기타">기타</option>
                    </GlassSelect>
                  </Field>
                </div>

                <Field label="보유 스킬 (쉼표로 구분)">
                  <GlassInput
                    type="text"
                    name="skills"
                    value={formData.skills || ''}
                    onChange={handleInputChange}
                    placeholder="예: JavaScript, React, Node.js"
                  />
                </Field>

                <Field label="사용 가능 언어 (쉼표로 구분)">
                  <GlassInput
                    type="text"
                    name="languages"
                    value={formData.languages || ''}
                    onChange={handleInputChange}
                    placeholder="예: 한국어, 영어, 일본어"
                  />
                </Field>

                <div className="flex justify-end gap-3 pt-2">
                  <GlassButton type="button" variant="secondary" onClick={onClose}>
                    취소
                  </GlassButton>
                  <GlassButton type="submit" variant="primary" disabled={loading}>
                    {loading ? '저장 중...' : '저장'}
                  </GlassButton>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
