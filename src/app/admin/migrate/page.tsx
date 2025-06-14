'use client';

import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GoogleSheetsService } from '@/lib/googleSheets';

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Firebase → Google Sheets 데이터 마이그레이션
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              기존 Firebase 데이터를 Google Sheets로 일괄 전송합니다.
              이 작업은 한 번만 실행하면 됩니다.
            </p>
            
            <button
              onClick={startMigration}
              disabled={migrating}
              className={`px-6 py-3 rounded-md text-white font-medium ${
                migrating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {migrating ? '마이그레이션 진행중...' : '마이그레이션 시작'}
            </button>
          </div>

          {/* 진행 상황 */}
          <div className="space-y-4 mb-6">
            {Object.entries(progress).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                  <span>
                    {key === 'jobSeekers' && '구직자'}
                    {key === 'employers' && '기업회원'}
                    {key === 'portfolios' && '포트폴리오'}
                    {key === 'jobInquiries' && '채용제안'}
                  </span>
                  <span>{value.completed} / {value.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: value.total > 0 
                        ? `${(value.completed / value.total) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 로그 */}
          {logs.length > 0 && (
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-2">실행 로그</h3>
              <div className="text-xs text-gray-600 space-y-1 max-h-64 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}