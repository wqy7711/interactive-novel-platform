import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { firebase } from '../config/firebase';

const authService = {
  register: async (userData) => {
    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(
        userData.email, 
        userData.password
      );
      
      const uid = userCredential.user.uid;
      
      const response = await api.post('/users/register', {
        uid,
        email: userData.email,
        username: userData.username,
        role: userData.role || 'user'
      });
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(
        credentials.email, 
        credentials.password
      );
      
      const uid = userCredential.user.uid;
      
      const response = await api.post('/users/login', { uid });
      
      if (response.user.role !== credentials.role) {
        throw new Error('Role mismatch');
      }
      
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
      
      return response.user;
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
      const response = await api.put(`/users/${uid}`, userData);
      
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await firebase.auth().signOut();
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
