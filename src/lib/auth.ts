import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
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
  where 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, JobSeeker, Employer } from '@/types';

// 회원가입
export const signUp = async (
  email: string, 
  password: string, 
  name: string, 
  role: 'jobseeker' | 'employer'
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firebase Auth 프로필 업데이트
    await updateProfile(user, { displayName: name });

    // Firestore에 사용자 정보 저장
    const userData: Omit<User, 'createdAt' | 'updatedAt'> = {
      id: user.uid,
      email: user.email!,
      name,
      role
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
          name: '',
          industry: '',
          size: '',
          location: '',
          description: ''
        }
      });
    }

    return { user, userData };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// 로그인
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
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
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as User;
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
      return profileDoc.data();
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
      return employerDoc.data();
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
    await updateDoc(doc(db, 'jobseekers', uid), {
      profile: profileData,
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
    await updateDoc(doc(db, 'employers', uid), {
      company: companyData,
      updatedAt: serverTimestamp()
    });
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
    provider.addScope('email');
    provider.addScope('profile');
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 기존 사용자인지 확인
    const existingUser = await getUserData(user.uid);
    
    if (!existingUser) {
      // 새 사용자인 경우 Firestore에 사용자 정보 저장
      const userData: Omit<User, 'createdAt' | 'updatedAt'> = {
        id: user.uid,
        email: user.email!,
        name: user.displayName || user.email!.split('@')[0],
        role
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
            name: '',
            industry: '',
            size: '',
            location: '',
            description: ''
          }
        });
      }

      return { user, userData, isNewUser: true };
    }

    return { user, userData: existingUser, isNewUser: false };
  } catch (error: any) {
    // 팝업이 닫힌 경우 (사용자 취소)
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('구글 로그인이 취소되었습니다.');
    }
    // 팝업이 차단된 경우
    else if (error.code === 'auth/popup-blocked') {
      throw new Error('팝업이 차단되었습니다. 팝업을 허용하고 다시 시도해주세요.');
    }
    // 기타 에러
    else {
      throw new Error('구글 로그인 중 오류가 발생했습니다: ' + error.message);
    }
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
export const getPortfolio = async (uid: string) => {
  try {
    const portfolioDoc = await getDoc(doc(db, 'portfolios', uid));
    if (portfolioDoc.exists()) {
      const data = portfolioDoc.data();
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
export const getAllPortfolios = async () => {
  try {
    const portfoliosQuery = query(
      collection(db, 'portfolios'),
      where('isPublic', '==', true)
    );
    const querySnapshot = await getDocs(portfoliosQuery);
    
    const portfolios = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        speciality: data.speciality || '',
        skills: data.skills || [],
        rating: data.rating || 0,
        experience: data.experience || [],
        verified: data.verified || false,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    });
    
    return portfolios;
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return [];
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