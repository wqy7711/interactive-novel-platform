import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList,ActivityIndicator,Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

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
      const response = await api.admin.getPendingStories();
      setStories(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Failed to get data', 
        error instanceof Error ? error.message : 'Unknown error occurred while fetching pending stories'
      );
    }
  };

  const handleApprove = async (storyId: string) => {
    try {
      await api.admin.approveStory(storyId);
      setStories(prevStories => prevStories.filter(story => story._id !== storyId));
      Alert.alert('Success', 'Story approved');
    } catch (error) {
      Alert.alert(
        'Operation failed', 
        error instanceof Error ? error.message : 'Unknown error occurred while approving story'
      );
    }
  };

  const handleReject = async (storyId: string) => {
    try {
      await api.admin.rejectStory(storyId);
      setStories(prevStories => prevStories.filter(story => story._id !== storyId));
      Alert.alert('Success', 'Story rejected');
    } catch (error) {
      Alert.alert(
        'Operation failed', 
        error instanceof Error ? error.message : 'Unknown error occurred while rejecting story'
      );
    }
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
        <Text style={styles.title}>{item.title}</Text>
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
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333',
    marginBottom: 8
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
    justifyContent: 'space-between' 
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48
  },
  approveButton: { 
    backgroundColor: '#4CAF50', 
    justifyContent: 'center'
  },
  rejectButton: { 
    backgroundColor: '#E57373',
    justifyContent: 'center'
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