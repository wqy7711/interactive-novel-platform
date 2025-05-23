import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

interface Comment {
  _id: string;
  text: string;
  username: string;
  likes: number;
  createdAt?: string;
  status?: string;
  userId?: string;
}

interface StoryDetail {
  _id: string;
  title?: string;
  description?: string;
  coverImage?: string;
  authorId?: string;
  authorName?: string;
  status?: string;
  likesCount?: number;
}

export default function StoryDetailScreen({ navigation, route }: { navigation: any; route: any }) {
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [processingFavorite, setProcessingFavorite] = useState(false);
  const [processingLike, setProcessingLike] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [likedComments, setLikedComments] = useState<{[key: string]: boolean}>({});
  const [processingCommentLike, setProcessingCommentLike] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const { storyId } = route.params || {};

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await services.auth.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (storyId) {
      fetchStoryDetails();
      if (currentUser) {
        checkIfFavorited();
        checkIfLiked();
      }
    } else {
      Alert.alert('Error', 'No story ID provided');
      navigation.goBack();
    }
  }, [storyId, currentUser]);

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
      
      await fetchComments();
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching story details:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load story details');
    }
  };

  const fetchComments = async () => {
    try {
      const commentsData = await services.comment.getComments(storyId);
      
      const commentsArray = Array.isArray(commentsData) ? commentsData : [];
      
      setComments(commentsArray);
      
      if (currentUser && commentsArray.length > 0) {
        checkLikedComments(commentsArray);
      }
      
      return commentsArray;
    } catch (commentError) {
      console.error('Failed to fetch comments:', commentError);
      setComments([]);
      return [];
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchComments(),
        checkIfFavorited(),
        checkIfLiked()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const checkIfFavorited = async () => {
    try {
      if (!currentUser) return;
      
      if (services.favorite.isStoryFavorited) {
        const result = await services.favorite.isStoryFavorited(currentUser.uid, storyId);
        setFavorited(result.favorited);
        setFavoriteId(result.favoriteId || null);
      } else {
        const favorites = await services.favorite.getFavorites(currentUser.uid);
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

  const checkIfLiked = async () => {
    try {
      if (!currentUser) return;
      
      const result = await services.like.isStoryLiked(storyId, currentUser.uid);
      setLiked(result.liked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const checkLikedComments = async (commentsData: Comment[]) => {
    try {
      if (!currentUser) return;
      
      const likeStatusMap: {[key: string]: boolean} = {};
      
      for (const comment of commentsData) {
        if (services.like.isCommentLiked) {
          const result = await services.like.isCommentLiked(comment._id, currentUser.uid);
          likeStatusMap[comment._id] = result.liked;
        }
      }
      
      setLikedComments(likeStatusMap);
    } catch (error) {
      console.error('Error checking liked comments:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to add to favorites');
      return;
    }

    try {
      setProcessingFavorite(true);
      
      if (favorited && favoriteId) {
        await services.favorite.removeFavorite(favoriteId);
        setFavorited(false);
        setFavoriteId(null);
        Alert.alert('Success', 'Removed from favorites');
      } else {
        const result = await services.favorite.addFavorite({
          userId: currentUser.uid,
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
      
      setProcessingFavorite(false);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
      setProcessingFavorite(false);
    }
  };

  const handleToggleLike = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to like stories');
      return;
    }

    try {
      setProcessingLike(true);
      
      const result = await services.like.likeStory(storyId, currentUser.uid);
      
      setLiked(result.liked);
      setStory(prev => prev ? { ...prev, likesCount: result.likesCount } : null);
      
      setProcessingLike(false);
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like status');
      setProcessingLike(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to add comments');
      return;
    }

    try {
      setSubmittingComment(true);
      
      const commentData = {
        storyId,
        userId: currentUser.uid,
        username: currentUser.username || 'User',
        text: newComment.trim()
      };
      
      const result = await services.comment.addComment(commentData);
      
      if (result && result.comment) {
        setComments(prevComments => [result.comment, ...prevComments]);
        setNewComment('');
        Alert.alert('Success', 'Your comment has been added and is pending approval');
      }
      
      setSubmittingComment(false);
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      setSubmittingComment(false);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      if (!currentUser) {
        Alert.alert('Login Required', 'Please login to like comments');
        return;
      }
      
      setProcessingCommentLike(commentId);
      
      const result = await services.like.likeComment(commentId, currentUser.uid);
      
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId ? { ...comment, likes: result.likes } : comment
        )
      );
      
      setLikedComments(prev => ({
        ...prev,
        [commentId]: result.liked
      }));
      
      setProcessingCommentLike(null);
    } catch (error) {
      console.error('Error liking comment:', error);
      setProcessingCommentLike(null);
      Alert.alert('Error', 'Failed to like comment');
    }
  };

  const handleDeleteComment = async (commentId: string, userId: string) => {
    if (currentUser && (currentUser.uid === userId || currentUser.role === 'admin')) {
      Alert.alert(
        'Delete Comment',
        'Are you sure you want to delete this comment?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await services.comment.deleteComment(commentId);
                setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
                Alert.alert('Success', 'Comment deleted successfully');
              } catch (error) {
                console.error('Error deleting comment:', error);
                Alert.alert('Error', 'Failed to delete comment');
              }
            }
          }
        ]
      );
    }
  };

  const startReading = () => {
    navigation.navigate('Read', { storyId });
  };

  const renderComment = (item: Comment) => (
    <View style={[
      styles.commentItem, 
      item.status === 'pending' ? styles.pendingComment : null
    ]} key={item._id}>
      <View style={styles.commentHeader}>
        <View style={styles.commentUserContainer}>
          <Text style={styles.commentUser}>{item.username}</Text>
          {item.status === 'pending' && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Pending</Text>
            </View>
          )}
        </View>
        
        {currentUser && (currentUser.uid === item.userId || currentUser.role === 'admin') && (
          <TouchableOpacity 
            onPress={() => handleDeleteComment(item._id, item.userId || '')}
            style={styles.deleteCommentButton}
          >
            <Ionicons name="trash-outline" size={18} color="#E57373" />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.commentText}>{item.text}</Text>
      
      <View style={styles.commentFooter}>
        <Text style={styles.commentDate}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}
        </Text>
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => handleCommentLike(item._id)}
          disabled={processingCommentLike === item._id}
        >
          {processingCommentLike === item._id ? (
            <ActivityIndicator size="small" color="#E57373" />
          ) : (
            <Ionicons 
              name={likedComments[item._id] ? "heart" : "heart-outline"} 
              size={16} 
              color="#E57373" 
            />
          )}
          <Text style={styles.likesCount}>{item.likes || 0}</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerText} numberOfLines={1}>
          {story?.title || 'Story Details'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleToggleLike}
            disabled={processingLike}
            style={styles.headerButton}
          >
            {processingLike ? (
              <ActivityIndicator size="small" color="#E57373" />
            ) : (
              <Ionicons 
                name={liked ? "heart" : "heart-outline"} 
                size={28} 
                color={liked ? "#E57373" : "#333"} 
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleToggleFavorite} 
            disabled={processingFavorite}
            style={styles.headerButton}
          >
            {processingFavorite ? (
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
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          style={styles.scrollContainer}
          ref={scrollViewRef}
        >
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
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="heart" size={16} color="#E57373" />
                  <Text style={styles.statText}>{story?.likesCount || 0} likes</Text>
                </View>
              </View>
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

          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={refreshData}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.refreshButtonText}>Refresh Comments</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reader Comments</Text>
            
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
                editable={!submittingComment && !!currentUser}
              />
              <TouchableOpacity 
                style={[
                  styles.commentButton, 
                  (!newComment.trim() || submittingComment || !currentUser) && styles.disabledButton
                ]}
                onPress={handleSubmitComment}
                disabled={!newComment.trim() || submittingComment || !currentUser}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            
            {currentUser && comments.length > 0 && (
              <View style={styles.commentInfo}>
                <Text style={styles.commentInfoText}>
                  {comments.filter(c => c.status === 'pending').length > 0 ? 
                    'Comments marked as "pending" are awaiting approval' : 
                    'All comments are approved and visible to everyone'}
                </Text>
              </View>
            )}

            {comments.length > 0 ? (
              <View style={styles.commentsList}>
                {comments.map(comment => renderComment(comment))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 5,
    marginLeft: 5,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
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
  refreshButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 8,
    fontSize: 14,
  },
  commentButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  commentInfo: {
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
  },
  commentInfoText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  commentsList: {
    marginTop: 8,
  },
  commentItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pendingComment: {
    borderLeftWidth: 3,
    borderLeftColor: '#FFB74D',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUser: {
    fontWeight: 'bold',
    color: '#333',
  },
  pendingBadge: {
    backgroundColor: '#FFB74D',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  pendingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteCommentButton: {
    padding: 4,
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
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
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