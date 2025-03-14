import { 
  collection, doc, addDoc, getDoc, getDocs, 
  updateDoc, deleteDoc, query, where, orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

const storyService = {
  getStories: async () => {
    try {
      const storiesRef = collection(db, 'stories');
      const querySnapshot = await getDocs(storiesRef);
      
      return querySnapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data(),
        likesCount: doc.data().likesCount || 0
      }));
    } catch (error) {
      console.error('Failed to get stories:', error);
      throw error;
    }
  },

  getStoryById: async (storyId) => {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      const storyData = storyDoc.data();
      
      return {
        _id: storyDoc.id,
        ...storyData,
        likesCount: storyData.likesCount || 0
      };
    } catch (error) {
      console.error('Failed to get story details:', error);
      throw error;
    }
  },

  createStory: async (storyData) => {
    try {
      let coverImageUrl = storyData.coverImage;
      if (storyData.coverImage && storyData.coverImage.startsWith('file://')) {
        const storageRef = ref(storage, `stories/${Date.now()}`);
        const response = await fetch(storyData.coverImage);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        coverImageUrl = await getDownloadURL(storageRef);
      }
      
      const newStory = {
        title: storyData.title,
        description: storyData.description || '',
        coverImage: coverImageUrl || '',
        authorId: storyData.authorId,
        status: storyData.status || 'draft',
        branches: [],
        contentBlocks: [{ id: '1', type: 'text', content: '' }],
        likesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'stories'), newStory);
      
      return { 
        message: "Story created successfully", 
        story: { _id: docRef.id, ...newStory } 
      };
    } catch (error) {
      console.error('Failed to create story:', error);
      throw error;
    }
  },

  updateStory: async (storyId, storyData) => {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      if (storyData.illustrationUrl && storyData.illustrationUrl.startsWith('file://')) {
        const storageRef = ref(storage, `stories/${storyId}/illustrations/${Date.now()}`);
        const response = await fetch(storyData.illustrationUrl);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        storyData.illustrationUrl = await getDownloadURL(storageRef);
      }
      
      if (storyData.contentBlocks) {
        for (let i = 0; i < storyData.contentBlocks.length; i++) {
          const block = storyData.contentBlocks[i];
          if (block.type === 'image' && block.content && block.content.startsWith('file://')) {
            const storageRef = ref(storage, `stories/${storyId}/content/${Date.now()}_${i}`);
            const response = await fetch(block.content);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob);
            storyData.contentBlocks[i].content = await getDownloadURL(storageRef);
          }
        }
      }
      
      const updateData = {
        ...storyData,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(storyRef, updateData);
      
      const updatedStoryDoc = await getDoc(storyRef);
      
      return {
        message: "Story updated successfully",
        story: {
          _id: updatedStoryDoc.id,
          ...updatedStoryDoc.data()
        }
      };
    } catch (error) {
      console.error('Failed to update story:', error);
      throw error;
    }
  },

  deleteStory: async (storyId) => {
    try {
      await deleteDoc(doc(db, 'stories', storyId));
      return { message: "Story deleted successfully" };
    } catch (error) {
      console.error('Failed to delete story:', error);
      throw error;
    }
  },

  addBranch: async (storyId, branchData) => {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      const storyData = storyDoc.data();
      const branches = storyData.branches || [];
      
      const newBranch = {
        _id: branchData._id || Date.now().toString(),
        text: branchData.text,
        choices: branchData.choices || []
      };
      
      branches.push(newBranch);
      
      await updateDoc(storyRef, { 
        branches,
        updatedAt: new Date().toISOString()
      });
      
      return { message: "Branch added successfully", branch: newBranch };
    } catch (error) {
      console.error('Failed to add branch:', error);
      throw error;
    }
  },

  getBranches: async (storyId) => {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      return storyDoc.data().branches || [];
    } catch (error) {
      console.error('Failed to get branches:', error);
      throw error;
    }
  },

  deleteBranch: async (storyId, branchId) => {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      const storyData = storyDoc.data();
      const branches = storyData.branches || [];
      
      const updatedBranches = branches.filter(branch => branch._id !== branchId);
      
      await updateDoc(storyRef, { 
        branches: updatedBranches,
        updatedAt: new Date().toISOString()
      });
      
      return { message: "Branch deleted successfully" };
    } catch (error) {
      console.error('Failed to delete branch:', error);
      throw error;
    }
  },

  getBranchContentBlocks: async (storyId, branchId) => {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      const storyData = storyDoc.data();
      
      if (storyData.branchContentBlocks && storyData.branchContentBlocks[branchId]) {
        return storyData.branchContentBlocks[branchId];
      }
      
      const branch = (storyData.branches || []).find(b => b._id === branchId);
      if (branch && branch.text) {
        return [{ id: '1', type: 'text', content: branch.text }];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get branch content blocks:', error);
      throw error;
    }
  },

  updateBranchContentBlocks: async (storyId, branchId, contentBlocks) => {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      const storyData = storyDoc.data();
      
      const branchContentBlocks = storyData.branchContentBlocks || {};
      
      branchContentBlocks[branchId] = contentBlocks;
      
      for (let i = 0; i < contentBlocks.length; i++) {
        const block = contentBlocks[i];
        if (block.type === 'image' && block.content && block.content.startsWith('file://')) {
          const storageRef = ref(storage, `stories/${storyId}/branches/${branchId}/${Date.now()}_${i}`);
          const response = await fetch(block.content);
          const blob = await response.blob();
          await uploadBytes(storageRef, blob);
          contentBlocks[i].content = await getDownloadURL(storageRef);
        }
      }
      
      let branches = storyData.branches || [];
      branches = branches.map(branch => {
        if (branch._id === branchId) {
          const textBlocks = contentBlocks.filter(block => block.type === 'text');
          const text = textBlocks.map(block => block.content).join('\n\n');
          return {
            ...branch,
            text
          };
        }
        return branch;
      });
      
      await updateDoc(storyRef, { 
        branchContentBlocks,
        branches,
        updatedAt: new Date().toISOString()
      });
      
      return { 
        message: "Branch content blocks updated successfully",
        contentBlocks
      };
    } catch (error) {
      console.error('Failed to update branch content blocks:', error);
      throw error;
    }
  }
};

export default storyService;