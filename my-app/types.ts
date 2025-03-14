export interface FirebaseDocument {
  _id: string;
  [key: string]: any;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'image';
  content: string;
}

export interface Story {
  _id: string;
  title?: string;
  description?: string;
  coverImage?: string;
  authorId?: string;
  status?: string;
  branches?: Branch[];
  illustrationUrl?: string;
  likesCount?: number;
  contentBlocks?: ContentBlock[];
  branchContentBlocks?: {[key: string]: ContentBlock[]};
}

export interface Branch {
  _id: string;
  text?: string;
  choices?: Choice[];
}

export interface Choice {
  text: string;
  nextBranchId: string;
}

export interface StoryItem {
  _id: string;
  title?: string;
  coverImage?: string;
  likesCount?: number;
}

export interface Comment {
  _id: string;
  storyId: string;
  userId: string;
  username: string;
  text: string;
  likes: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Like {
  _id: string;
  userId: string;
  storyId: string;
  createdAt: string;
}

export interface CommentLike {
  _id: string;
  userId: string;
  commentId: string;
  createdAt: string;
}