import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { isValidEmail, handleAuthError } from './firebaseHelpers';

const authService = {
  register: async (userData) => {
    try {
      if (!isValidEmail(userData.email)) {
        throw { code: 'auth/invalid-email' };
      }
      
      const safeRole = 'user';
      
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
        role: safeRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), userDoc);
      
      await AsyncStorage.setItem('userInfo', JSON.stringify(userDoc));
      
      return { message: "User registered successfully", user: userDoc };
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error(handleAuthError(error));
    }
  },

  login: async (credentials) => {
    try {
      if (!isValidEmail(credentials.email)) {
        throw { code: 'auth/invalid-email' };
      }
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email, 
        credentials.password
      );
      
      const userDocRef = doc(db, "users", userCredential.user.uid);
      
      try {
        const userSnapshot = await getDoc(userDocRef);
        
        if (!userSnapshot.exists()) {
          const basicUserDoc = {
            uid: userCredential.user.uid,
            email: credentials.email,
            username: userCredential.user.displayName || credentials.email.split('@')[0],
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          await setDoc(userDocRef, basicUserDoc);
          
          const token = await userCredential.user.getIdToken();
          await AsyncStorage.setItem('authToken', token);
          await AsyncStorage.setItem('userInfo', JSON.stringify(basicUserDoc));
          
          if (credentials.role !== basicUserDoc.role) {
            console.error(`Role mismatch: User is ${basicUserDoc.role} but tried to login as ${credentials.role}`);
            throw new Error('Access denied: Invalid role');
          }
          
          return basicUserDoc;
        }
        
        const userData = userSnapshot.data();
        
        if (!userData.role) {
          userData.role = 'user';
          await updateDoc(userDocRef, { role: 'user' });
        }
        
        if (userData.role !== credentials.role) {
          console.error(`Role mismatch: User is ${userData.role} but tried to login as ${credentials.role}`);
          throw new Error('Access denied: Invalid role');
        }

        if (userData.role === 'blocked') {
          throw new Error('This account has been blocked. Please contact support.');
        }
        
        const token = await userCredential.user.getIdToken();
        const userInfo = {
          ...userData,
          uid: userCredential.user.uid
        };
        
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        return userInfo;
      } catch (firestoreError) {
        console.error('Error getting user data from Firestore:', firestoreError);
        
        const safeRole = 'user';
        
        const basicUserInfo = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || '',
          username: userCredential.user.displayName || (userCredential.user.email ? userCredential.user.email.split('@')[0] : 'User'),
          role: safeRole
        };
        
        if (credentials.role !== safeRole) {
          console.error(`Role mismatch in error handler: Defaulting to ${safeRole} but login attempted as ${credentials.role}`);
          throw new Error('Access denied: Invalid role');
        }
        
        await AsyncStorage.setItem('userInfo', JSON.stringify(basicUserInfo));
        return basicUserInfo;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(handleAuthError(error));
    }
  },

  getCurrentUser: async () => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (!userInfo) return null;
      
      const user = JSON.parse(userInfo);
      if (!user.role) {
        user.role = 'user';
      }
      return user;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  },

  updateProfile: async (uid, userData) => {
    try {
      const { role, ...safeUpdateData } = userData;
      
      const userRef = doc(db, "users", uid);
      const updateData = {
        ...safeUpdateData,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(userRef, updateData);
      
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updateData };
        if (!updatedUser.role) {
          updatedUser.role = currentUser.role || 'user';
        }
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