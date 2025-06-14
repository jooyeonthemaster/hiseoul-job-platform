// Google Sheets 연동을 위한 확장된 사용자 타입
import { User as FirebaseUser } from 'firebase/auth';

export interface ExtendedUser extends FirebaseUser {
  role?: 'jobseeker' | 'employer' | 'admin';
}
