import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEFAULT_VISIBLE_PROGRAM_IDS } from '@/lib/programs';

const SETTINGS_COLLECTION = 'settings';
const PORTFOLIO_PROGRAM_SETTINGS_ID = 'portfolioPrograms';

export async function getVisiblePortfolioProgramIds() {
  try {
    const settingsDoc = await getDoc(doc(db, SETTINGS_COLLECTION, PORTFOLIO_PROGRAM_SETTINGS_ID));
    if (!settingsDoc.exists()) return DEFAULT_VISIBLE_PROGRAM_IDS;

    const visibleProgramIds = settingsDoc.data().visibleProgramIds;
    if (!Array.isArray(visibleProgramIds)) return DEFAULT_VISIBLE_PROGRAM_IDS;

    return visibleProgramIds.filter((id): id is string => typeof id === 'string');
  } catch (error) {
    console.warn('Using default portfolio program settings:', error);
    return DEFAULT_VISIBLE_PROGRAM_IDS;
  }
}

export async function saveVisiblePortfolioProgramIds(visibleProgramIds: string[]) {
  await setDoc(
    doc(db, SETTINGS_COLLECTION, PORTFOLIO_PROGRAM_SETTINGS_ID),
    {
      visibleProgramIds,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
