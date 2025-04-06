import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

const fetchApi = async (endpoint, options = {}) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Unknown error'
      }));
      throw new Error(errorData.message || `Request failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export const api = {
  get: (endpoint) => fetchApi(endpoint, { method: 'GET' }),
  post: (endpoint, data) => fetchApi(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (endpoint, data) => fetchApi(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (endpoint) => fetchApi(endpoint, { method: 'DELETE' }),
};

export default {
  auth: require('./authService').default,
  story: require('./storyService').default,
  bookmark: require('./bookmarkService').default,
  favorite: require('./favoriteService').default,
  comment: require('./commentService').default,
  admin: require('./adminService').default,
  ai: require('./aiService').default,
};