const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, getDoc } = require('firebase/firestore');

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

const addBranchesAndContentBlocks = async () => {
  try {
    console.log('Start the migration: Add the branches and contentBlocks fields to the story...');
    
    const storiesRef = collection(db, 'stories');
    const querySnapshot = await getDocs(storiesRef);
    
    console.log(`Find ${querySnapshot.docs.length} stories need to be dealt with`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const updatePromises = querySnapshot.docs.map(async (storyDoc) => {
      try {
        const storyData = storyDoc.data();
        let needsUpdate = false;
        let updates = {};
        
        if (!storyData.branches) {
          console.log(`Story "${storyData.title}" (${storyDoc.id}): The "branches" field is missing`);
          
          const defaultBranch = {
            _id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: '',
            choices: []
          };
          
          updates.branches = [defaultBranch];
          needsUpdate = true;
        }
        
        if (!storyData.contentBlocks) {
          console.log(`Story "${storyData.title}" (${storyDoc.id}): The contentBlocks field is missing`);
          
          const defaultContentBlock = { 
            id: '1', 
            type: 'text', 
            content: storyData.branches && storyData.branches[0] ? storyData.branches[0].text || '' : '' 
          };
          
          updates.contentBlocks = [defaultContentBlock];
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await updateDoc(doc(db, 'stories', storyDoc.id), updates);
          console.log(`Updated story "${storyData.title}" (${storyDoc.id})`);
          updatedCount++;
        } else {
          console.log(`Skip story "${storyData.title}" (${storyDoc.id}): There are already necessary fields.`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`An error occurred when updating story ${storyDoc.id}:`, error);
        errorCount++;
      }
    });
    
    await Promise.all(updatePromises);
    
    console.log(`
Completed:
- Update: ${updatedCount}
- Skip: ${skippedCount}
- error: ${errorCount}
`);
    
    return {
      success: true,
      updatedCount,
      skippedCount,
      errorCount
    };
  } catch (error) {
    console.error('Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const fixBranchIds = async () => {
  try {
    console.log('Start checking: Fix the branch lacking _id...');
    
    const storiesRef = collection(db, 'stories');
    const querySnapshot = await getDocs(storiesRef);
    
    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const updatePromises = querySnapshot.docs.map(async (storyDoc) => {
      try {
        const storyData = storyDoc.data();
        
        if (!storyData.branches || !Array.isArray(storyData.branches)) {
          skippedCount++;
          return;
        }
        
        let needsUpdate = false;
        const updatedBranches = storyData.branches.map(branch => {
          if (!branch._id) {
            needsUpdate = true;
            return {
              ...branch,
              _id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
          }
          return branch;
        });
        
        if (needsUpdate) {
          await updateDoc(doc(db, 'stories', storyDoc.id), {
            branches: updatedBranches
          });
          fixedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`An error occurred when fixing the branch of story ${storyDoc.id}:`, error);
        errorCount++;
      }
    });
    
    await Promise.all(updatePromises);
    
    console.log(`Completed: Fixed ${fixedCount} stories, skipped ${skippedCount} stories, faced ${errorCount} errors.`);
    
    return {
      success: true,
      fixedCount,
      skippedCount,
      errorCount
    };
  } catch (error) {
    console.error('Branch ID check failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const syncBranchTextToContentBlocks = async () => {
  try {
    console.log('Start synchronization: Synchronize the branch text to contentBlocks...');
    
    const storiesRef = collection(db, 'stories');
    const querySnapshot = await getDocs(storiesRef);
    
    let syncedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const updatePromises = querySnapshot.docs.map(async (storyDoc) => {
      try {
        const storyData = storyDoc.data();
        
        if (!storyData.branches || !Array.isArray(storyData.branches) || storyData.branches.length === 0 || 
            !storyData.contentBlocks || !Array.isArray(storyData.contentBlocks)) {
          skippedCount++;
          return;
        }
        
        const mainBranch = storyData.branches[0];
        const textBlocks = storyData.contentBlocks.filter(block => block.type === 'text');
        
        if (textBlocks.length > 0 && mainBranch.text && textBlocks[0].content !== mainBranch.text) {
          const updatedContentBlocks = storyData.contentBlocks.map(block => {
            if (block.type === 'text' && block.id === textBlocks[0].id) {
              return {
                ...block,
                content: mainBranch.text
              };
            }
            return block;
          });
          
          await updateDoc(doc(db, 'stories', storyDoc.id), {
            contentBlocks: updatedContentBlocks
          });
          syncedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`An error occurred when synchronizing the text of story ${storyDoc.id} :`, error);
        errorCount++;
      }
    });
    
    await Promise.all(updatePromises);
    
    console.log(`Completed: synchronized ${syncedCount} stories, skipped ${skippedCount} stories, faced ${errorCount} errors.`);
    
    return {
      success: true,
      syncedCount,
      skippedCount,
      errorCount
    };
  } catch (error) {
    console.error('Text synchronization failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const runDataMigrations = async () => {
  try {
    console.log('Start the data migration process...');
    
    const branchesResult = await addBranchesAndContentBlocks();
    console.log('Migration results of the branches and contentBlocks fields:', branchesResult);
    
    const branchIdsResult = await fixBranchIds();
    console.log('Branch ID repair result:', branchIdsResult);
    
    const syncResult = await syncBranchTextToContentBlocks();
    console.log('Text synchronization result:', syncResult);
    
    console.log('All data migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('The data migration process failed:', error);
    process.exit(1);
  }
};

runDataMigrations();