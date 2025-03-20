import { 
  collection, query, where, getDocs, doc, getDoc, 
  updateDoc, deleteDoc, orderBy, limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { deleteUserRelatedDocs } from './firebaseHelpers';

const USERS_COLLECTION = 'users';
const STORIES_COLLECTION = 'stories';
const COMMENTS_COLLECTION = 'comments';

const adminService = {
  getUsers: async () => {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const querySnapshot = await getDocs(usersRef);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          _id: doc.id,
          ...doc.data()
        });
      });
      
      return users;
    } catch (error) {
      console.error('Failed to get users:', error);
      throw error;
    }
  },

  blockUser: async (userId) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnapshot = await getDoc(userRef);
      
      if (!userSnapshot.exists()) {
        throw new Error('User not found');
      }
      
      await updateDoc(userRef, { role: 'blocked' });
      
      return { message: "User blocked successfully" };
    } catch (error) {
      console.error('Failed to block user:', error);
      throw error;
    }
  },

  unblockUser: async (userId) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnapshot = await getDoc(userRef);
      
      if (!userSnapshot.exists()) {
        throw new Error('User not found');
      }
      
      await updateDoc(userRef, { role: 'user' });
      
      return { message: "User unblocked successfully" };
    } catch (error) {
      console.error('Failed to unblock user:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, userId));
      
      await deleteUserRelatedDocs(userId, 'stories', 'authorId');
      await deleteUserRelatedDocs(userId, 'bookmarks');
      await deleteUserRelatedDocs(userId, 'favorites');
      await deleteUserRelatedDocs(userId, 'comments');
      
      return { message: "User deleted successfully" };
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  getPendingStories: async () => {
    try {
      const storiesRef = collection(db, STORIES_COLLECTION);
      const q = query(storiesRef, where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      
      const stories = [];
      querySnapshot.forEach((doc) => {
        stories.push({
          _id: doc.id,
          ...doc.data()
        });
      });
      
      return stories;
    } catch (error) {
      console.error('Failed to get pending stories:', error);
      throw error;
    }
  },

  approveStory: async (storyId) => {
    try {
      const storyRef = doc(db, STORIES_COLLECTION, storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      await updateDoc(storyRef, { 
        status: 'approved',
        updatedAt: new Date().toISOString()
      });
      
      return { message: "Story approved successfully" };
    } catch (error) {
      console.error('Failed to approve story:', error);
      throw error;
    }
  },

  rejectStory: async (storyId) => {
    try {
      const storyRef = doc(db, STORIES_COLLECTION, storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      await updateDoc(storyRef, { 
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
      
      return { message: "Story rejected successfully" };
    } catch (error) {
      console.error('Failed to reject story:', error);
      throw error;
    }
  },

  deleteStory: async (storyId) => {
    try {
      await deleteDoc(doc(db, STORIES_COLLECTION, storyId));
      return { message: "Story deleted successfully" };
    } catch (error) {
      console.error('Failed to delete story:', error);
      throw error;
    }
  },

  getPendingComments: async () => {
    try {
      const commentsRef = collection(db, COMMENTS_COLLECTION);
      const q = query(commentsRef, where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      
      const comments = [];
      querySnapshot.forEach((doc) => {
        comments.push({
          _id: doc.id,
          ...doc.data()
        });
      });
      
      comments.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      return comments;
    } catch (error) {
      console.error('Failed to get pending comments:', error);
      throw error;
    }
  },

  approveComment: async (commentId) => {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }
      
      await updateDoc(commentRef, { 
        status: 'approved',
        updatedAt: new Date().toISOString()
      });
      
      return { message: "Comment approved successfully" };
    } catch (error) {
      console.error('Failed to approve comment:', error);
      throw error;
    }
  },

  rejectComment: async (commentId) => {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }
      
      await updateDoc(commentRef, { 
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
      
      return { message: "Comment rejected successfully" };
    } catch (error) {
      console.error('Failed to reject comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
      return { message: "Comment deleted successfully" };
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  }
};

export default adminService;