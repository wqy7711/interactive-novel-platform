import { api } from './api';

const bookmarkService = {
  getBookmarks: async (userId) => {
    try {
      return await api.get(`/bookmarks/${userId}`);
    } catch (error) {
      console.error('Failed to get bookmarks:', error);
      throw error;
    }
  },

  addBookmark: async (bookmarkData) => {
    try {
      return await api.post('/bookmarks', bookmarkData);
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      throw error;
    }
  },

  removeBookmark: async (bookmarkId) => {
    try {
      return await api.delete(`/bookmarks/${bookmarkId}`);
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      throw error;
    }
  }
};

export default bookmarkService;