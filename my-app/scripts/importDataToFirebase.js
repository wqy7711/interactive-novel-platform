const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
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
const storage = getStorage(app);

const readSampleData = () => {
  const filePath = path.join(__dirname, 'sampleStoryData.js');
  
  try {
    const sampleStories = require('./sampleStoryData');
    return sampleStories;
  } catch (error) {
    console.error('Error loading sample data:', error);
    throw error;
  }
};

const uploadImageToStorage = async (localPath) => {
  try {
    const cleanPath = localPath.startsWith('/') ? localPath.substring(1) : localPath;

    const fullPath = path.join(__dirname, '..', cleanPath);
    
    if (!fs.existsSync(fullPath)) {
      console.warn(`Warning picture not exist: ${fullPath}`);
      return null;
    }
    
    const fileBuffer = fs.readFileSync(fullPath);
    
    const storageRef = ref(storage, `story_images/${path.basename(localPath)}`);
    
    const snapshot = await uploadBytes(storageRef, fileBuffer);
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`Successful: ${path.basename(localPath)}, URL: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error(`Error: ${localPath}`, error);
    return null;
  }
};

const importStories = async () => {
  console.log('Starting data import...');
  
  try {
    const sampleStories = readSampleData();
    console.log(`Found ${sampleStories.length} stories to import`);
    
    for (const story of sampleStories) {
      let coverImageUrl = story.coverImage;
      
      if (story.coverImage && story.coverImage.startsWith('/assets')) {
        console.log(`Upload picture: ${story.coverImage}`);
        const uploadedImageUrl = await uploadImageToStorage(story.coverImage);
        if (uploadedImageUrl) {
          coverImageUrl = uploadedImageUrl;
        }
      }
      
      const storyRef = await addDoc(collection(db, 'stories'), {
        title: story.title,
        description: story.description,
        coverImage: coverImageUrl,
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