import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const BOOKMARKS_COLLECTION = 'bookmarks';

const bookmarkService = {
  getBookmarks: async (userId) => {
    try {
      const bookmarksRef = collection(db, BOOKMARKS_COLLECTION);
      const q = query(bookmarksRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const bookmarks = [];
      const populatePromises = [];
      
      querySnapshot.forEach((document) => {
        bookmarks.push({
          _id: document.id,
          ...document.data()
        });
      });
      
      for (let i = 0; i < bookmarks.length; i++) {
        const bookmark = bookmarks[i];
        if (bookmark.storyId) {
          try {
            const storyDoc = await getDoc(doc(db, 'stories', bookmark.storyId));
            if (storyDoc.exists()) {
              bookmarks[i].storyId = {
                _id: storyDoc.id,
                title: storyDoc.data().title || 'Untitled',
                coverImage: storyDoc.data().coverImage || ''
              };
            }
          } catch (err) {
            console.error(`Error fetching story for bookmark ${bookmark._id}:`, err);
            bookmarks[i].storyId = {
              _id: bookmark.storyId,
              title: 'Unknown Story',
              coverImage: ''
            };
          }
        }
      }
      
      return bookmarks;
    } catch (error) {
      console.error('Failed to get bookmarks:', error);
      throw error;
    }
  },

  addBookmark: async (bookmarkData) => {
    try {
      const bookmarksRef = collection(db, BOOKMARKS_COLLECTION);
      const q = query(
        bookmarksRef, 
        where("userId", "==", bookmarkData.userId),
        where("storyId", "==", bookmarkData.storyId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const existingBookmark = querySnapshot.docs[0];
        const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, existingBookmark.id);
        
        await deleteDoc(bookmarkRef);
        
        const docRef = await addDoc(collection(db, BOOKMARKS_COLLECTION), bookmarkData);
        
        return {
          message: "Bookmark updated successfully",
          bookmark: {
            _id: docRef.id,
            ...bookmarkData
          }
        };
      }
      
      const docRef = await addDoc(collection(db, BOOKMARKS_COLLECTION), bookmarkData);
      
      return {
        message: "Bookmark added successfully",
        bookmark: {
          _id: docRef.id,
          ...bookmarkData
        }
      };
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      throw error;
    }
  },

  removeBookmark: async (bookmarkId) => {
    try {
      const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, bookmarkId);
      
      const bookmarkDoc = await getDoc(bookmarkRef);
      if (!bookmarkDoc.exists()) {
        throw new Error('Bookmark not found');
      }
      
      await deleteDoc(bookmarkRef);
      
      return { message: "Bookmark removed successfully" };
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      throw error;
    }
  }
};

export default bookmarkService;