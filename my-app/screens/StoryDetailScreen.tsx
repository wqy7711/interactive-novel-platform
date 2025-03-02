import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

interface Comment {
  _id: string;
  text: string;
  username: string;
  likes: number;
  createdAt?: string;
}

interface StoryDetail {
  _id: string;
  title?: string;
  description?: string;
  coverImage?: string;
  authorId?: string;
  authorName?: string;
  status?: string;
}

export default function StoryDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [toggleFavorite, setToggleFavorite] = useState(false);

  const { storyId } = route.params || {};

  useEffect(() => {
    if (storyId) {
      fetchStoryDetails();
      checkIfFavorited();
    } else {
      Alert.alert('Error', 'No story ID provided');
      navigation.goBack();
    }
  }, [storyId]);

  const fetchStoryDetails = async () => {
    try {
      setLoading(true);
      
      const storyData = await services.story.getStoryById(storyId);
      
      const storyDetail: StoryDetail = { _id: storyId };
      
      if (storyData) {
        Object.keys(storyData).forEach(key => {
          (storyDetail as any)[key] = (storyData as any)[key];
        });
      }
      
      setStory(storyDetail);
      
      try {
        const commentsData = await services.comment.getComments(storyId);
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (commentError) {
        console.error('Failed to fetch comments:', commentError);
        setComments([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching story details:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load story details');
    }
  };

  const checkIfFavorited = async () => {
    try {
      const user = await services.auth.getCurrentUser();
      if (!user) return;
      
      if (services.favorite.isStoryFavorited) {
        const result = await services.favorite.isStoryFavorited(user.uid, storyId);
        setFavorited(result.favorited);
        setFavoriteId(result.favoriteId || null);
      } else {
        const favorites = await services.favorite.getFavorites(user.uid);
        const isFavorited = favorites.some((fav: any) => 
          fav.storyId._id === storyId || fav.storyId === storyId
        );
        setFavorited(isFavorited);
        
        if (isFavorited) {
          const favorite = favorites.find((fav: any) => 
            fav.storyId._id === storyId || fav.storyId === storyId
          );
          setFavoriteId(favorite?._id || null);
        }
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setToggleFavorite(true);
      const user = await services.auth.getCurrentUser();
      
      if (!user) {
        Alert.alert('Login Required', 'Please login to add to favorites');
        setToggleFavorite(false);
        return;
      }
      
      if (favorited && favoriteId) {
        await services.favorite.removeFavorite(favoriteId);
        setFavorited(false);
        setFavoriteId(null);
        Alert.alert('Success', 'Removed from favorites');
      } else {
        const result = await services.favorite.addFavorite({
          userId: user.uid,
          storyId: storyId
        });
        
        if (result.error) {
          Alert.alert('Info', result.error);
        } else {
          setFavorited(true);
          setFavoriteId(result.favorite?._id || null);
          Alert.alert('Success', 'Added to favorites');
        }
      }
      
      setToggleFavorite(false);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
      setToggleFavorite(false);
    }
  };

  const startReading = () => {
    navigation.navigate('Read', { storyId });
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentUser}>{item.username}</Text>
      <Text style={styles.commentText}>{item.text}</Text>
      <View style={styles.commentFooter}>
        <Text style={styles.commentDate}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}
        </Text>
        <View style={styles.likesContainer}>
          <Ionicons name="heart" size={16} color="#E57373" />
          <Text style={styles.likesCount}>{item.likes || 0}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Story Details</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading story details...</Text>
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
        <Text style={styles.headerText}>{story?.title || 'Story Details'}</Text>
        <TouchableOpacity onPress={handleToggleFavorite} disabled={toggleFavorite}>
          {toggleFavorite ? (
            <ActivityIndicator size="small" color="#FFB74D" />
          ) : (
            <Ionicons 
              name={favorited ? "star" : "star-outline"} 
              size={28} 
              color={favorited ? "#FFB74D" : "#333"} 
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.storyHeader}>
          <Image 
            source={story?.coverImage ? { uri: story.coverImage } : require('../assets/image/example.png')} 
            style={styles.coverImage} 
          />
          <View style={styles.storyInfo}>
            <Text style={styles.title}>{story?.title || 'Untitled'}</Text>
            <Text style={styles.author}>
              {story?.authorName ? `By ${story.authorName}` : 'Unknown Author'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this story</Text>
          <Text style={styles.description}>
            {story?.description || 'No description available.'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.readButton}
          onPress={startReading}
        >
          <Ionicons name="book-outline" size={24} color="#fff" />
          <Text style={styles.readButtonText}>Start Reading</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reader Comments</Text>
          {comments.length > 0 ? (
            comments.map(comment => renderComment({ item: comment }))
          ) : (
            <Text style={styles.emptyText}>No comments yet.</Text>
          )}
        </View>
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
    flex: 1,
    textAlign: 'center',
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
  scrollContainer: {
    flex: 1,
  },
  storyHeader: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  coverImage: {
    width: 180,
    height: 240,
    borderRadius: 8,
    marginBottom: 16,
  },
  storyInfo: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  section: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  readButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  readButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  commentItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentUser: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 16,
  },
});