// 초기 데이터 동기화를 위한 훅
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GoogleSheetsService } from '@/lib/googleSheets';

export function useInitialDataSync() {
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    // 이미 동기화했는지 확인
    const syncedBefore = localStorage.getItem('initialSyncCompleted');
    if (syncedBefore === 'true') {
      setSynced(true);
      return;
    }

    const syncInitialData = async () => {
      console.log('초기 데이터 동기화 시작...');
      
      try {
        // 구직자 동기화
        const jobSeekersSnapshot = await getDocs(collection(db, 'jobSeekers'));
        console.log(`구직자 ${jobSeekersSnapshot.size}명 발견`);
        
        for (const doc of jobSeekersSnapshot.docs) {
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
          
          // 과부하 방지
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // 기업 동기화
        const employersSnapshot = await getDocs(collection(db, 'employers'));
        console.log(`기업 ${employersSnapshot.size}개 발견`);
        
        for (const doc of employersSnapshot.docs) {
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
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // 동기화 완료 표시
        localStorage.setItem('initialSyncCompleted', 'true');
        setSynced(true);
        console.log('초기 데이터 동기화 완료!');
        
      } catch (error) {
        console.error('초기 데이터 동기화 실패:', error);
      }
    };

    syncInitialData();
  }, []);

  return { synced };
}
