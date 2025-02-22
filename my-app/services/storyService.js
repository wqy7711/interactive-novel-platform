import { api } from './api';

const storyService = {
  getStories: async () => {
    try {
      return await api.get('/stories');
    } catch (error) {
      console.error('Failed to get stories:', error);
      throw error;
    }
  },

  getStoryById: async (storyId) => {
    try {
      return await api.get(`/stories/${storyId}`);
    } catch (error) {
      console.error('Failed to get story details:', error);
      throw error;
    }
  },

  createStory: async (storyData) => {
    try {
      return await api.post('/stories', storyData);
    } catch (error) {
      console.error('Failed to create story:', error);
      throw error;
    }
  },

  updateStory: async (storyId, storyData) => {
    try {
      return await api.put(`/stories/${storyId}`, storyData);
    } catch (error) {
      console.error('Failed to update story:', error);
      throw error;
    }
  },

  deleteStory: async (storyId) => {
    try {
      return await api.delete(`/stories/${storyId}`);
    } catch (error) {
      console.error('Failed to delete story:', error);
      throw error;
    }
  },

  addBranch: async (storyId, branchData) => {
    try {
      return await api.post(`/stories/${storyId}/branches`, branchData);
    } catch (error) {
      console.error('Failed to add branch:', error);
      throw error;
    }
  },

  getBranches: async (storyId) => {
    try {
      return await api.get(`/stories/${storyId}/branches`);
    } catch (error) {
      console.error('Failed to get branches:', error);
      throw error;
    }
  },

  deleteBranch: async (storyId, branchId) => {
    try {
      return await api.delete(`/stories/${storyId}/branches/${branchId}`);
    } catch (error) {
      console.error('Failed to delete branch:', error);
      throw error;
    }
  }
};

export default storyService;