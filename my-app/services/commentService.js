import { api } from './api';

const commentService = {
  getComments: async (storyId) => {
    try {
      return await api.get(`/comments/${storyId}`);
    } catch (error) {
      console.error('Failed to get comments:', error);
      throw error;
    }
  },

  addComment: async (commentData) => {
    try {
      return await api.post('/comments', commentData);
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      return await api.delete(`/comments/${commentId}`);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  },

  likeComment: async (commentId) => {
    try {
      return await api.put(`/comments/${commentId}/like`);
    } catch (error) {
      console.error('Failed to like comment:', error);
      throw error;
    }
  }
};

export default commentService;