import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

export const queryCollection = async (collectionName, constraints = []) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    throw error;
  }
};

export const uploadFile = async (uri, storagePath) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, blob);
    
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};