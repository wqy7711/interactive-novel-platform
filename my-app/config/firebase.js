import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyA_k_MdSbqy54zxCTDT4ByISZG6ZYwXRWw",
  authDomain: "interactive-novel-platform.firebaseapp.com",
  projectId: "interactive-novel-platform",
  storageBucket: "interactive-novel-platform.firebasestorage.app",
  messagingSenderId: "196226052108",
  appId: "1:196226052108:web:5c5352febb6ed0ab9d7e29"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

const storage = getStorage(app);

getFunctions(app);

export { auth, db, storage };