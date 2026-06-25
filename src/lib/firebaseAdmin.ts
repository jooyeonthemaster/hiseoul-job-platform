// 서버 전용(Next.js API 라우트) Firebase Admin SDK.
// 보안 규칙을 우회하므로 신뢰된 서버 코드에서만 사용한다. 클라이언트에서 import 금지.
// 인증: GOOGLE_APPLICATION_CREDENTIALS 환경변수가 가리키는 서비스 계정 키(ADC)를 사용.
//   - 개발: 셸에 GOOGLE_APPLICATION_CREDENTIALS 설정 후 dev 서버 재시작 필요.
//   - 운영(Node 호스트): 동일 환경변수 또는 서비스 계정 키 주입 필요.
import { getApps, initializeApp, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let cachedDb: Firestore | null = null;

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];
  return initializeApp({
    credential: applicationDefault(),
    projectId:
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      'hiseoul-8b4a5',
  });
}

/** 신뢰된 서버 컨텍스트에서 Firestore(Admin) 인스턴스를 lazy 초기화하여 반환. */
export function getAdminDb(): Firestore {
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(getAdminApp());
  return cachedDb;
}
