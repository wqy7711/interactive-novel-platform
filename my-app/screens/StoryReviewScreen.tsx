import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

interface Story {
  _id: string;
  title: string;
  authorId: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function StoryReviewScreen({ navigation }: { navigation: any }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingStories = async () => {
    try {
      setLoading(true);
      const response = await services.admin.getPendingStories();
      
      if (Array.isArray(response)) {
        setStories(response);
      } else {
        console.error('Expected array response, got:', typeof response);
        setStories([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending stories:', error);
      setLoading(false);
      Alert.alert(
        'Failed to get data', 
        error instanceof Error ? error.message : 'Unknown error occurred while fetching pending stories'
      );
    }
  };

  const handleApprove = async (storyId: string) => {
    try {
      await services.admin.approveStory(storyId);
      setStories(prevStories => prevStories.filter(story => story._id !== storyId));
      Alert.alert('Success', 'Story approved');
    } catch (error) {
      console.error('Error approving story:', error);
      Alert.alert(
        'Operation failed', 
        error instanceof Error ? error.message : 'Unknown error occurred while approving story'
      );
    }
  };

  const handleReject = async (storyId: string) => {
    try {
      await services.admin.rejectStory(storyId);
      setStories(prevStories => prevStories.filter(story => story._id !== storyId));
      Alert.alert('Success', 'Story rejected');
    } catch (error) {
      console.error('Error rejecting story:', error);
      Alert.alert(
        'Operation failed', 
        error instanceof Error ? error.message : 'Unknown error occurred while rejecting story'
      );
    }
  };

  const handleDelete = async (storyId: string) => {
    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this story? This action cannot be undone.',
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
              await services.admin.deleteStory(storyId);
              setStories(prevStories => prevStories.filter(story => story._id !== storyId));
              Alert.alert('Success', 'Story deleted');
            } catch (error) {
              console.error('Error deleting story:', error);
              Alert.alert(
                'Operation failed', 
                error instanceof Error ? error.message : 'Unknown error occurred while deleting story'
              );
            }
          }
        }
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPendingStories();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPendingStories();
  }, []);

  const renderStoryItem = ({ item }: { item: Story }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <TouchableOpacity 
            style={styles.storyLink}
            onPress={() => navigation.navigate('StoryDetail', { storyId: item._id, fromAdmin: true })}
          >
            <Text style={styles.storyLinkText}>View Story</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.author}>Author ID: {item.authorId}</Text>
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]} 
          onPress={() => handleApprove(item._id)}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]} 
          onPress={() => handleReject(item._id)}
        >
          <Ionicons name="close-circle-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Reject</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDelete(item._id)}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Story Review</Text>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={(item) => item._id}
          renderItem={renderStoryItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No pending stories</Text>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
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
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  listContainer: { 
    padding: 16,
    flexGrow: 1
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: { 
    marginBottom: 16 
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333',
    flex: 1
  },
  storyLink: {
    backgroundColor: '#2196F3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8
  },
  storyLinkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  author: { 
    fontSize: 14, 
    color: '#666',
    marginBottom: 6
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginTop: 4
  },
  actionButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 8
  },
  deleteButtonContainer: {
    alignItems: 'center'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center'
  },
  approveButton: { 
    backgroundColor: '#4CAF50'
  },
  rejectButton: { 
    backgroundColor: '#E57373'
  },
  deleteButton: {
    backgroundColor: '#F44336',
    flex: 0.5,
    marginTop: 8
  },
  actionText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    marginLeft: 8 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#999', 
    marginTop: 40,
    fontSize: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  }
});