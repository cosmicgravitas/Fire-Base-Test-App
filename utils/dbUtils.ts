import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Item } from '../types';

const STORE_NAME = 'items';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Fetches all items from Firestore.
 */
export const getAllItems = async (): Promise<Item[]> => {
  const path = 'items';
  try {
    const itemsCol = collection(db, path);
    const q = query(itemsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as Item[];
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, path);
    return []; // Should not reach here as handleFirestoreError throws
  }
};

/**
 * Saves or updates an item in Firestore.
 */
export const saveItem = async (item: Item): Promise<void> => {
  const path = `items/${item.id}`;
  try {
    const itemRef = doc(db, 'items', item.id);
    const payload = {
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
    };
    await setDoc(itemRef, payload, { merge: true });
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

/**
 * Deletes an item from Firestore.
 */
export const deleteItemFromDB = async (id: string): Promise<void> => {
  const path = `items/${id}`;
  try {
    const itemRef = doc(db, 'items', id);
    await deleteDoc(itemRef);
  } catch (err: any) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// Test connection as required by instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

