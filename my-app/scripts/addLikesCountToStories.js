import { collection, getDocs, doc, updateDoc, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyA_k_MdSbqy54zxCTDT4ByISZG6ZYwXRWw",
  authDomain: "interactive-novel-platform.firebaseapp.com",
  projectId: "interactive-novel-platform",
  storageBucket: "interactive-novel-platform.firebasestorage.app",
  messagingSenderId: "196226052108",
  appId: "1:196226052108:web:5c5352febb6ed0ab9d7e29"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addLikesCountToStories = async () => {
  try {
    console.log('Starting migration: Adding likesCount field to stories...');
    
    const storiesRef = collection(db, 'stories');
    const querySnapshot = await getDocs(storiesRef);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const updatePromises = querySnapshot.docs.map(async (storyDoc) => {
      try {
        const storyData = storyDoc.data();
        
        if ('likesCount' in storyData) {
          skippedCount++;
          return;
        }
        
        await updateDoc(doc(db, 'stories', storyDoc.id), {
          likesCount: 0
        });
        
        updatedCount++;
      } catch (error) {
        console.error(`Error updating story ${storyDoc.id}:`, error);
        errorCount++;
      }
    });
    
    await Promise.all(updatePromises);
    
    console.log(`Migration completed: Updated ${updatedCount} stories, skipped ${skippedCount} stories, encountered ${errorCount} errors.`);
    
    return {
      success: true,
      updatedCount,
      skippedCount,
      errorCount
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const runStoriesMigration = async () => {
  return await addLikesCountToStories();
};

