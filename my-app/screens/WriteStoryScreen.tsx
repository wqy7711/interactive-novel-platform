import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  Image,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import services from '../services';
import { Story, Branch, ContentBlock } from '../types';

export default function WriteStoryScreen({ navigation, route }: { navigation: any, route: any }) {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: '1', type: 'text', content: '' }
  ]);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isNewBranch, setIsNewBranch] = useState(false);

  useEffect(() => {
    const id = route.params?.storyId;
    const branch = route.params?.branchId;
    const isNew = route.params?.isNewBranch === true;
    const isNewContent = route.params?.isNewContent === true;
    
    if (id) {
      setStoryId(id);
      
      if (branch) {
        setBranchId(branch);
        setIsNewBranch(isNew);
        
        if (isNewContent) {
          setContentBlocks([{ id: '1', type: 'text', content: '' }]);
          fetchStoryDataOnly(id);
        } else {
          fetchBranchData(id, branch);
        }
      } else {
        fetchStoryData(id);
      }
    } else {
      Alert.alert('Error', 'No story ID provided');
      navigation.goBack();
    }
  }, [route.params?.storyId, route.params?.branchId]);

  useEffect(() => {
    if (route.params?.illustrationUrl && route.params?.shouldAddImage) {
      handleAddImage(route.params.illustrationUrl);
      navigation.setParams({ illustrationUrl: undefined, shouldAddImage: undefined });
    }
  }, [route.params?.illustrationUrl, route.params?.shouldAddImage]);

  const fetchStoryDataOnly = async (id: string) => {
    try {
      setLoading(true);
      const story = await services.story.getStoryById(id);
      
      const formattedStory: Story = { 
        branches: [],
        contentBlocks: [],
        _id: id 
      };
      
      if (story) {
        const { _id, ...restStory } = story as any;
        Object.assign(formattedStory, restStory);
      }
      
      setStoryData(formattedStory);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching story:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load story data');
    }
  };

  const fetchStoryData = async (id: string) => {
    try {
      setLoading(true);
      const story = await services.story.getStoryById(id);
      
      const formattedStory: Story = { 
        branches: [], 
        contentBlocks: [],
        _id: id
      };
      
      if (story) {
        const { _id, ...restStory } = story as any;
        Object.assign(formattedStory, restStory);
      }
      
      setStoryData(formattedStory);

      if (formattedStory.contentBlocks && formattedStory.contentBlocks.length > 0) {
        setContentBlocks(formattedStory.contentBlocks);
      } 
      else if (formattedStory.branches && formattedStory.branches.length > 0 && formattedStory.branches[0].text) {
        setContentBlocks([
          { id: '1', type: 'text', content: formattedStory.branches[0].text }
        ]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching story:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load story data');
    }
  };

  const fetchBranchData = async (storyId: string, branchId: string) => {
    try {
      setLoading(true);
      
      const story = await services.story.getStoryById(storyId);
      
      const formattedStory: Story = { 
        branches: [],
        contentBlocks: [],
        _id: storyId
      };
      
      if (story) {
        const { _id, ...restStory } = story as any;
        Object.assign(formattedStory, restStory);
      }
      
      setStoryData(formattedStory);
      
      const branchBlocks = await services.story.getBranchContentBlocks(storyId, branchId);
      
      if (Array.isArray(branchBlocks) && branchBlocks.length > 0) {
        setContentBlocks(branchBlocks);
      } else {
        if (formattedStory.branches && formattedStory.branches.length > 0) {
          const branch = formattedStory.branches.find(b => b._id === branchId);
          
          if (branch && branch.text) {
            setContentBlocks([{ id: '1', type: 'text', content: branch.text }]);
          } else if (isNewBranch) {
            setContentBlocks([{ id: '1', type: 'text', content: '' }]);
          }
        } else {
          setContentBlocks([{ id: '1', type: 'text', content: '' }]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching branch data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load branch data');
    }
  };

  const handleSave = async () => {
    if (!storyId) return false;
    
    const hasText = contentBlocks.some(block => block.type === 'text' && block.content.trim() !== '');
    
    if (!hasText) {
      Alert.alert('Error', 'Please write some content for your story');
      return false;
    }

    try {
      setSaving(true);
      
      const mainText = contentBlocks
        .filter(block => block.type === 'text')
        .map(block => block.content)
        .join('\n\n');
      
      if (branchId) {
        await services.story.updateBranchContentBlocks(storyId, branchId, contentBlocks);
        
        const storyData = await services.story.getStoryById(storyId);
        const storyWithBranches = {
          branches: [],
          ...(storyData || { _id: storyId })
        };
        
        if (storyWithBranches && storyWithBranches.branches && storyWithBranches.branches.length > 0) {
          const updatedBranches = storyWithBranches.branches.map((branch: Branch) => {
            if (branch._id === branchId) {
              return {
                ...branch,
                text: mainText
              };
            }
            return branch;
          });
          
          await services.story.updateStory(storyId, { branches: updatedBranches });
        } else {
          const newBranch: Branch = {
            _id: branchId,
            text: mainText,
            choices: []
          };
          await services.story.updateStory(storyId, { 
            branches: [newBranch],
            contentBlocks: contentBlocks 
          });
        }
      } 
      else {
        if (storyData && storyData.branches && storyData.branches.length > 0) {
          const firstBranchId = storyData.branches[0]._id;
          const updateData = {
            branches: [
              {
                _id: firstBranchId,
                text: mainText,
                choices: storyData.branches[0].choices || []
              },
              ...(storyData.branches.slice(1) || [])
            ],
            contentBlocks: contentBlocks,
          };
          
          const updateResult = await services.story.updateStory(storyId, updateData);
          
          if (updateResult && updateResult.story) {
            setStoryData(updateResult.story);
          }
        } else {
          const newBranchId = `branch_${Date.now()}`;
          const updateData = {
            branches: [
              {
                _id: newBranchId,
                text: mainText,
                choices: []
              }
            ],
            contentBlocks: contentBlocks
          };
          
          const updateResult = await services.story.updateStory(storyId, updateData);
          
          if (updateResult && updateResult.story) {
            setStoryData(updateResult.story);
          }
        }
      }
      
      setSaving(false);
      Alert.alert('Success', 'Story saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving story:', error);
      setSaving(false);
      Alert.alert('Error', 'Failed to save story');
      return false;
    }
  };

  const addTextBlock = () => {
    const newId = Date.now().toString();
    setContentBlocks([
      ...contentBlocks,
      { id: newId, type: 'text', content: '' }
    ]);
  };

  const updateTextBlock = (id: string, text: string) => {
    setContentBlocks(blocks => 
      blocks.map(block => 
        block.id === id ? { ...block, content: text } : block
      )
    );
  };

  const handleAddImage = async (uri?: string) => {
    try {
      let imageUri = uri;
      
      if (!imageUri) {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
          return;
        }
        
        imageUri = result.assets[0].uri;
      }
      
      if (imageUri) {
        const newId = Date.now().toString();
        setContentBlocks([
          ...contentBlocks,
          { id: newId, type: 'image', content: imageUri }
        ]);
      }
    } catch (error) {
      console.error('Error adding image:', error);
      Alert.alert('Error', 'Failed to add image');
    }
  };

  const deleteBlock = (id: string) => {
    const textBlocks = contentBlocks.filter(block => block.type === 'text');
    if (textBlocks.length === 1 && textBlocks[0].id === id) {
      Alert.alert('Error', 'Cannot delete the only text block');
      return;
    }
    
    setContentBlocks(blocks => blocks.filter(block => block.id !== id));
  };

  const navigateToBranchDesign = () => {
    if (!storyId) return;
    
    handleSave().then((success) => {
      if (success) {
        if (branchId) {
          navigation.navigate('BranchDesign', { 
            storyId, 
            parentBranchId: branchId
          });
        } else {
          navigation.navigate('BranchDesign', { storyId });
        }
      }
    });
  };

  const navigateToAIIllustration = () => {
    if (!storyId) return;
    navigation.navigate('AIIllustration', { storyId });
  };

  const handleSubmitForReview = async () => {
    Alert.alert(
      'Submit Story',
      'Submit your story for review?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              const saved = await handleSave();
              if (saved && storyId) {
                await services.story.updateStory(storyId, { status: 'pending' });
                Alert.alert('Success', 'Story submitted for review', [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainDrawer' }],
                      });
                    }
                  }
                ]);
              }
            } catch (error) {
              console.error('Error submitting story:', error);
              Alert.alert('Error', 'Failed to submit story');
            }
          }
        }
      ]
    );
  };

  const renderContentBlock = ({ item }: { item: ContentBlock }) => {
    if (item.type === 'text') {
      return (
        <View style={styles.textBlockContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Write your story here..."
            multiline
            value={item.content}
            onChangeText={(text) => updateTextBlock(item.id, text)}
          />
          <TouchableOpacity 
            style={styles.deleteBlockButton}
            onPress={() => deleteBlock(item.id)}
          >
            <Ionicons name="close-circle" size={24} color="#E57373" />
          </TouchableOpacity>
        </View>
      );
    } else if (item.type === 'image') {
      return (
        <View style={styles.imageBlockContainer}>
          <Image source={{ uri: item.content }} style={styles.storyImage} />
          <TouchableOpacity 
            style={styles.deleteImageButton}
            onPress={() => deleteBlock(item.id)}
          >
            <Ionicons name="close-circle" size={24} color="#E57373" />
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Write Story</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading story...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {branchId ? "Write Branch Story" : "Write Story"}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <Ionicons name="save-outline" size={28} color="#333" />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={contentBlocks}
        renderItem={renderContentBlock}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.contentContainer}
        ListFooterComponent={
          <View style={styles.actionsContainer}>
            <View style={styles.blockActionsRow}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={addTextBlock}
              >
                <Ionicons name="document-text-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Add Text</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#3949AB' }]} 
                onPress={() => handleAddImage()}
              >
                <Ionicons name="image-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Add Image</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={navigateToBranchDesign}
            >
              <Ionicons name="git-branch-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Add Branch</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button} 
              onPress={navigateToAIIllustration}
            >
              <Ionicons name="color-wand-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Generate AI Image</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.publishButton]} 
              onPress={handleSubmitForReview}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Submit for Review</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16 
  },
  headerText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  contentContainer: { 
    padding: 16,
    paddingBottom: 100,
  },
  textBlockContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  textArea: { 
    backgroundColor: '#e6e6e6', 
    borderRadius: 8, 
    padding: 12, 
    minHeight: 120,
    textAlignVertical: 'top',
    paddingRight: 40,
  },
  deleteBlockButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
    zIndex: 1,
  },
  imageBlockContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  storyImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  deleteImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 2,
  },
  actionsContainer: {
    marginTop: 10,
  },
  blockActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  button: { 
    backgroundColor: '#4CAF50', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16,
    marginLeft: 8
  },
  publishButton: {
    backgroundColor: '#3949AB',
    marginTop: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});