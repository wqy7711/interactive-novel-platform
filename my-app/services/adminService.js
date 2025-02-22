import { api } from './api';

const adminService = {
  getUsers: async () => {
    try {
      return await api.get('/admin/users');
    } catch (error) {
      console.error('Failed to get users:', error);
      throw error;
    }
  },

  blockUser: async (userId) => {
    try {
      return await api.put(`/admin/users/${userId}/block`);
    } catch (error) {
      console.error('Failed to block user:', error);
      throw error;
    }
  },

  unblockUser: async (userId) => {
    try {
      return await api.put(`/admin/users/${userId}/unblock`);
    } catch (error) {
      console.error('Failed to unblock user:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      return await api.delete(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  getPendingStories: async () => {
    try {
      return await api.get('/admin/stories/pending');
    } catch (error) {
      console.error('Failed to get pending stories:', error);
      throw error;
    }
  },

  approveStory: async (storyId) => {
    try {
      return await api.put(`/admin/stories/${storyId}/approve`);
    } catch (error) {
      console.error('Failed to approve story:', error);
      throw error;
    }
  },

  rejectStory: async (storyId) => {
    try {
      return await api.put(`/admin/stories/${storyId}/reject`);
    } catch (error) {
      console.error('Failed to reject story:', error);
      throw error;
    }
  },

  deleteStory: async (storyId) => {
    try {
      return await api.delete(`/admin/stories/${storyId}`);
    } catch (error) {
      console.error('Failed to delete story:', error);
      throw error;
    }
  },

  getPendingComments: async () => {
    try {
      return await api.get('/admin/comments/pending');
    } catch (error) {
      console.error('Failed to get pending comments:', error);
      throw error;
    }
  },

  approveComment: async (commentId) => {
    try {
      return await api.put(`/admin/comments/${commentId}/approve`);
    } catch (error) {
      console.error('Failed to approve comment:', error);
      throw error;
    }
  },

  rejectComment: async (commentId) => {
    try {
      return await api.put(`/admin/comments/${commentId}/reject`);
    } catch (error) {
      console.error('Failed to reject comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      return await api.delete(`/admin/comments/${commentId}`);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  }
};

export default adminService;