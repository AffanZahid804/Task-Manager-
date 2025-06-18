import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, Storage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration object
// Replace these placeholder values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here",
  measurementId: "your-measurement-id-here"
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: Storage;
let analytics: Analytics | undefined;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  
  // Analytics is only available in web environment
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Firestore collections
export const collections = {
  USERS: 'users',
  BOARDS: 'boards',
  COLUMNS: 'columns',
  TASKS: 'tasks',
  LABELS: 'labels',
  ATTACHMENTS: 'attachments',
  BOARD_MEMBERS: 'board_members',
  USER_SETTINGS: 'user_settings',
} as const;

// Firestore subcollections
export const subcollections = {
  BOARD_COLUMNS: 'columns',
  COLUMN_TASKS: 'tasks',
  TASK_ATTACHMENTS: 'attachments',
  TASK_COMMENTS: 'comments',
} as const;

// Export Firebase instances
export { app, db, auth, storage, analytics };

// Helper function to get Firestore document reference
export const getDocRef = (collection: string, docId: string) => {
  return db.collection(collection).doc(docId);
};

// Helper function to get Firestore collection reference
export const getCollectionRef = (collection: string) => {
  return db.collection(collection);
};

// Helper function to get subcollection reference
export const getSubcollectionRef = (parentCollection: string, parentId: string, subcollection: string) => {
  return db.collection(parentCollection).doc(parentId).collection(subcollection);
};

// Firebase configuration validation
export const validateFirebaseConfig = (): boolean => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  
  for (const field of requiredFields) {
    if (!firebaseConfig[field as keyof typeof firebaseConfig] || 
        firebaseConfig[field as keyof typeof firebaseConfig] === `your-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}-here`) {
      console.error(`Missing or invalid Firebase configuration: ${field}`);
      return false;
    }
  }
  
  return true;
};

// Environment-specific configuration
export const getFirebaseConfig = () => {
  if (__DEV__) {
    // Development configuration
    return {
      ...firebaseConfig,
      // Enable Firestore emulator in development
      useEmulator: true,
      emulatorHost: 'localhost',
      emulatorPort: 8080,
    };
  }
  
  // Production configuration
  return firebaseConfig;
};

// Firebase initialization status
export const isFirebaseInitialized = (): boolean => {
  return !!app && !!db && !!auth;
};

// Export default configuration
export default firebaseConfig; 