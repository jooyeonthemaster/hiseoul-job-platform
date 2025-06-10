import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  collection, 
  query, 
  where,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './auth';

// 좋아요 추가
export const addLike = async (
  employerId: string, 
  portfolioId: string, 
  jobSeekerId: string,
  employerName: string,
  companyName: string
) => {
  try {
    const likeId = `${employerId}_${portfolioId}`;
    
    // 좋아요 정보 저장
    await setDoc(doc(db, 'likes', likeId), {
      employerId,
      portfolioId,
      jobSeekerId,
      employerName,
      companyName,
      createdAt: serverTimestamp()
    });

    // 구직자에게 알림 발송
    await createNotification({
      userId: jobSeekerId,
      type: 'like',
      title: '새로운 좋아요!',
      message: `${companyName}에서 회원님의 포트폴리오에 관심을 표현했습니다.`,
      actionUrl: `/portfolios/${portfolioId}`
    });

    return true;
  } catch (error) {
    console.error('Error adding like:', error);
    throw error;
  }
};

// 좋아요 제거
export const removeLike = async (employerId: string, portfolioId: string) => {
  try {
    const likeId = `${employerId}_${portfolioId}`;
    await deleteDoc(doc(db, 'likes', likeId));
    return true;
  } catch (error) {
    console.error('Error removing like:', error);
    throw error;
  }
};

// 좋아요 상태 확인
export const checkLikeStatus = async (employerId: string, portfolioId: string): Promise<boolean> => {
  try {
    const likeId = `${employerId}_${portfolioId}`;
    const likeDoc = await getDoc(doc(db, 'likes', likeId));
    return likeDoc.exists();
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

// 포트폴리오의 총 좋아요 수 가져오기
export const getPortfolioLikesCount = async (portfolioId: string): Promise<number> => {
  try {
    const likesQuery = query(
      collection(db, 'likes'),
      where('portfolioId', '==', portfolioId)
    );
    const likesSnapshot = await getDocs(likesQuery);
    return likesSnapshot.size;
  } catch (error) {
    console.error('Error getting likes count:', error);
    return 0;
  }
};

// 구직자가 받은 모든 좋아요 가져오기
export const getJobSeekerLikes = async (jobSeekerId: string) => {
  try {
    const likesQuery = query(
      collection(db, 'likes'),
      where('jobSeekerId', '==', jobSeekerId)
    );
    const likesSnapshot = await getDocs(likesQuery);
    
    return likesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('Error getting job seeker likes:', error);
    return [];
  }
};

// 기업이 좋아요한 포트폴리오들 가져오기
export const getEmployerLikes = async (employerId: string) => {
  try {
    const likesQuery = query(
      collection(db, 'likes'),
      where('employerId', '==', employerId)
    );
    const likesSnapshot = await getDocs(likesQuery);
    
    return likesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('Error getting employer likes:', error);
    return [];
  }
};

// 사용자의 알림 가져오기
export const getUserNotifications = async (userId: string) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    return notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    })).sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// 알림을 읽음으로 표시
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await setDoc(doc(db, 'notifications', notificationId), {
      isRead: true
    }, { merge: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}; 