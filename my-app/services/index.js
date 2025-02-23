import { api } from './api';
import authService from './authService';
import storyService from './storyService';
import bookmarkService from './bookmarkService';
import favoriteService from './favoriteService';
import commentService from './commentService';
import adminService from './adminService';
import aiService from './aiService';

export default {
  api,
  auth: authService,
  story: storyService,
  bookmark: bookmarkService,
  favorite: favoriteService,
  comment: commentService,
  admin: adminService,
  ai: aiService
};