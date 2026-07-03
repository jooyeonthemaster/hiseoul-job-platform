'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DocumentUpload from '@/components/DocumentUpload';
import { DocumentList } from '@/components/DocumentUpload';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

interface UploadedDocument {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  publicId: string;
}

export default function TestDocumentUploadPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleUploadSuccess = (document: UploadedDocument) => {
    setDocuments(prev => [...prev, document]);
    setMessage(`${document.fileName} 파일이 성공적으로 업로드되었습니다!`);
    setMessageType('success');

    // 3초 후 메시지 제거
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUploadError = (error: string) => {
    setMessage(error);
    setMessageType('error');

    // 5초 후 메시지 제거
    setTimeout(() => setMessage(''), 5000);
  };

  const handleRemoveDocument = (publicId: string) => {
    setDocuments(prev => prev.filter(doc => doc.publicId !== publicId));
    setMessage('문서가 목록에서 제거되었습니다.');
    setMessageType('success');

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="relative min-h-screen pt-28 pb-24 overflow-hidden">
      <AuroraBackground />

      <div className="relative z-10 container-wide">
        <SectionHeading
          align="left"
          eyebrow="Internal Tool"
          title={
            <>
              문서 <span className="text-gradient-azure">업로드 테스트</span>
            </>
          }
          subtitle="클라우디너리 직접 업로드 방식을 점검하는 내부 도구입니다."
          className="max-w-2xl"
        />

        {/* 메시지 표시 */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`mt-10 flex items-center gap-3 rounded-3xl px-5 py-4 backdrop-blur-xl border shadow-glass ${
                messageType === 'success'
                  ? 'bg-mint-100/70 text-mint-600 border-mint-400/40'
                  : 'bg-coral-100/70 text-coral-600 border-coral-400/40'
              }`}
            >
              {messageType === 'success' ? (
                <CheckCircleIcon className="w-6 h-6 shrink-0" />
              ) : (
                <ExclamationCircleIcon className="w-6 h-6 shrink-0" />
              )}
              <span className="font-medium">{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* 업로드 섹션 */}
          <ScrollReveal className="lg:col-span-7">
            <GlassCard strong className="p-7 sm:p-10">
              <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-ink-900 mb-6">
                <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shadow-glow shrink-0">
                  <CloudArrowUpIcon className="w-6 h-6 text-white" />
                </span>
                새 문서 업로드 (클라이언트 직접 업로드)
              </h2>

              <div className="mb-6 glass rounded-3xl p-5 border border-white/60">
                <div className="flex items-start gap-3 text-sm text-ink-700 leading-relaxed">
                  <SparklesIcon className="w-5 h-5 text-azure-500 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-ink-900">새로운 업로드 방식:</strong> 파일이 서버를 거치지 않고 클라우디너리에 직접 업로드됩니다.
                    <br />
                    <span className="inline-flex items-center gap-1.5 mt-1">
                      <RocketLaunchIcon className="w-4 h-4 text-azure-500" />
                      <strong className="text-ink-900">장점:</strong> Vercel 4.5MB 제한 없음, 더 빠른 업로드, 서버 부하 감소
                    </span>
                  </p>
                </div>
              </div>

              <DocumentUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                maxSize={50} // 50MB로 증가 (Vercel 제한 없음)
                className="mb-6"
              />

              <div className="glass rounded-3xl p-5 sm:p-6 border border-white/60 text-sm text-ink-500">
                <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-azure-500" />
                  지원되는 파일 형식
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge tone="azure">문서: PDF, DOC, DOCX, HWP, TXT, RTF</Badge>
                  <Badge tone="azure">스프레드시트: XLS, XLSX</Badge>
                  <Badge tone="azure">프레젠테이션: PPT, PPTX</Badge>
                  <Badge tone="azure">압축파일: ZIP, RAR</Badge>
                </div>
                <ul className="space-y-2 text-xs text-ink-400 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-azure-500 shrink-0 mt-1.5" />
                    <span>최대 파일 크기: <strong className="text-ink-700">50MB</strong> (기존 20MB에서 증가!)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-azure-500 shrink-0 mt-1.5" />
                    <span>업로드된 파일은 클라우디너리에 직접 저장되며 다운로드 링크가 제공됩니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-azure-500 shrink-0 mt-1.5" />
                    <span><strong className="text-ink-700">Vercel 4.5MB 제한을 우회</strong>하여 큰 파일도 업로드 가능합니다.</span>
                  </li>
                </ul>
              </div>
            </GlassCard>
          </ScrollReveal>

          {/* 사이드 컬럼: 목록 + 사용법 */}
          <div className="lg:col-span-5 space-y-6 lg:space-y-8">
            {/* 업로드된 문서 목록 */}
            <ScrollReveal delay={0.06}>
              <GlassCard className="p-7 sm:p-8">
                <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-ink-900 mb-5">
                  <span className="w-11 h-11 rounded-2xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-600 shadow-glass-sm shrink-0">
                    <ListBulletIcon className="w-6 h-6" />
                  </span>
                  <span className="flex items-center gap-2">
                    업로드된 문서
                    <Badge tone="neutral">{documents.length}개</Badge>
                  </span>
                </h2>
                <DocumentList
                  documents={documents}
                  onRemove={handleRemoveDocument}
                />
              </GlassCard>
            </ScrollReveal>

            {/* 사용법 안내 */}
            <ScrollReveal delay={0.12}>
              <GlassCard className="p-7 sm:p-8">
                <h3 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-azure-500" />
                  사용법
                </h3>
                <ol className="space-y-3 text-sm text-ink-500 leading-relaxed">
                  {[
                    '위의 업로드 영역에 파일을 드래그하거나 클릭하여 파일을 선택하세요.',
                    '지원되는 파일 형식인지 확인하고 업로드 버튼을 클릭하세요.',
                    '업로드가 완료되면 아래 목록에 파일이 표시됩니다.',
                    '다운로드 버튼을 클릭하면 파일을 다운로드할 수 있습니다.',
                    'X 버튼을 클릭하면 목록에서 파일을 제거할 수 있습니다 (실제 파일은 클라우디너리에 남아있음).',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-xl bg-gradient-to-br from-azure-400 to-azure-600 text-white text-xs font-bold flex items-center justify-center shadow-glow shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
