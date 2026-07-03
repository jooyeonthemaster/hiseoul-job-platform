'use client';

import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  ArrowPathIcon,
  CircleStackIcon,
  TableCellsIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';

const PROGRESS_LABELS: Record<string, string> = {
  jobSeekers: '구직자',
  employers: '기업회원',
  portfolios: '포트폴리오',
  jobInquiries: '채용제안',
};

export default function DataMigrationPage() {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState({
    jobSeekers: { total: 0, completed: 0 },
    employers: { total: 0, completed: 0 },
    portfolios: { total: 0, completed: 0 },
    jobInquiries: { total: 0, completed: 0 },
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const migrateJobSeekers = async () => {
    addLog('구직자 데이터 마이그레이션 시작...');
    const querySnapshot = await getDocs(collection(db, 'jobSeekers'));
    const total = querySnapshot.size;
    let completed = 0;

    setProgress(prev => ({ ...prev, jobSeekers: { total, completed: 0 } }));

    for (const doc of querySnapshot.docs) {
      try {
        const data = doc.data();
        await GoogleSheetsService.addJobSeeker({
          uid: doc.id,
          name: data.name || data.displayName || '미입력',
          email: data.email || '',
          phone: data.phone || '',
          skills: data.skills || [],
          experience: data.experience || '',
          education: data.education || '',
          languages: data.languages || [],
          bio: data.bio || '',
          expectedSalary: data.expectedSalary || '',
          preferredLocation: data.preferredLocation || '',
          profileCompleteness: data.profileCompleteness || '0%',
          status: 'active',
        });

        completed++;
        setProgress(prev => ({ ...prev, jobSeekers: { total, completed } }));

        // 과부하 방지를 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        addLog(`❌ 구직자 ${doc.id} 마이그레이션 실패: ${error}`);
      }
    }

    addLog(`✅ 구직자 마이그레이션 완료: ${completed}/${total}`);
  };
  const migrateEmployers = async () => {
    addLog('기업 데이터 마이그레이션 시작...');
    const querySnapshot = await getDocs(collection(db, 'employers'));
    const total = querySnapshot.size;
    let completed = 0;

    setProgress(prev => ({ ...prev, employers: { total, completed: 0 } }));

    for (const doc of querySnapshot.docs) {
      try {
        const data = doc.data();
        await GoogleSheetsService.addEmployer({
          uid: doc.id,
          companyName: data.companyName || data.company?.name || '미입력',
          contactName: data.contactName || '',
          email: data.email || '',
          phone: data.phone || '',
          industry: data.industry || data.company?.industry || '',
          employeeCount: data.employeeCount || data.company?.size || '',
          address: data.address || data.company?.location || '',
          website: data.website || data.company?.website || '',
          description: data.description || data.company?.description || '',
          approvalStatus: data.approvalStatus || 'pending',
        });

        // 승인 대기중인 경우 승인요청도 추가
        if (data.approvalStatus === 'pending') {
          await GoogleSheetsService.addApprovalRequest({
            companyName: data.companyName || data.company?.name || '',
            contactName: data.contactName || '',
            email: data.email || '',
            phone: data.phone || '',
            businessNumber: data.businessNumber || '',
          });
        }

        completed++;
        setProgress(prev => ({ ...prev, employers: { total, completed } }));
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        addLog(`❌ 기업 ${doc.id} 마이그레이션 실패: ${error}`);
      }
    }

    addLog(`✅ 기업 마이그레이션 완료: ${completed}/${total}`);
  };
  const migratePortfolios = async () => {
    addLog('포트폴리오 데이터 마이그레이션 시작...');
    const querySnapshot = await getDocs(collection(db, 'portfolios'));
    const total = querySnapshot.size;
    let completed = 0;

    setProgress(prev => ({ ...prev, portfolios: { total, completed: 0 } }));

    for (const doc of querySnapshot.docs) {
      try {
        const data = doc.data();
        // 포트폴리오 소유자 정보 가져오기
        let jobSeekerName = '미입력';
        if (data.userId) {
          const userSnapshot = await getDocs(collection(db, 'jobSeekers'));
          const user = userSnapshot.docs.find(d => d.id === data.userId);
          if (user) {
            jobSeekerName = user.data().name || user.data().displayName || '미입력';
          }
        }

        await GoogleSheetsService.addPortfolio({
          uid: doc.id,
          jobSeekerName,
          title: data.title || '제목 없음',
          description: data.description || '',
          technologies: data.technologies || data.skills || [],
          projectUrl: data.projectUrl || data.links?.[0]?.url || '',
          githubUrl: data.githubUrl || '',
          viewCount: data.viewCount || 0,
          likeCount: data.likeCount || 0,
          isPublic: data.isPublic !== false,
        });

        completed++;
        setProgress(prev => ({ ...prev, portfolios: { total, completed } }));
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        addLog(`❌ 포트폴리오 ${doc.id} 마이그레이션 실패: ${error}`);
      }
    }

    addLog(`✅ 포트폴리오 마이그레이션 완료: ${completed}/${total}`);
  };
  const migrateJobInquiries = async () => {
    addLog('채용제안 데이터 마이그레이션 시작...');
    const querySnapshot = await getDocs(collection(db, 'jobInquiries'));
    const total = querySnapshot.size;
    let completed = 0;

    setProgress(prev => ({ ...prev, jobInquiries: { total, completed: 0 } }));

    for (const doc of querySnapshot.docs) {
      try {
        const data = doc.data();
        await GoogleSheetsService.addJobInquiry({
          companyName: data.companyInfo?.name || data.companyName || '미입력',
          jobSeekerName: data.jobSeekerName || '미입력',
          title: data.proposedPosition || data.title || '제목 없음',
          message: data.message || '',
          salaryOffer: data.proposedSalary || '',
          employmentType: data.employmentType || '정규직',
          status: data.status || 'sent',
        });

        completed++;
        setProgress(prev => ({ ...prev, jobInquiries: { total, completed } }));
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        addLog(`❌ 채용제안 ${doc.id} 마이그레이션 실패: ${error}`);
      }
    }

    addLog(`✅ 채용제안 마이그레이션 완료: ${completed}/${total}`);
  };

  const startMigration = async () => {
    setMigrating(true);
    setLogs([]);

    try {
      await migrateJobSeekers();
      await migrateEmployers();
      await migratePortfolios();
      await migrateJobInquiries();

      addLog('🎉 모든 데이터 마이그레이션 완료!');
    } catch (error) {
      addLog(`❌ 마이그레이션 중 오류 발생: ${error}`);
    } finally {
      setMigrating(false);
    }
  };
  return (
    <div className="relative min-h-screen overflow-hidden py-20 md:py-28">
      <AuroraBackground />

      <div className="relative z-10 container-wide">
        <ScrollReveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold tracking-[0.18em] uppercase bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 shadow-glass-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
            ADMIN · DATA MIGRATION
          </span>
          <h1 className="font-display font-bold tracking-tight text-ink-900 text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
            Firebase → Google Sheets 데이터 마이그레이션
          </h1>
          <p className="mt-5 text-ink-500 text-base md:text-lg leading-relaxed">
            기존 Firebase 데이터를 Google Sheets로 일괄 전송합니다.
            이 작업은 한 번만 실행하면 됩니다.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.05} className="mt-12">
          <GlassCard strong className="p-8 sm:p-10">
            {/* 데이터 흐름 안내 + 실행 */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-azure-50 text-azure-600 shadow-glass-sm">
                  <CircleStackIcon className="h-7 w-7" />
                </div>
                <ArrowPathIcon className="h-6 w-6 text-azure-400" />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-azure-50 text-azure-600 shadow-glass-sm">
                  <TableCellsIcon className="h-7 w-7" />
                </div>
                <div className="ml-2">
                  <p className="font-semibold text-ink-900">Firebase → Sheets</p>
                  <p className="text-sm text-ink-400">단방향 일괄 전송</p>
                </div>
              </div>

              <GlassButton
                onClick={startMigration}
                disabled={migrating}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <ArrowPathIcon className={migrating ? 'h-5 w-5 animate-spin' : 'h-5 w-5'} />
                {migrating ? '마이그레이션 진행중...' : '마이그레이션 시작'}
              </GlassButton>
            </div>

            {/* 진행 상황 */}
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {Object.entries(progress).map(([key, value]) => {
                const pct = value.total > 0 ? (value.completed / value.total) * 100 : 0;
                const isDone = value.total > 0 && value.completed >= value.total;
                return (
                  <div
                    key={key}
                    className="rounded-3xl border border-white/60 bg-white/50 p-5 shadow-glass-sm backdrop-blur-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-semibold text-ink-900">
                        {PROGRESS_LABELS[key]}
                      </span>
                      <Badge tone={isDone ? 'mint' : 'azure'}>
                        {value.completed} / {value.total}
                      </Badge>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-azure-100/70">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-azure-400 to-azure-600 transition-all duration-300"
                        style={{
                          width: value.total > 0
                            ? `${(value.completed / value.total) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium text-ink-400">
                      {Math.round(pct)}%
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 로그 */}
            {logs.length > 0 && (
              <div className="mt-10 overflow-hidden rounded-3xl border border-white/60 bg-ink-900/[0.04] shadow-glass-sm backdrop-blur-md">
                <div className="flex items-center gap-2 border-b border-ink-100 bg-azure-50/60 px-5 py-3">
                  <CommandLineIcon className="h-4 w-4 text-azure-600" />
                  <h3 className="text-sm font-semibold text-ink-700">실행 로그</h3>
                </div>
                <div className="max-h-64 space-y-1 overflow-y-auto px-5 py-4 font-mono text-xs leading-relaxed text-ink-500">
                  {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </ScrollReveal>
      </div>
    </div>
  );
}
