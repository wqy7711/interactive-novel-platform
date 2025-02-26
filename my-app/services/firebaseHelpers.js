import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

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

export const handleAuthError = (error) => {
  let message = 'An unexpected error occurred';
  
  if (error.code) {
    switch(error.code) {
      case 'auth/invalid-email':
        message = 'The email address is not valid';
        break;
      case 'auth/email-already-in-use':
        message = 'This email is already registered';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/user-not-found':
        message = 'No user found with this email';
        break;
      case 'auth/too-many-requests':
        message = 'Too many unsuccessful attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection';
        break;
      default:
        if (error.message) {
          message = error.message;
        }
    }
  } else if (error.message) {
    message = error.message;
  }
  
  return message;
};

export const deleteUserRelatedDocs = async (userId, collectionName, fieldName = 'userId') => {
  try {
    const q = query(collection(db, collectionName), where(fieldName, '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    return { success: true, count: deletePromises.length };
  } catch (error) {
    console.error(`Error deleting user documents in ${collectionName}:`, error);
    throw error;
  }
};