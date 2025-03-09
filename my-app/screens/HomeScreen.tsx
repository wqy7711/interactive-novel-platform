import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';
import exampleImage from '../assets/image/example.png';
import type { StoryItem, Story } from '../types';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [searchText, setSearchText] = useState('');
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [filteredStories, setFilteredStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedStories, setLikedStories] = useState<{[key: string]: boolean}>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [processingLike, setProcessingLike] = useState<string | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await services.story.getStories();
      
      if (Array.isArray(response)) {
        const approvedStories = response.filter(story => 
          story && (story as Story).status === 'approved'
        );
        
        setStories(approvedStories);
        setFilteredStories(approvedStories);

        if (currentUser) {
          checkLikedStories(approvedStories);
        }
      } else {
        setStories([]);
        setFilteredStories([]);
        console.error('Expected array response, got:', typeof response);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
      setStories([]);
      setFilteredStories([]);
      Alert.alert('Error', 'Failed to load stories');
    }
  };

  const checkLikedStories = async (storyList: StoryItem[]) => {
    try {
      const likeStatusMap: {[key: string]: boolean} = {};
      
      for (const story of storyList) {
        const result = await services.like.isStoryLiked(story._id, currentUser.uid);
        likeStatusMap[story._id] = result.liked;
      }
      
      setLikedStories(likeStatusMap);
    } catch (error) {
      console.error('Error checking liked stories:', error);
    }
  };

  const filterStories = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredStories(stories);
    } else {
      const filtered = stories.filter(story => {
        const storyTitle = story.title || '';
        return typeof storyTitle === 'string' && 
               storyTitle.toLowerCase().includes(text.toLowerCase());
      });
      setFilteredStories(filtered);
    }
  };

  const handleLikeStory = async (storyId: string) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to like stories');
      return;
    }

    try {
      setProcessingLike(storyId);
      
      const result = await services.like.likeStory(storyId, currentUser.uid);
      
      setLikedStories(prev => ({
        ...prev,
        [storyId]: result.liked
      }));
      
      setStories(prevStories => 
        prevStories.map(story => 
          story._id === storyId 
            ? { ...story, likesCount: result.likesCount } 
            : story
        )
      );
      
      setFilteredStories(prevStories => 
        prevStories.map(story => 
          story._id === storyId 
            ? { ...story, likesCount: result.likesCount } 
            : story
        )
      );
      
      setProcessingLike(null);
    } catch (error) {
      console.error('Error liking story:', error);
      setProcessingLike(null);
      Alert.alert('Error', 'Failed to like story');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStories();
    setRefreshing(false);
  };

  const navigateToStoryDetail = (storyId: string) => {
    navigation.navigate('StoryDetail', { storyId });
  };

  const openDrawer = () => {
    if (navigation.toggleDrawer) {
      navigation.toggleDrawer();
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await services.auth.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    
    loadUser();
  }, []);

  useEffect(() => {
    fetchStories();
  }, [currentUser]);

  const renderItem = ({ item }: { item: StoryItem }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.imageContainer} 
        onPress={() => navigateToStoryDetail(item._id)}
      >
        <Image 
          source={item.coverImage ? { uri: item.coverImage } : exampleImage} 
          style={styles.image} 
        />
      </TouchableOpacity>
      
      <View style={styles.cardFooter}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title || 'Untitled'}
        </Text>
        
        <View style={styles.likeContainer}>
          <TouchableOpacity 
            onPress={() => handleLikeStory(item._id)}
            disabled={processingLike === item._id}
            style={styles.likeButton}
          >
            {processingLike === item._id ? (
              <ActivityIndicator size="small" color="#E57373" />
            ) : (
              <Ionicons 
                name={likedStories[item._id] ? "heart" : "heart-outline"} 
                size={16} 
                color="#E57373" 
              />
            )}
          </TouchableOpacity>
          <Text style={styles.likeCount}>{item.likesCount || 0}</Text>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text style={styles.headerText}>Discover Stories</Text>
          <TouchableOpacity onPress={openDrawer}>
            <Ionicons name="book-outline" size={28} color="#555" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading stories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Discover Stories</Text>
        <TouchableOpacity onPress={openDrawer}>
          <Ionicons name="book-outline" size={28} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search stories..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={filterStories}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => filterStories('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredStories}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchText ? "No stories match your search" : "No stories available yet"}
          </Text>
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
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#e6e6e6', 
    margin: 16, 
    borderRadius: 8, 
    padding: 8 
  },
  searchIcon: { 
    marginRight: 8 
  },
  searchInput: { 
    flex: 1, 
    height: 40 
  },
  grid: { 
    paddingHorizontal: 8,
    paddingBottom: 16
  },
  card: { 
    flex: 1, 
    margin: 8, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    overflow: 'hidden',
    elevation: 2
  },
  imageContainer: {
    width: '100%'
  },
  image: { 
    width: '100%', 
    height: 120, 
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  cardFooter: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { 
    fontSize: 14, 
    fontWeight: '600',
    flex: 1,
    marginRight: 4
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    padding: 4,
  },
  likeCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2
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
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
    paddingHorizontal: 20
  }
});