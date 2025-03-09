const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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
    
    console.log(`Found ${querySnapshot.docs.length} stories to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const updatePromises = querySnapshot.docs.map(async (storyDoc) => {
      try {
        const storyData = storyDoc.data();
        
        if ('likesCount' in storyData) {
          console.log(`Skipping story "${storyData.title}" (${storyDoc.id}): likesCount already exists`);
          skippedCount++;
          return;
        }
        
        await updateDoc(doc(db, 'stories', storyDoc.id), {
          likesCount: 0
        });
        
        console.log(`Updated story "${storyData.title}" (${storyDoc.id}): added likesCount field`);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating story ${storyDoc.id}:`, error);
        errorCount++;
      }
    });
    
    await Promise.all(updatePromises);
    
    console.log(`
Migration completed:
- Updated: ${updatedCount} stories
- Skipped: ${skippedCount} stories
- Errors: ${errorCount} errors
`);
    
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

const createLikesCollections = async () => {
  try {
    console.log('Checking likes collections...');
    
    const likesRef = collection(db, 'likes');
    const likesSnapshot = await getDocs(likesRef);
    
    const commentLikesRef = collection(db, 'comment_likes');
    const commentLikesSnapshot = await getDocs(commentLikesRef);
    
    console.log(`Found ${likesSnapshot.docs.length} story likes and ${commentLikesSnapshot.docs.length} comment likes`);
    
    console.log('Likes collections are ready');
    
    return {
      success: true,
      message: 'Likes collections are ready'
    };
  } catch (error) {
    console.error('Error creating likes collections:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const runMigration = async () => {
  try {
    const likesCountResult = await addLikesCountToStories();
    
    const likesCollectionsResult = await createLikesCollections();
    
    console.log('Migration process completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
};

runMigration();