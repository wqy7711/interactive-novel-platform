const aiService = {
  generateImage: async (prompt) => {
    try {
      if (typeof prompt !== 'string') {
        throw new Error('Prompt must be a string');
      }

      const functionUrl = 'https://us-central1-interactive-novel-platform.cloudfunctions.net/generateImage';
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.imageUrl) {
        throw new Error('Invalid response from image generation function');
      }
      
      return data.imageUrl;
    } catch (error) {
      console.error('Failed to generate AI image:', error);
      throw error;
    }
  }
};

export default aiService;