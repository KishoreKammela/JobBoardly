// src/services/legal.services.ts
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LegalDocument } from '@/types';

export async function getLegalDocument(
  docId: string
): Promise<LegalDocument | null> {
  if (!db) {
    console.warn(
      `Firestore 'db' instance not available. Cannot fetch legal document: ${docId}`
    );
    return null;
  }
  try {
    const docRef = doc(db, 'legalContent', docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        content: data.content || '',
        lastUpdated:
          data.lastUpdated instanceof Timestamp
            ? data.lastUpdated.toDate().toISOString()
            : new Date().toISOString(),
      } as LegalDocument;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching legal document ${docId}:`, error);
    return null;
  }
}
