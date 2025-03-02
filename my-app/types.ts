export interface FirebaseDocument {
  _id: string;
  [key: string]: any;
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
}