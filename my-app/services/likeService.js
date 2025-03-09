import { 
    collection, query, where, doc, getDoc, getDocs, 
    addDoc, updateDoc, deleteDoc, increment
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  
  const LIKES_COLLECTION = 'likes';
  const COMMENT_LIKES_COLLECTION = 'comment_likes';
  const STORIES_COLLECTION = 'stories';
  const COMMENTS_COLLECTION = 'comments';
  
  const likeService = {
    likeStory: async (storyId, userId) => {
      try {
        const likesRef = collection(db, LIKES_COLLECTION);
        const q = query(
          likesRef, 
          where("storyId", "==", storyId),
          where("userId", "==", userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const likeDoc = querySnapshot.docs[0];
          await deleteDoc(doc(db, LIKES_COLLECTION, likeDoc.id));
          
          const storyRef = doc(db, STORIES_COLLECTION, storyId);
          await updateDoc(storyRef, {
            likesCount: increment(-1)
          });
          
          return { 
            message: "Story unliked successfully", 
            liked: false,
            likesCount: (await getDoc(storyRef)).data().likesCount || 0
          };
        }
        
        const likeData = {
          storyId,
          userId,
          createdAt: new Date().toISOString()
        };
        
        await addDoc(collection(db, LIKES_COLLECTION), likeData);
        
        const storyRef = doc(db, STORIES_COLLECTION, storyId);
        const storyDoc = await getDoc(storyRef);
        
        if (storyDoc.exists()) {
          const currentLikes = storyDoc.data().likesCount || 0;
          await updateDoc(storyRef, {
            likesCount: currentLikes + 1
          });
        } else {
          console.error('Story not found:', storyId);
          throw new Error('Story not found');
        }
        
        return { 
          message: "Story liked successfully", 
          liked: true,
          likesCount: (await getDoc(storyRef)).data().likesCount || 0
        };
      } catch (error) {
        console.error('Failed to like/unlike story:', error);
        throw error;
      }
    },
  
    isStoryLiked: async (storyId, userId) => {
      try {
        const likesRef = collection(db, LIKES_COLLECTION);
        const q = query(
          likesRef, 
          where("storyId", "==", storyId),
          where("userId", "==", userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        return {
          liked: !querySnapshot.empty,
          likeId: querySnapshot.empty ? null : querySnapshot.docs[0].id
        };
      } catch (error) {
        console.error('Failed to check if story is liked:', error);
        return { liked: false };
      }
    },
  
    getStoryLikesCount: async (storyId) => {
      try {
        const storyRef = doc(db, STORIES_COLLECTION, storyId);
        const storyDoc = await getDoc(storyRef);
        
        if (!storyDoc.exists()) {
          throw new Error('Story not found');
        }
        
        return storyDoc.data().likesCount || 0;
      } catch (error) {
        console.error('Failed to get story likes count:', error);
        return 0;
      }
    },
  
    likeComment: async (commentId, userId) => {
      try {
        const likesRef = collection(db, COMMENT_LIKES_COLLECTION);
        const q = query(
          likesRef, 
          where("commentId", "==", commentId),
          where("userId", "==", userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const likeDoc = querySnapshot.docs[0];
          await deleteDoc(doc(db, COMMENT_LIKES_COLLECTION, likeDoc.id));
          
          const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
          await updateDoc(commentRef, {
            likes: increment(-1)
          });
          
          return { 
            message: "Comment unliked successfully", 
            liked: false,
            likes: (await getDoc(commentRef)).data().likes || 0
          };
        }
        
        const likeData = {
          commentId,
          userId,
          createdAt: new Date().toISOString()
        };
        
        await addDoc(collection(db, COMMENT_LIKES_COLLECTION), likeData);
        
        const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
        await updateDoc(commentRef, {
          likes: increment(1)
        });
        
        return { 
          message: "Comment liked successfully", 
          liked: true,
          likes: (await getDoc(commentRef)).data().likes || 0
        };
      } catch (error) {
        console.error('Failed to like/unlike comment:', error);
        throw error;
      }
    },
  
    isCommentLiked: async (commentId, userId) => {
      try {
        const likesRef = collection(db, COMMENT_LIKES_COLLECTION);
        const q = query(
          likesRef, 
          where("commentId", "==", commentId),
          where("userId", "==", userId)
        );
        
        const querySnapshot = await getDocs(q);
        
        return {
          liked: !querySnapshot.empty,
          likeId: querySnapshot.empty ? null : querySnapshot.docs[0].id
        };
      } catch (error) {
        console.error('Failed to check if comment is liked:', error);
        return { liked: false };
      }
    }
  };
  
  export default likeService;