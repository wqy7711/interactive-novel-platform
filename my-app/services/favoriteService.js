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

const FAVORITES_COLLECTION = 'favorites';

const favoriteService = {
  getFavorites: async (userId) => {
    try {
      const favoritesRef = collection(db, FAVORITES_COLLECTION);
      const q = query(favoritesRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const favorites = [];
      
      querySnapshot.forEach((document) => {
        favorites.push({
          _id: document.id,
          ...document.data()
        });
      });
      
      for (let i = 0; i < favorites.length; i++) {
        const favorite = favorites[i];
        if (favorite.storyId) {
          try {
            const storyDoc = await getDoc(doc(db, 'stories', favorite.storyId));
            if (storyDoc.exists()) {
              favorites[i].storyId = {
                _id: storyDoc.id,
                title: storyDoc.data().title || 'Untitled',
                coverImage: storyDoc.data().coverImage || ''
              };
            }
          } catch (err) {
            console.error(`Error fetching story for favorite ${favorite._id}:`, err);
            favorites[i].storyId = {
              _id: favorite.storyId,
              title: 'Unknown Story',
              coverImage: ''
            };
          }
        }
      }
      
      return favorites;
    } catch (error) {
      console.error('Failed to get favorites:', error);
      throw error;
    }
  },

  addFavorite: async (favoriteData) => {
    try {
      const favoritesRef = collection(db, FAVORITES_COLLECTION);
      const q = query(
        favoritesRef, 
        where("userId", "==", favoriteData.userId),
        where("storyId", "==", favoriteData.storyId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return {
          error: "Story already favorited",
          favorite: {
            _id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data()
          }
        };
      }
      
      const docRef = await addDoc(collection(db, FAVORITES_COLLECTION), favoriteData);
      
      return {
        message: "Story added to favorites",
        favorite: {
          _id: docRef.id,
          ...favoriteData
        }
      };
    } catch (error) {
      console.error('Failed to add favorite:', error);
      throw error;
    }
  },

  removeFavorite: async (favoriteId) => {
    try {
      const favoriteRef = doc(db, FAVORITES_COLLECTION, favoriteId);
      
      const favoriteDoc = await getDoc(favoriteRef);
      if (!favoriteDoc.exists()) {
        throw new Error('Favorite not found');
      }
      
      await deleteDoc(favoriteRef);
      
      return { message: "Favorite removed successfully" };
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      throw error;
    }
  },
  
  isStoryFavorited: async (userId, storyId) => {
    try {
      const favoritesRef = collection(db, FAVORITES_COLLECTION);
      const q = query(
        favoritesRef, 
        where("userId", "==", userId),
        where("storyId", "==", storyId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return {
          favorited: true,
          favoriteId: querySnapshot.docs[0].id
        };
      }
      
      return {
        favorited: false
      };
    } catch (error) {
      console.error('Failed to check if story is favorited:', error);
      return { favorited: false };
    }
  }
};

export default favoriteService;