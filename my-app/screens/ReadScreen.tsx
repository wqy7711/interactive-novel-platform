import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

interface ContentBlock {
  id: string;
  type: 'text' | 'image';
  content: string;
}

interface StoryBranch {
  _id: string;
  text?: string;
  choices?: {
    text: string;
    nextBranchId: string;
  }[];
}

interface Story {
  _id: string;
  title?: string;
  authorId?: string;
  branches?: StoryBranch[];
  description?: string;
  status?: string;
  coverImage?: string;
  contentBlocks?: ContentBlock[];
  branchContentBlocks?: {[key: string]: ContentBlock[]};
}

interface BranchPathItem {
  id: string;
  text: string;
  branchId: string;
}

export default function ReadScreen({ navigation, route }: { navigation: any, route: any }) {
  const [story, setStory] = useState<Story | null>(null);
  const [currentBranch, setCurrentBranch] = useState<StoryBranch | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [bookmarkAdded, setBookmarkAdded] = useState(false);
  const [branchHistory, setBranchHistory] = useState<BranchPathItem[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const { storyId, branchId, progress } = route.params || {};

  useEffect(() => {
    if (storyId) {
      fetchStory();
    } else {
      Alert.alert('Error', 'No story specified');
      navigation.goBack();
    }
  }, [storyId]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const storyData = await services.story.getStoryById(storyId);
      
      const storyObj: Story = { _id: storyId };
      
      if (storyData) {
        Object.keys(storyData).forEach(key => {
          (storyObj as any)[key] = (storyData as any)[key];
        });
      }
      
      setStory(storyObj);
      
      if (branchId) {
        await loadBranchContent(storyObj, branchId);
      } 
      else {
        await loadMainContent(storyObj);
      }
      
      if (progress) {
        setReadingProgress(parseFloat(progress));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching story:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load the story');
    }
  };

  const loadMainContent = async (storyObj: Story) => {
    try {
      if (storyObj.contentBlocks && storyObj.contentBlocks.length > 0) {
        setContentBlocks(storyObj.contentBlocks);
        
        if (storyObj.branches && storyObj.branches.length > 0) {
          const mainBranch = storyObj.branches[0];
          setCurrentBranch(mainBranch);
        }
      } 
      else if (storyObj.branches && storyObj.branches.length > 0) {
        const mainBranch = storyObj.branches[0];
        setCurrentBranch(mainBranch);
        
        setBranchHistory([]);
        
        if (mainBranch.text) {
          setContentBlocks([{ id: '1', type: 'text', content: mainBranch.text }]);
        } else {
          setContentBlocks([]);
        }
      } else {
        setContentBlocks([{ id: '1', type: 'text', content: 'The story has no content yet.' }]);
        setCurrentBranch(null);
      }
      
      console.log('Story Branches:', storyObj.branches);
      if (storyObj.branches && storyObj.branches.length > 0) {
        console.log('First Branch:', storyObj.branches[0]);
        console.log('First Branch Choices:', storyObj.branches[0].choices);
      }
    } catch (error) {
      console.error('Error in loadMainContent:', error);
      setContentBlocks([{ id: '1', type: 'text', content: 'Error loading story content.' }]);
    }
  };

  const loadBranchContent = async (storyObj: Story, branchId: string) => {
    try {
      let branchBlocks: ContentBlock[] = [];
      let foundBranch = false;
      
      if (storyObj.branchContentBlocks && storyObj.branchContentBlocks[branchId]) {
        branchBlocks = storyObj.branchContentBlocks[branchId];
        foundBranch = true;
      } 
      else {
        try {
          branchBlocks = await services.story.getBranchContentBlocks(storyId, branchId);
          if (branchBlocks && branchBlocks.length > 0) {
            foundBranch = true;
          }
        } catch (error) {
          console.error('Failed to get branch content blocks:', error);
        }
      }
      
      if (foundBranch && branchBlocks.length > 0) {
        setContentBlocks(branchBlocks);
        
        if (storyObj.branches) {
          const branch = storyObj.branches.find(b => b._id === branchId);
          if (branch) {
            setCurrentBranch(branch);
          }
        }
      } 
      else if (storyObj.branches) {
        const branch = storyObj.branches.find(b => b._id === branchId);
        
        if (branch) {
          setCurrentBranch(branch);
          if (branch.text) {
            setContentBlocks([{ id: '1', type: 'text', content: branch.text }]);
          } else {
            setContentBlocks([{ id: '1', type: 'text', content: 'This branch has no content yet.' }]);
          }
        } 
        else {
          try {
            const branches = await services.story.getBranches(storyId);
            const fetchedBranch = branches.find((b: StoryBranch) => b._id === branchId);
            
            if (fetchedBranch) {
              setCurrentBranch(fetchedBranch);
              if (fetchedBranch.text) {
                setContentBlocks([{ id: '1', type: 'text', content: fetchedBranch.text }]);
              } else {
                setContentBlocks([{ id: '1', type: 'text', content: 'This branch has no content yet.' }]);
              }
            } 
            else {
              console.log('Branch not found, falling back to main content');
              await loadMainContent(storyObj);
            }
          } catch (error) {
            console.error('Error loading branches:', error);
            setContentBlocks([{ id: '1', type: 'text', content: 'An error occurred when loading the branch.' }]);
            setCurrentBranch(null);
          }
        }
      } else {
        setContentBlocks([{ id: '1', type: 'text', content: 'The story has no branches.' }]);
        setCurrentBranch(null);
      }
    } catch (error) {
      console.error('Error in loadBranchContent:', error);
      setContentBlocks([{ id: '1', type: 'text', content: 'An error occurred while loading the content.' }]);
      setCurrentBranch(null);
    }
  };

  const handleChoiceSelect = async (nextBranchId: string, choiceText: string) => {
    try {
      if (!story) return;
      
      let branches: StoryBranch[] = [];
      
      if (story.branches) {
        branches = story.branches;
      } else {
        try {
          branches = await services.story.getBranches(story._id);
        } catch (error) {
          console.error('Error fetching branches:', error);
          Alert.alert('Error', 'Failed to load story branches');
          return;
        }
      }
      
      const nextBranch = branches.find((b: any) => b._id === nextBranchId);
      
      if (nextBranch) {
        if (currentBranch) {
          const historyItem: BranchPathItem = {
            id: `history-${branchHistory.length}`,
            text: choiceText,
            branchId: currentBranch._id
          };
          
          setBranchHistory(prev => [...prev, historyItem]);
        }
        
        setCurrentBranch(nextBranch);
        await loadBranchContent(story, nextBranchId);
        
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
        updateProgress();
      } else {
        Alert.alert('Error', 'Could not find the next story branch');
      }
    } catch (error) {
      console.error('Error navigating to next branch:', error);
      Alert.alert('Error', 'Failed to navigate to the next part of the story');
    }
  };

  const handleGoBack = async (historyIndex: number) => {
    if (!story || historyIndex < 0 || historyIndex >= branchHistory.length) return;

    try {
      const targetHistoryItem = branchHistory[historyIndex];
      
      const newHistory = branchHistory.slice(0, historyIndex);
      setBranchHistory(newHistory);
      
      if (story.branches) {
        const targetBranch = story.branches.find(b => b._id === targetHistoryItem.branchId);
        if (targetBranch) {
          setCurrentBranch(targetBranch);
          await loadBranchContent(story, targetHistoryItem.branchId);
          
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
          }
        }
      }
    } catch (error) {
      console.error('Error going back in history:', error);
      Alert.alert('Error', 'Failed to navigate back in the story');
    }
  };

  const updateProgress = async () => {
    if (!story) return;
    
    let totalBranches = 1;
    if (story.branches) {
      totalBranches = story.branches.length || 1;
    }
    
    const newProgress = Math.min(100, readingProgress + (100 / totalBranches));
    setReadingProgress(newProgress);
  };

  const addBookmark = async () => {
    try {
      if (!story || !currentBranch) return;
      
      const user = await services.auth.getCurrentUser();
      if (!user) {
        Alert.alert('Login Required', 'Please login to bookmark stories');
        return;
      }
      
      await services.bookmark.addBookmark({
        userId: user.uid,
        storyId: story._id,
        chapter: currentBranch._id,
        progress: readingProgress.toString()
      });
      
      setBookmarkAdded(true);
      Alert.alert('Success', 'Bookmark added successfully');
    } catch (error) {
      console.error('Error adding bookmark:', error);
      Alert.alert('Error', 'Failed to add bookmark');
    }
  };

  const renderBranchHistoryItem = ({ item, index }: { item: BranchPathItem, index: number }) => (
    <TouchableOpacity 
      style={styles.historyItem} 
      onPress={() => handleGoBack(index)}
    >
      <Text style={styles.historyItemText}>{item.text}</Text>
      <Ionicons name="return-up-back" size={16} color="#333" />
    </TouchableOpacity>
  );

  const renderContentBlock = (block: ContentBlock) => {
    if (block.type === 'text') {
      return (
        <Text key={block.id} style={styles.storyContent}>
          {block.content}
        </Text>
      );
    } else if (block.type === 'image') {
      return (
        <View key={block.id} style={styles.storyImageContainer}>
          <Image 
            source={{ uri: block.content }} 
            style={styles.storyImage}
            resizeMode="contain"
          />
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
          <Text style={styles.headerText}>Loading...</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading story...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('Current Branch:', currentBranch ? {
    id: currentBranch._id,
    textLength: currentBranch.text ? currentBranch.text.length : 0,
    choices: currentBranch.choices ? currentBranch.choices.length : 0
  } : 'No current branch');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{story?.title || 'Story Title'}</Text>
        <TouchableOpacity onPress={addBookmark}>
          <Ionicons 
            name={bookmarkAdded ? "bookmark" : "bookmark-outline"} 
            size={28} 
            color="#333" 
          />
        </TouchableOpacity>
      </View>

      {branchHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <FlatList
            data={branchHistory}
            renderItem={renderBranchHistoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.historyList}
          />
        </View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.contentContainer}
      >
        {contentBlocks.length > 0 ? (
          <>
            {contentBlocks.map(block => renderContentBlock(block))}

            {currentBranch && currentBranch.choices && currentBranch.choices.length > 0 ? (
              <View style={styles.optionsContainer}>
                <Text style={styles.optionTitle}>Choose your path:</Text>
                {currentBranch.choices.map((choice, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionButton}
                    onPress={() => handleChoiceSelect(choice.nextBranchId, choice.text)}
                  >
                    <Text style={styles.optionText}>
                      {index + 1}. {choice.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.storyEndContainer}>
                <Text style={styles.storyEndText}>
                  {branchHistory.length > 0 ? 
                    "This path of the story ends here. You can go back and choose a different path." : 
                    "This story has no choices yet or has reached its end."}
                </Text>
                {branchHistory.length > 0 && (
                  <TouchableOpacity 
                    style={styles.goBackButton}
                    onPress={() => handleGoBack(branchHistory.length - 1)}
                  >
                    <Ionicons name="arrow-back-circle" size={20} color="#fff" />
                    <Text style={styles.goBackButtonText}>Go Back</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.noContentText}>
            This story has no content yet.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  historyContainer: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  historyList: {
    paddingHorizontal: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  historyItemText: {
    fontSize: 12,
    color: '#333',
    marginRight: 4,
  },
  contentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  storyContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    textAlign: 'justify',
    marginBottom: 20,
  },
  storyImageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  optionsContainer: {
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  optionButton: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
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
  noContentText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  storyEndContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  storyEndText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  goBackButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  goBackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});