const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

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

const readSampleData = () => {
  const filePath = path.join(__dirname, 'sampleStoryData.js');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  const startIndex = fileContent.indexOf('[');
  const endIndex = fileContent.lastIndexOf(']') + 1;
  
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not extract array from file');
  }
  
  const arrayContent = fileContent.substring(startIndex, endIndex);
  
  try {
    const sampleStories = eval(arrayContent);
    return sampleStories;
  } catch (error) {
    console.error('Error parsing sample data:', error);
    throw error;
  }
};

const importStories = async () => {
  console.log('Starting data import...');
  
  try {
    const sampleStories = readSampleData();
    console.log(`Found ${sampleStories.length} stories to import`);
    
    for (const story of sampleStories) {
      const storyRef = await addDoc(collection(db, 'stories'), {
        title: story.title,
        description: story.description,
        coverImage: story.coverImage,
        authorId: story.authorId,
        status: story.status,
        branches: story.branches,
        createdAt: story.createdAt || new Date().toISOString(),
        updatedAt: story.updatedAt || new Date().toISOString()
      });
      
      console.log(`Added story: ${story.title} with ID: ${storyRef.id}`);
    }
    
    console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

importStories().then(() => {
  console.log('Import process finished');
}).catch(err => {
  console.error('Import process failed:', err);
});