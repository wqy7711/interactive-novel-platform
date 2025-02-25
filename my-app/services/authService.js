import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const authService = {
  register: async (userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email, 
        userData.password
      );
      
      await updateProfile(userCredential.user, {
        displayName: userData.username
      });
      
      const userDoc = {
        uid: userCredential.user.uid,
        email: userData.email,
        username: userData.username,
        role: userData.role || 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), userDoc);
      
      await AsyncStorage.setItem('userInfo', JSON.stringify(userDoc));
      
      return { message: "User registered successfully", user: userDoc };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email, 
        credentials.password
      );
      
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        throw new Error('User data not found');
      }
      
      const userData = userSnapshot.data();
      
      if (userData.role !== credentials.role) {
        throw new Error('Role mismatch');
      }
      
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify({
        ...userData,
        uid: userCredential.user.uid
      }));
      
      return {
        ...userData,
        uid: userCredential.user.uid
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  },

  updateProfile: async (uid, userData) => {
    try {
      const userRef = doc(db, "users", uid);
      const updateData = {
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(userRef, updateData);
      
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updateData };
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
      
      return { message: "Profile updated successfully" };
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
};

export default authService;