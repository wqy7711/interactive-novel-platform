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
      
      // 确保分支ID格式一致性
      if (storyData.branches) {
        storyData.branches = storyData.branches.map(branch => {
          // 确保分支有_id属性
          if (!branch._id) {
            branch._id = `branch${Date.now()}`;
          }
          
          // 如果分支有choices，确保nextBranchId格式一致
          if (branch.choices && Array.isArray(branch.choices)) {
            branch.choices = branch.choices.map(choice => {
              if (!choice.nextBranchId) {
                choice.nextBranchId = `branch${Date.now()}`;
              }
              return choice;
            });
          }
          
          return branch;
        });
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
      
      // 确保分支ID格式一致
      const branchId = branchData._id || `branch${branches.length + 1}_${Math.floor(Date.now() / 1000)}`;
      
      const newBranch = {
        _id: branchId,
        text: branchData.text,
        choices: branchData.choices || []
      };
      
      branches.push(newBranch);
      
      // 如果有新分支内容，同时更新branchContentBlocks
      if (branchData.text && branchId) {
        const branchContentBlocks = storyData.branchContentBlocks || {};
        
        if (!branchContentBlocks[branchId]) {
          branchContentBlocks[branchId] = [
            { id: '1', type: 'text', content: branchData.text }
          ];
        }
        
        await updateDoc(storyRef, { 
          branches,
          branchContentBlocks,
          updatedAt: new Date().toISOString()
        });
      } else {
        await updateDoc(storyRef, { 
          branches,
          updatedAt: new Date().toISOString()
        });
      }
      
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
      
      // 同时删除branchContentBlocks中的内容
      const branchContentBlocks = storyData.branchContentBlocks || {};
      if (branchContentBlocks[branchId]) {
        delete branchContentBlocks[branchId];
      }
      
      await updateDoc(storyRef, { 
        branches: updatedBranches,
        branchContentBlocks,
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
      console.log(`Getting content blocks for branch: ${branchId} in story: ${storyId}`);
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      const storyData = storyDoc.data();
      
      // 首先检查branchContentBlocks
      if (storyData.branchContentBlocks && storyData.branchContentBlocks[branchId]) {
        console.log(`Found content blocks in branchContentBlocks for ${branchId}`);
        return storyData.branchContentBlocks[branchId];
      }
      
      // 然后检查分支中的text
      const branch = (storyData.branches || []).find(b => b._id === branchId);
      if (branch && branch.text) {
        console.log(`Found text in branch ${branchId}, creating content block`);
        return [{ id: '1', type: 'text', content: branch.text }];
      }
      
      // 如果仍然找不到，尝试模糊匹配分支ID
      if (branchId) {
        // 尝试在branchContentBlocks中查找包含branchId某部分的键
        if (storyData.branchContentBlocks) {
          const keys = Object.keys(storyData.branchContentBlocks);
          for (const key of keys) {
            if (key.includes(branchId) || branchId.includes(key)) {
              console.log(`Found similar branch ID: ${key} for requested ID: ${branchId}`);
              return storyData.branchContentBlocks[key];
            }
          }
        }
        
        // 尝试在branches中查找类似ID的分支
        const branches = storyData.branches || [];
        for (const b of branches) {
          if (b._id.includes(branchId) || branchId.includes(b._id)) {
            console.log(`Found similar branch: ${b._id} for requested ID: ${branchId}`);
            if (b.text) {
              return [{ id: '1', type: 'text', content: b.text }];
            }
          }
        }
      }
      
      console.log(`No content found for branch ${branchId}`);
      return [];
    } catch (error) {
      console.error('Failed to get branch content blocks:', error);
      throw error;
    }
  },

  updateBranchContentBlocks: async (storyId, branchId, contentBlocks) => {
    try {
      console.log(`Updating content blocks for branch: ${branchId} in story: ${storyId}`);
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      const storyData = storyDoc.data();
      
      // 处理上传的图片
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
      
      // 更新branchContentBlocks
      const branchContentBlocks = storyData.branchContentBlocks || {};
      branchContentBlocks[branchId] = contentBlocks;
      
      // 同时更新分支的text属性，保持双重数据一致性
      let branches = storyData.branches || [];
      let branchFound = false;
      
      branches = branches.map(branch => {
        if (branch._id === branchId) {
          branchFound = true;
          const textBlocks = contentBlocks.filter(block => block.type === 'text');
          const text = textBlocks.map(block => block.content).join('\n\n');
          return {
            ...branch,
            text
          };
        }
        return branch;
      });
      
      // 如果没有找到分支，创建一个新分支
      if (!branchFound && branchId) {
        const textBlocks = contentBlocks.filter(block => block.type === 'text');
        const text = textBlocks.map(block => block.content).join('\n\n');
        
        branches.push({
          _id: branchId,
          text,
          choices: []
        });
      }
      
      await updateDoc(storyRef, { 
        branchContentBlocks,
        branches,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`Successfully updated content blocks for branch: ${branchId}`);
      return { 
        message: "Branch content blocks updated successfully",
        contentBlocks
      };
    } catch (error) {
      console.error('Failed to update branch content blocks:', error);
      throw error;
    }
  },
  
  // 新增：确保所有分支ID和引用一致
  normalizeBranchIds: async (storyId) => {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story not found');
      }
      
      const storyData = storyDoc.data();
      const branches = storyData.branches || [];
      
      if (branches.length === 0) {
        return { message: "No branches to normalize" };
      }
      
      // 创建ID映射
      const idMap = {};
      const normalizedBranches = [];
      
      // 第一遍：生成新ID并创建映射
      branches.forEach((branch, index) => {
        const oldId = branch._id;
        const newId = `branch${index + 1}_${Math.floor(Date.now() / 1000)}`;
        idMap[oldId] = newId;
        
        normalizedBranches.push({
          ...branch,
          _id: newId
        });
      });
      
      // 第二遍：更新所有分支的choices引用
      normalizedBranches.forEach(branch => {
        if (branch.choices && Array.isArray(branch.choices)) {
          branch.choices = branch.choices.map(choice => {
            const oldNextId = choice.nextBranchId;
            const newNextId = idMap[oldNextId] || oldNextId;
            return {
              ...choice,
              nextBranchId: newNextId
            };
          });
        }
      });
      
      // 更新branchContentBlocks
      const oldBranchContentBlocks = storyData.branchContentBlocks || {};
      const newBranchContentBlocks = {};
      
      Object.keys(oldBranchContentBlocks).forEach(oldBranchId => {
        const newBranchId = idMap[oldBranchId] || oldBranchId;
        newBranchContentBlocks[newBranchId] = oldBranchContentBlocks[oldBranchId];
      });
      
      await updateDoc(storyRef, {
        branches: normalizedBranches,
        branchContentBlocks: newBranchContentBlocks,
        updatedAt: new Date().toISOString()
      });
      
      return { 
        message: "Branch IDs normalized successfully",
        branches: normalizedBranches
      };
    } catch (error) {
      console.error('Failed to normalize branch IDs:', error);
      throw error;
    }
  }
};

export default storyService;