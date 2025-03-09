import authService from './authService';
import storyService from './storyService';
import bookmarkService from './bookmarkService';
import favoriteService from './favoriteService';
import commentService from './commentService';
import adminService from './adminService';
import aiService from './aiService';
import likeService from './likeService';

export default {
  auth: authService,
  story: storyService,
  bookmark: bookmarkService,
  favorite: favoriteService,
  comment: commentService,
  admin: adminService,
  ai: aiService,
  like: likeService
};