import { 
  collection, query, where, doc, getDoc, getDocs, 
  addDoc, updateDoc, deleteDoc, orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COMMENTS_COLLECTION = 'comments';

const commentService = {
  getComments: async (storyId) => {
    try {
      const commentsRef = collection(db, COMMENTS_COLLECTION);
      
      const baseQuery = query(
        commentsRef, 
        where("storyId", "==", storyId)
      );
      
      const querySnapshot = await getDocs(baseQuery);

      const comments = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "approved" || data.status === "pending") {
          comments.push({
            _id: doc.id,
            ...data
          });
        }
      });
      
      comments.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      return comments;
    } catch (error) {
      console.error('Failed to get comments:', error);
      throw error;
    }
  },

  addComment: async (commentData) => {
    try {
      const { storyId, userId, username, text } = commentData;
      
      const commentDoc = {
        storyId,
        userId,
        username,
        text,
        likes: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentDoc);
      
      return { 
        message: "Comment added successfully", 
        comment: { 
          _id: docRef.id,
          ...commentDoc
        }
      };
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }
      
      await deleteDoc(commentRef);
      
      return { message: "Comment deleted successfully" };
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  },

  likeComment: async (commentId) => {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }
      
      const commentData = commentDoc.data();
      const currentLikes = commentData.likes || 0;
      
      await updateDoc(commentRef, { 
        likes: currentLikes + 1,
        updatedAt: new Date().toISOString()
      });
      
      return { 
        message: "Comment liked successfully", 
        likes: currentLikes + 1 
      };
    } catch (error) {
      console.error('Failed to like comment:', error);
      throw error;
    }
  },

  hasUserLikedComment: async (commentId, userId) => {
    try {
      return false;
    } catch (error) {
      console.error('Failed to check if user liked comment:', error);
      return false;
    }
  }
};

export default commentService;