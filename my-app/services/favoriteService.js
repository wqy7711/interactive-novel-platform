import { api } from './api';

const favoriteService = {
  getFavorites: async (userId) => {
    try {
      return await api.get(`/favorites/${userId}`);
    } catch (error) {
      console.error('Failed to get favorites:', error);
      throw error;
    }
  },

  addFavorite: async (favoriteData) => {
    try {
      return await api.post('/favorites', favoriteData);
    } catch (error) {
      console.error('Failed to add favorite:', error);
      throw error;
    }
  },

  removeFavorite: async (favoriteId) => {
    try {
      return await api.delete(`/favorites/${favoriteId}`);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      throw error;
    }
  }
};

export default favoriteService;