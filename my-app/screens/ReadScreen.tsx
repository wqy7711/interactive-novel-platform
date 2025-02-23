import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,Alert,ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

interface StoryBranch {
  _id: string;
  text: string;
  choices: {
    text: string;
    nextBranchId: string;
  }[];
}

interface Story {
  _id: string;
  title: string;
  authorId: string;
  branches: StoryBranch[];
}

export default function ReadScreen({ navigation, route }: { navigation: any, route: any }) {
  const [story, setStory] = useState<Story | null>(null);
  const [currentBranch, setCurrentBranch] = useState<StoryBranch | null>(null);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [bookmarkAdded, setBookmarkAdded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { storyId, branchId, progress } = route.params || {};

  const fetchStory = async () => {
    try {
      setLoading(true);
      const storyData = await services.story.getStoryById(storyId);
      setStory(storyData);
      
      const branches = await services.story.getBranches(storyId);
      
      if (branchId) {
        const branch = branches.find((b: StoryBranch) => b._id === branchId);
        setCurrentBranch(branch || branches[0]);
      } else {
        setCurrentBranch(branches[0]);
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

  const handleChoiceSelect = async (nextBranchId: string) => {
    try {
      if (!story) return;
      
      const branches = await services.story.getBranches(story._id);
      const nextBranch = branches.find((b: StoryBranch) => b._id === nextBranchId);
      
      if (nextBranch) {
        setCurrentBranch(nextBranch);
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

  const updateProgress = async () => {
    if (!story || !story.branches.length) return;
    
    const newProgress = Math.min(100, readingProgress + (100 / story.branches.length));
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

  useEffect(() => {
    if (storyId) {
      fetchStory();
    } else {
      Alert.alert('Error', 'No story specified');
      navigation.goBack();
    }
  }, [storyId]);

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

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.contentContainer}
      >
        {currentBranch ? (
          <>
            <Text style={styles.storyContent}>
              {currentBranch.text}
            </Text>

            {currentBranch.choices && currentBranch.choices.length > 0 && (
              <View style={styles.optionsContainer}>
                <Text style={styles.optionTitle}>Choose your path:</Text>
                {currentBranch.choices.map((choice, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionButton}
                    onPress={() => handleChoiceSelect(choice.nextBranchId)}
                  >
                    <Text style={styles.optionText}>
                      {index + 1}. {choice.text}
                    </Text>
                  </TouchableOpacity>
                ))}
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
  optionsContainer: {
    marginTop: 10,
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
  }
});