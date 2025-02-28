interface FirebaseDocument {
    _id: string;
    [key: string]: any;
  }
  
  interface Story {
    _id: string;
    title?: string;
    description?: string;
    coverImage?: string;
    authorId?: string;
    status?: string;
    branches?: Branch[];
    illustrationUrl?: string;
  }
  
  interface Branch {
    _id: string;
    text?: string;
    choices?: Choice[];
  }
  
  interface Choice {
    text: string;
    nextBranchId: string;
  }
  
  interface StoryItem {
    _id: string;
    title?: string;
    coverImage?: string;
  }