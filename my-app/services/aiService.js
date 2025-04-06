import { api } from './api';

const aiService = {
  generateImage: async (prompt) => {
    try {
      const response = await api.post('/ai/generate-image', { prompt });
      return response.imageUrl;
    } catch (error) {
      console.error('Failed to generate AI image:', error);
      throw error;
    }
  }
};

export default aiService;