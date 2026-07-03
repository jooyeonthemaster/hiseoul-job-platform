import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  deleteUser,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, JobSeeker, Employer } from '@/types';

// Firebase Timestamp를 Date로 변환하는 헬퍼 함수
const convertTimestampsToDate = (data: any): any => {
  if (!data) return data;
  
  // Firebase Timestamp 객체 체크 (toDate 메서드 있는 경우)
  if (data && typeof data === 'object' && typeof data.toDate === 'function') {
    return data.toDate();
  }
  
  // Firebase Timestamp 객체 체크 (seconds 속성 있는 경우)
  if (data && typeof data === 'object' && 'seconds' in data && 'nanoseconds' in data) {
    return new Date(data.seconds * 1000);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertTimestampsToDate(item));
  }
  
  if (data && typeof data === 'object' && !(data instanceof Date)) {
    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertTimestampsToDate(value);
    }
    return converted;
  }
  
  return data;
};

// Date를 Firebase Timestamp로 변환하는 헬퍼 함수
const convertDatesToTimestamp = (data: any): any => {
  if (!data) return data;
  
  if (data instanceof Date) {
    console.log('Converting Date to Timestamp:', data);
    return Timestamp.fromDate(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertDatesToTimestamp(item));
  }
  
  if (data && typeof data === 'object' && !(data instanceof Timestamp) && !(data instanceof Date)) {
    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertDatesToTimestamp(value);
    }
    return converted;
  }
  
  return data;
};

// 이메일로 사용자 찾기
const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = {
        id: userDoc.id,
        ...userDoc.data(),
        createdAt: userDoc.data().createdAt?.toDate(),
        updatedAt: userDoc.data().updatedAt?.toDate()
      } as User;
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    // 에러가 발생해도 null을 반환하지 않고 에러를 던짐
    throw new Error('사용자 조회 중 오류가 발생했습니다.');
  }
};

// 회원가입
export const signUp = async (
  email: string, 
  password: string, 
  name: string, 
  role: 'jobseeker' | 'employer',
  employerInfo?: { companyName: string; position: string }
) => {
  try {
    // 이메일로 기존 사용자 확인
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error(`이미 ${existingUser.role === 'jobseeker' ? '구직자' : '기업'} 계정으로 가입된 이메일입니다.`);
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firebase Auth 프로필 업데이트
    await updateProfile(user, { displayName: name });

    // Firestore에 사용자 정보 저장
    const userData: Omit<User, 'createdAt' | 'updatedAt'> = {
      id: user.uid,
      email: user.email!,
      name,
      role,
      // 기업 회원가입 시 추가 정보 저장
      ...(role === 'employer' && employerInfo ? {
        companyName: employerInfo.companyName,
        position: employerInfo.position,
        isFirstLogin: true,
        hasCompletedSetup: false
      } : {}),
      // 구직자는 기본적으로 설정 완료로 처리
      ...(role === 'jobseeker' ? {
        isFirstLogin: false,
        hasCompletedSetup: true
      } : {})
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 역할별 추가 문서 생성
    if (role === 'jobseeker') {
      await setDoc(doc(db, 'jobseekers', user.uid), {
        userId: user.uid,
        profile: {
          skills: [],
          experience: [],
          education: [],
          languages: []
        }
      });
    } else if (role === 'employer') {
      await setDoc(doc(db, 'employers', user.uid), {
        userId: user.uid,
        company: {
          name: employerInfo?.companyName || '',
          industry: '',
          size: '',
          location: '',
          description: ''
        },
        approvalStatus: 'pending', // 승인 대기 상태로 설정
        createdAt: serverTimestamp()
      });

      // Google Sheets에 기업 회원가입 정보 기록
      if (employerInfo) {
        try {
          const { handleEmployerSignupComplete } = await import('@/lib/googleSheetsIntegration');
          await handleEmployerSignupComplete({
            uid: user.uid,
            companyName: employerInfo.companyName,
            contactName: name,
            email: user.email,
            position: employerInfo.position
          });
        } catch (error) {
          console.error('Google Sheets 기록 실패:', error);
          // Google Sheets 오류는 회원가입을 방해하지 않음
        }
      }
    }

    return { user, userData };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// 로그인
export const signIn = async (email: string, password: string, role: 'jobseeker' | 'employer') => {
  try {
    // 이메일로 기존 사용자 확인
    const existingUser = await findUserByEmail(email);
    
    if (existingUser) {
      if (existingUser.role !== role) {
        const errorMessage = `이 이메일은 ${existingUser.role === 'jobseeker' ? '구직자' : '기업'} 계정으로 등록되어 있습니다. 올바른 회원 유형을 선택해주세요.`;
        throw new Error(errorMessage);
      }
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 사용자 역할 재확인
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }

    const userData = userDoc.data();
    
    if (userData.role !== role) {
      throw new Error('선택하신 회원 유형이 일치하지 않습니다.');
    }

    return user;
  } catch (error: any) {
    console.error('Sign in error details:', {
      message: error.message,
      code: error.code,
      fullError: error
    });
    
    // Firebase 인증 에러 처리
    if (error.code === 'auth/user-not-found') {
      throw new Error('등록되지 않은 이메일입니다.');
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('비밀번호가 올바르지 않습니다.');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('올바르지 않은 이메일 형식입니다.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.');
    }
    
    // 커스텀 에러 메시지
    if (error.message.includes('계정으로 등록되어 있습니다') || 
        error.message === '선택하신 회원 유형이 일치하지 않습니다.' ||
        error.message === '사용자 조회 중 오류가 발생했습니다.') {
      throw new Error(error.message);
    }
    
    // 기본 에러 메시지
    throw new Error('로그인 중 오류가 발생했습니다.');
  }
};

// 로그아웃
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// 비밀번호 재설정
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// 사용자 데이터 가져오기
export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      // Timestamp를 Date로 변환
      return convertTimestampsToDate(data) as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// 구직자 프로필 가져오기
export const getJobSeekerProfile = async (uid: string) => {
  try {
    const profileDoc = await getDoc(doc(db, 'jobseekers', uid));
    if (profileDoc.exists()) {
      const data = profileDoc.data();
      // Timestamp를 Date로 변환
      return convertTimestampsToDate(data);
    }
    return null;
  } catch (error) {
    console.error('Error fetching job seeker profile:', error);
    return null;
  }
};

// 기업 정보 가져오기
export const getEmployerInfo = async (uid: string) => {
  try {
    const employerDoc = await getDoc(doc(db, 'employers', uid));
    if (employerDoc.exists()) {
      const data = employerDoc.data();
      // Timestamp를 Date로 변환
      return convertTimestampsToDate(data);
    }
    return null;
  } catch (error) {
    console.error('Error fetching employer info:', error);
    return null;
  }
};

// 프로필 업데이트
export const updateUserProfile = async (uid: string, profileData: any) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...profileData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// 구직자 프로필 업데이트
export const updateJobSeekerProfile = async (uid: string, profileData: any) => {
  try {
    console.log('Updating profile with data:', profileData);
    
    // undefined 값들을 필터링하는 함수
    const filterUndefined = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return null;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(filterUndefined);
      }
      
      if (typeof obj === 'object' && !(obj instanceof Date)) {
        const filtered: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            filtered[key] = filterUndefined(value);
          }
        }
        return filtered;
      }
      
      return obj;
    };

    const cleanedProfileData = filterUndefined(profileData);
    // Date 객체를 Timestamp로 변환
    const timestampProfileData = convertDatesToTimestamp(cleanedProfileData);
    
    console.log('Saving to Firebase with timestamps:', timestampProfileData);
    
    await updateDoc(doc(db, 'jobseekers', uid), {
      profile: timestampProfileData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating job seeker profile:', error);
    throw error;
  }
};

// 기업 정보 업데이트
export const updateEmployerInfo = async (uid: string, companyData: any) => {
  try {
    // Firestore의 employers 컬렉션 업데이트
    await setDoc(doc(db, 'employers', uid), {
      userId: uid,
      company: {
        name: companyData.name,
        ceoName: companyData.ceoName,
        industry: companyData.industry,
        businessType: companyData.businessType,
        size: companyData.size,
        location: companyData.location,
        website: companyData.website,
        description: companyData.description,
        // 담당자 정보 추가
        contactName: companyData.contactName,
        contactPosition: companyData.contactPosition,
        contactPhone: companyData.contactPhone,
        companyAttraction: companyData.companyAttraction
      }
    }, { merge: true });
    
    // users 컬렉션에서 설정 완료 플래그 업데이트
    await updateDoc(doc(db, 'users', uid), {
      hasCompletedSetup: true,
      isFirstLogin: false,
      updatedAt: serverTimestamp()
    });

    // Google Sheets에 기업 정보 업데이트
    try {
      const userData = await getUserData(uid);
      if (userData) {
        const { updateEmployer } = await import('@/lib/googleSheets');
        
        // 기업 규모를 직원수 숫자로 변환
        const getEmployeeCount = (size: string): string => {
          switch (size) {
            case '1-10': return '10';
            case '11-50': return '50';
            case '51-100': return '100';
            case '101-300': return '300';
            case '301-1000': return '1000';
            case '1000+': return '1000+';
            default: return size;
          }
        };

        await updateEmployer({
          uid: uid,
          companyName: companyData.name || '',
          contactName: companyData.contactName || '',
          email: userData.email || '',  // email로 통일
          phone: companyData.contactPhone || '',
          industry: companyData.industry || '',
          employeeCount: getEmployeeCount(companyData.size || ''),
          address: companyData.location || '',
          website: companyData.website || '',
          description: companyData.description || '',
        });
      }
    } catch (error) {
      console.error('Google Sheets 업데이트 실패:', error);
      // Google Sheets 오류는 기업 정보 업데이트를 방해하지 않음
    }
  } catch (error) {
    console.error('Error updating employer info:', error);
    throw error;
  }
};

// 인증 상태 리스너
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// 알림 생성
export const createNotification = async (notification: {
  userId: string;
  type: 'application' | 'like' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
}) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// 구글 로그인
export const signInWithGoogle = async (role: 'jobseeker' | 'employer') => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 이메일로 기존 사용자 확인
    const existingUser = await findUserByEmail(user.email!);
    
    if (existingUser) {
      // 기존 사용자가 다른 역할로 가입되어 있는 경우
      if (existingUser.role !== role) {
        await signOut(auth); // 로그아웃 처리
        const errorMessage = `이 Google 계정은 이미 ${existingUser.role === 'jobseeker' ? '구직자' : '기업'} 계정으로 등록되어 있습니다. 올바른 회원 유형을 선택해주세요.`;
        throw new Error(errorMessage);
      }
      return { user, isNewUser: false };
    }

    // 새 사용자 등록
    const userData: Omit<User, 'createdAt' | 'updatedAt'> = {
      id: user.uid,
      email: user.email!,
      name: user.displayName || '',
      role,
      // 기업 회원가입 시 첫 로그인 플래그 추가
      ...(role === 'employer' ? {
        isFirstLogin: true,
        hasCompletedSetup: false
      } : {
        isFirstLogin: false,
        hasCompletedSetup: true
      })
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 역할별 추가 문서 생성
    if (role === 'jobseeker') {
      await setDoc(doc(db, 'jobseekers', user.uid), {
        userId: user.uid,
        profile: {
          skills: [],
          experience: [],
          education: [],
          languages: []
        }
      });
    } else {
      await setDoc(doc(db, 'employers', user.uid), {
        userId: user.uid,
        company: {
          name: '',
          industry: '',
          size: '',
          location: '',
          description: ''
        }
      });
    }

    return { user, isNewUser: true };
  } catch (error: any) {
    console.error('Google sign in error details:', {
      message: error.message,
      code: error.code,
      fullError: error
    });
    
    // 팝업 관련 에러는 따로 처리
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('구글 로그인이 취소되었습니다.');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('팝업이 차단되었습니다. 팝업을 허용하고 다시 시도해주세요.');
    }
    
    // 커스텀 에러 메시지는 그대로 전달
    if (error.message.includes('계정으로 등록되어 있습니다')) {
      throw new Error(error.message);
    }
    
    throw new Error('구글 로그인 중 오류가 발생했습니다: ' + error.message);
  }
};

// 포트폴리오 등록/업데이트
export const registerPortfolio = async (uid: string, portfolioData: {
  name: string;
  speciality: string;
  phone?: string;
  address?: string;
  skills: string[];
  languages: string[];
  experience?: any[];
  education?: any[];
  description?: string;
  currentCourse?: string;
  courseType?: 'domestic' | 'foreign';
  certificates?: any[];
  awards?: any[];
  introVideo?: string;
  introVideos?: Array<{
    url: string;
    title?: string;
    addedAt: Date;
  }>;
  profileImage?: string;
  selfIntroduction?: {
    motivation?: string;
    personality?: string;
    experience?: string;
    aspiration?: string;
  };
  mediaContent?: any[];
  portfolioPdfs?: Array<{
    url: string;
    fileName: string;
    uploadedAt: Date;
  }>;
  additionalDocuments?: Array<{
    url: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    downloadUrl: string;
    publicId: string;
  }>;
}) => {
  try {
    const userData = await getUserData(uid);
    if (!userData || userData.role !== 'jobseeker') {
      throw new Error('구직자만 포트폴리오를 등록할 수 있습니다.');
    }

    const portfolio = {
      userId: uid,
      name: portfolioData.name,
      email: userData.email,
      speciality: portfolioData.speciality || '일반',
      phone: portfolioData.phone || '',
      address: portfolioData.address || '',
      skills: portfolioData.skills || [],
      languages: portfolioData.languages || [],
      experience: portfolioData.experience || [],
      education: portfolioData.education || [],
      description: portfolioData.description || '',
      currentCourse: portfolioData.currentCourse || '',
      courseType: portfolioData.courseType || null, // 내국인/외국인 과정 구분
      certificates: portfolioData.certificates || [],
      awards: portfolioData.awards || [],
      introVideo: portfolioData.introVideo || '',
      introVideos: portfolioData.introVideos || [],
      profileImage: portfolioData.profileImage || '',
      selfIntroduction: portfolioData.selfIntroduction || {
        motivation: '',
        personality: '',
        experience: '',
        aspiration: ''
      },
      mediaContent: portfolioData.mediaContent || [],
      portfolioPdfs: portfolioData.portfolioPdfs || [],
      additionalDocuments: portfolioData.additionalDocuments || [],
      isPublic: true,
      rating: 0,
      projects: 0,
      verified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'portfolios', uid), portfolio);
    return portfolio;
  } catch (error) {
    console.error('Error registering portfolio:', error);
    throw error;
  }
};

// 포트폴리오 조회
export const getPortfolio = async (uid: string, includeHidden: boolean = false) => {
  try {
    const portfolioDoc = await getDoc(doc(db, 'portfolios', uid));
    if (portfolioDoc.exists()) {
      const data = portfolioDoc.data();
      
      // 숨겨진 포트폴리오 체크 (관리자가 아닌 경우)
      if (!includeHidden && data.isHidden === true) {
        return null; // 숨겨진 포트폴리오는 접근 차단
      }
      
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return null;
  }
};

// 모든 포트폴리오 조회
export const getAllPortfolios = async (includeHidden: boolean = false) => {
  try {
    console.log('🔍 getAllPortfolios 시작 - includeHidden:', includeHidden);
    console.log('🔥 Firebase DB 상태:', db);
    
    // 모든 경우에 isPublic == true 조건만 사용 (인덱스 불필요)
    const portfoliosQuery = query(
      collection(db, 'portfolios'),
      where('isPublic', '==', true)
    );
    console.log('📊 생성된 쿼리:', portfoliosQuery);
    
    const querySnapshot = await getDocs(portfoliosQuery);
    console.log('📁 쿼리 결과:', querySnapshot);
    console.log('📊 문서 개수:', querySnapshot.docs.length);
    
    // 각 포트폴리오에 대해 사용자 프로필 이미지를 가져오기
    const portfolios = await Promise.all(
      querySnapshot.docs.map(async (portfolioDoc) => {
        const data = portfolioDoc.data();
        const userId = data.userId || portfolioDoc.id;
        
        // 사용자 프로필 이미지와 과정 정보 가져오기 (jobseekers 컬렉션에서)
        let profileImage = data.profileImage || '';
        let currentCourse = '';
        let courseType: 'domestic' | 'foreign' | null = data.courseType || null;
        try {
          const jobseekerDocRef = doc(db, 'jobseekers', userId);
          const jobseekerDoc = await getDoc(jobseekerDocRef);
          if (jobseekerDoc.exists()) {
            const jobseekerData = jobseekerDoc.data() as any;
            profileImage = jobseekerData.profile?.profileImage || data.profileImage || '';
            currentCourse = jobseekerData.profile?.currentCourse || '';
            // 내국인/외국인 과정 구분: jobseekers 프로필 우선, 없으면 portfolio 문서값 사용
            courseType = jobseekerData.profile?.courseType || data.courseType || null;
            console.log(`🖼️ getAllPortfolios - ${data.name}의 프로필 이미지:`, profileImage);
            console.log(`📚 getAllPortfolios - ${data.name}의 수행 과정:`, currentCourse);
          }
        } catch (error) {
          console.error('Error fetching user profile data:', error);
          // 에러가 발생해도 기존 데이터 사용
        }
        
        return {
          id: portfolioDoc.id,
          userId: userId,
          name: data.name || '',
          email: data.email || '',
          speciality: data.speciality || '',
          phone: data.phone || '',
          address: data.address || '',
          skills: data.skills || [],
          languages: data.languages || [],
          experience: data.experience || [],
          education: data.education || [],
          description: data.description || '',
          rating: data.rating || 0,
          projects: data.projects || 0,
          verified: data.verified || false,
          isPublic: data.isPublic || true,
          isHidden: data.isHidden || false, // 숨김 상태 추가
          profileImage: profileImage, // 실시간 프로필 이미지
          currentCourse: currentCourse, // 수행 중인 과정
          courseType: courseType, // 내국인('domestic') / 외국인('foreign') 과정 구분
          portfolioPdfs: data.portfolioPdfs || [],
          additionalDocuments: data.additionalDocuments || [],
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      })
    );
    
    // 클라이언트 사이드에서 숨김 처리 필터링 (인덱스 불필요)
    if (!includeHidden) {
      return portfolios.filter(portfolio => !portfolio.isHidden);
    }
    
    return portfolios;
  } catch (error) {
    console.error('❌ getAllPortfolios 에러:', error);
    console.error('❌ 에러 타입:', typeof error);
    console.error('❌ 에러 메시지:', error instanceof Error ? error.message : String(error));
    return [];
  }
};

// Firebase 연결 테스트 함수 추가
export const testFirebaseConnection = async () => {
  try {
    console.log('🔧 Firebase 연결 테스트 시작...');
    
    // 1. Database 연결 테스트
    const testCollection = collection(db, 'test');
    console.log('✅ Firestore 컬렉션 생성 성공');
    
    // 2. 실제 데이터 읽기 테스트 (공개 portfolios만 — 보안 규칙상 무제약 list는 비관리자에게 거부됨)
    const portfoliosRef = query(collection(db, 'portfolios'), where('isPublic', '==', true));
    const snapshot = await getDocs(portfoliosRef);
    console.log(`📊 Portfolios 컬렉션 총 문서 수: ${snapshot.docs.length}`);
    
    // 3. 각 문서의 기본 정보 출력
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`📄 문서 ${index + 1}: ID=${doc.id}, 이름=${data.name}, 공개여부=${data.isPublic}`);
    });
    
    return { success: true, totalDocs: snapshot.docs.length };
  } catch (error) {
    console.error('❌ Firebase 연결 테스트 실패:', error);
    return { success: false, error };
  }
};

// 포트폴리오 삭제
export const deletePortfolio = async (uid: string) => {
  try {
    await updateDoc(doc(db, 'portfolios', uid), {
      isPublic: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    throw error;
  }
};

// 모든 기업 정보 조회
export const getAllEmployers = async (includeHidden: boolean = false) => {
  try {
    // 보안 규칙(employers: 승인된 기업만 읽기 가능)과 쿼리를 일치시킨다.
    // - 공개 호출(includeHidden=false): approvalStatus == 'approved' 만 조회해야 규칙을 통과한다.
    //   (조건 없는 전체 조회는 pending/rejected까지 포함하므로 Firestore가 쿼리 전체를 거부함)
    // - 관리자 호출(includeHidden=true): admin catch-all 규칙으로 전체 조회 허용.
    const employersRef = collection(db, 'employers');
    const employersQuery = includeHidden
      ? employersRef
      : query(employersRef, where('approvalStatus', '==', 'approved'));
    const querySnapshot = await getDocs(employersQuery);
    
    const employers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        approvalStatus: data.approvalStatus || 'pending',
        isHidden: data.isHidden || false, // 숨김 상태 추가
        company: {
          name: data.company?.name || '',
          ceoName: data.company?.ceoName || '',
          industry: data.company?.industry || '',
          businessType: data.company?.businessType || '',
          size: data.company?.size || '',
          location: data.company?.location || '',
          website: data.company?.website || '',
          description: data.company?.description || '',
          // 담당자 정보 추가
          contactName: data.company?.contactName || '',
          contactPosition: data.company?.contactPosition || '',
          contactPhone: data.company?.contactPhone || '',
          companyAttraction: {
            workingHours: data.company?.companyAttraction?.workingHours || '',
            remoteWork: data.company?.companyAttraction?.remoteWork || false,
            averageSalary: data.company?.companyAttraction?.averageSalary || '',
            benefits: data.company?.companyAttraction?.benefits || [],
            growthOpportunity: data.company?.companyAttraction?.growthOpportunity || false,
            stockOptions: data.company?.companyAttraction?.stockOptions || false,
            trainingSupport: data.company?.companyAttraction?.trainingSupport || false,
            familyFriendly: data.company?.companyAttraction?.familyFriendly || false,
            etc: data.company?.companyAttraction?.etc || ''
          }
        },
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    }).filter(employer => employer.company.name); // 회사명이 있는 기업만 필터링
    
    // 클라이언트 사이드에서 숨김 처리 필터링 (인덱스 불필요)
    if (!includeHidden) {
      return employers.filter(employer => !employer.isHidden);
    }
    
    return employers;
  } catch (error) {
    console.error('Error fetching employers:', error);
    return [];
  }
};

// 개별 기업 정보 조회 (ID로)
export const getEmployerById = async (employerId: string) => {
  try {
    const employerDoc = await getDoc(doc(db, 'employers', employerId));
    if (employerDoc.exists()) {
      const data = employerDoc.data();
      return {
        id: employerDoc.id,
        userId: data.userId,
        approvalStatus: data.approvalStatus || 'pending',
        company: {
          name: data.company?.name || '',
          ceoName: data.company?.ceoName || '',
          industry: data.company?.industry || '',
          businessType: data.company?.businessType || '',
          size: data.company?.size || '',
          location: data.company?.location || '',
          website: data.company?.website || '',
          description: data.company?.description || '',
          // 담당자 정보 추가
          contactName: data.company?.contactName || '',
          contactPosition: data.company?.contactPosition || '',
          contactPhone: data.company?.contactPhone || '',
          companyAttraction: {
            workingHours: data.company?.companyAttraction?.workingHours || '',
            remoteWork: data.company?.companyAttraction?.remoteWork || false,
            averageSalary: data.company?.companyAttraction?.averageSalary || '',
            benefits: data.company?.companyAttraction?.benefits || [],
            growthOpportunity: data.company?.companyAttraction?.growthOpportunity || false,
            stockOptions: data.company?.companyAttraction?.stockOptions || false,
            trainingSupport: data.company?.companyAttraction?.trainingSupport || false,
            familyFriendly: data.company?.companyAttraction?.familyFriendly || false,
            etc: data.company?.companyAttraction?.etc || ''
          }
        },
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    }
    return null;
  } catch (error) {
    // 미승인/반려 기업은 보안 규칙(approved 또는 본인)상 비당사자가 읽을 수 없음 — 예상된 거부이므로 조용히 무시.
    // (예: 구직자가 찜한 기업이 이후 '반려'되면 마이페이지 찜 목록 로딩에서 permission-denied 발생)
    if ((error as { code?: string })?.code === 'permission-denied') {
      return null;
    }
    console.error('Error fetching employer by ID:', error);
    return null;
  }
};

// 관심 기업 관련 함수들
export const addToFavorites = async (userId: string, companyId: string) => {
  try {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      favoriteCompanies: arrayUnion(companyId),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

export const removeFromFavorites = async (userId: string, companyId: string) => {
  try {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      favoriteCompanies: arrayRemove(companyId),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

export const getFavoriteCompanies = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.favoriteCompanies || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching favorite companies:', error);
    return [];
  }
};

export const isFavoriteCompany = async (userId: string, companyId: string) => {
  try {
    const favorites = await getFavoriteCompanies(userId);
    return favorites.includes(companyId);
  } catch (error) {
    console.error('Error checking favorite company:', error);
    return false;
  }
};

// 관심 인재 관련 함수들
export const addToFavoriteTalents = async (userId: string, talentId: string) => {
  try {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      favoriteTalents: arrayUnion(talentId),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error adding to favorite talents:', error);
    return false;
  }
};

export const removeFromFavoriteTalents = async (userId: string, talentId: string) => {
  try {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      favoriteTalents: arrayRemove(talentId),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error removing from favorite talents:', error);
    return false;
  }
};

export const getFavoriteTalents = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.favoriteTalents || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching favorite talents:', error);
    return [];
  }
};

export const isFavoriteTalent = async (userId: string, talentId: string) => {
  try {
    const favorites = await getFavoriteTalents(userId);
    return favorites.includes(talentId);
  } catch (error) {
    console.error('Error checking favorite talent:', error);
    return false;
  }
};

// 기업 승인 상태 확인
export const checkEmployerApprovalStatus = async (employerId: string): Promise<'pending' | 'approved' | 'rejected' | null> => {
  try {
    const employerDoc = await getDoc(doc(db, 'employers', employerId));
    if (employerDoc.exists()) {
      const data = employerDoc.data();
      return data.approvalStatus || 'pending';
    }
    return null;
  } catch (error) {
    console.error('Error checking employer approval status:', error);
    return null;
  }
};

// 포트폴리오 접근 권한 확인 (승인된 기업 회원만 접근 가능)
export const canAccessPortfolio = async (userId: string): Promise<boolean> => {
  try {
    // 사용자 정보 확인
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    
    // 어드민은 항상 접근 가능
    if (userData.role === 'admin' || userData.isAdmin === true) {
      return true;
    }
    
    // 승인된 기업 회원만 접근 가능
    if (userData.role === 'employer') {
      const approvalStatus = await checkEmployerApprovalStatus(userId);
      return approvalStatus === 'approved';
    }
    
    // 구직자 및 기타 역할은 접근 불가
    return false;
  } catch (error) {
    console.error('Error checking portfolio access:', error);
    return false;
  }
};

// 기업 정보 가져오기 (승인 상태 포함)
export const getEmployerWithApprovalStatus = async (employerId: string) => {
  try {
    const employerDoc = await getDoc(doc(db, 'employers', employerId));
    if (employerDoc.exists()) {
      const data = employerDoc.data();
      return {
        ...data,
        id: employerDoc.id,
        approvalStatus: data.approvalStatus || 'pending'
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching employer with approval status:', error);
    return null;
  }
};

// 회원 탈퇴 (테스트용 - 데이터 삭제 + 로그아웃)
export const deleteUserAccount = async (uid: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error('로그인된 사용자가 없습니다.');
    }

    // 사용자 데이터 가져오기
    const userData = await getUserData(uid);
    if (!userData) {
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }

    // Google Sheets에서 삭제 처리
    try {
      const { deleteEmployer } = await import('@/lib/googleSheets');
      await deleteEmployer({
        uid: uid,
        email: userData.email,
        companyName: userData.companyName || ''
      });
    } catch (error) {
      console.error('Google Sheets 삭제 실패:', error);
      // Google Sheets 오류는 계정 삭제를 방해하지 않음
    }

    // Firestore에서 관련 데이터 삭제
    if (userData.role === 'employer') {
      await deleteDoc(doc(db, 'employers', uid));
    } else if (userData.role === 'jobseeker') {
      await deleteDoc(doc(db, 'jobseekers', uid));
      // 포트폴리오도 삭제
      try {
        await deleteDoc(doc(db, 'portfolios', uid));
      } catch (error) {
        console.error('포트폴리오 삭제 실패:', error);
      }
    }

    // users 컬렉션에서 삭제
    await deleteDoc(doc(db, 'users', uid));

    // Firebase Auth 계정 삭제 대신 로그아웃 (재인증 에러 방지)
    await signOut(auth);

  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

// 재인증을 포함한 완전한 회원 탈퇴
export const deleteUserAccountWithReauth = async (uid: string, password?: string) => {
  try {
    if (!auth.currentUser) {
      throw new Error('로그인된 사용자가 없습니다.');
    }

    const user = auth.currentUser;

    // 재인증 수행
    if (user.providerData[0]?.providerId === 'google.com') {
      // 구글 로그인 사용자 재인증
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
    } else if (password) {
      // 이메일/비밀번호 사용자 재인증
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
    } else {
      throw new Error('비밀번호가 필요합니다.');
    }

    // 사용자 데이터 가져오기
    const userData = await getUserData(uid);
    if (!userData) {
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }

    // Google Sheets에서 삭제 처리
    try {
      const { deleteEmployer } = await import('@/lib/googleSheets');
      await deleteEmployer({
        uid: uid,
        email: userData.email,
        companyName: userData.companyName || ''
      });
    } catch (error) {
      console.error('Google Sheets 삭제 실패:', error);
    }

    // Firestore에서 관련 데이터 삭제
    if (userData.role === 'employer') {
      await deleteDoc(doc(db, 'employers', uid));
    } else if (userData.role === 'jobseeker') {
      await deleteDoc(doc(db, 'jobseekers', uid));
      try {
        await deleteDoc(doc(db, 'portfolios', uid));
      } catch (error) {
        console.error('포트폴리오 삭제 실패:', error);
      }
    }

    // users 컬렉션에서 삭제
    await deleteDoc(doc(db, 'users', uid));

    // Firebase Auth에서 계정 완전 삭제
    await deleteUser(user);

  } catch (error) {
    console.error('Error deleting user account with reauth:', error);
    throw error;
  }
};

// 포트폴리오 숨김/표시 토글
export const togglePortfolioVisibility = async (portfolioId: string, isHidden: boolean) => {
  try {
    await updateDoc(doc(db, 'portfolios', portfolioId), {
      isHidden: isHidden,
      updatedAt: serverTimestamp()
    });
    console.log(`포트폴리오 ${portfolioId} 숨김 상태가 ${isHidden ? '숨김' : '표시'}로 변경되었습니다.`);
    return true;
  } catch (error) {
    console.error('포트폴리오 숨김 상태 변경 실패:', error);
    throw error;
  }
};

// 기업 정보 숨김/표시 토글
export const toggleEmployerVisibility = async (employerId: string, isHidden: boolean) => {
  try {
    await updateDoc(doc(db, 'employers', employerId), {
      isHidden: isHidden,
      updatedAt: serverTimestamp()
    });
    console.log(`기업 ${employerId} 숨김 상태가 ${isHidden ? '숨김' : '표시'}로 변경되었습니다.`);
    return true;
  } catch (error) {
    console.error('기업 숨김 상태 변경 실패:', error);
    throw error;
  }
};
