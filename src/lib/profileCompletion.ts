import { JobSeekerProfile } from '@/types';

export interface ProfileCompletionResult {
  percentage: number;
  completedItems: string[];
  missingItems: string[];
  totalItems: number;
  completedCount: number;
}

export const calculateProfileCompletion = (
  profile: JobSeekerProfile | null,
  hasPortfolio: boolean = false
): ProfileCompletionResult => {
  console.log('🔍 calculateProfileCompletion 호출됨');
  console.log('📊 입력 데이터:', { profile, hasPortfolio });
  
  const items = [
    { key: 'skills', label: '보유 스킬', check: () => profile?.skills && profile.skills.length > 0 },
    { key: 'languages', label: '언어', check: () => profile?.languages && profile.languages.length > 0 },
    { key: 'experience', label: '경력', check: () => profile?.experience && profile.experience.length > 0 },
    { key: 'education', label: '학력', check: () => profile?.education && profile.education.length > 0 },
    { key: 'speciality', label: '전문분야', check: () => profile?.speciality && profile.speciality.trim() !== '' },
    { key: 'phone', label: '연락처', check: () => profile?.phone && profile.phone.trim() !== '' },
    { key: 'address', label: '주소', check: () => profile?.address && profile.address.trim() !== '' },
    { key: 'portfolio', label: '포트폴리오 등록', check: () => hasPortfolio },
    { key: 'profileImage', label: '프로필 사진', check: () => profile?.profileImage && profile.profileImage.trim() !== '' },
    { key: 'selfIntroduction', label: '자기소개서', check: () => {
      const intro = profile?.selfIntroduction;
      return intro && (intro.motivation || intro.personality || intro.experience || intro.aspiration);
    }},
  ];

  const completedItems: string[] = [];
  const missingItems: string[] = [];

  items.forEach(item => {
    const isCompleted = item.check();
    console.log(`✅ ${item.label} (${item.key}): ${isCompleted ? '완성' : '미완성'}`);
    if (item.key === 'skills') {
      console.log('   - skills 데이터:', profile?.skills);
    }
    if (item.key === 'languages') {
      console.log('   - languages 데이터:', profile?.languages);
    }
    if (item.key === 'portfolio') {
      console.log('   - hasPortfolio:', hasPortfolio);
    }
    
    if (isCompleted) {
      completedItems.push(item.label);
    } else {
      missingItems.push(item.label);
    }
  });

  const completedCount = completedItems.length;
  const totalItems = items.length;
  const percentage = Math.round((completedCount / totalItems) * 100);

  console.log(`📈 최종 결과: ${completedCount}/${totalItems} = ${percentage}%`);
  console.log('✅ 완성된 항목:', completedItems);
  console.log('❌ 미완성 항목:', missingItems);

  return {
    percentage,
    completedItems,
    missingItems,
    totalItems,
    completedCount
  };
}; 