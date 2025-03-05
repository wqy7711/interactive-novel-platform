import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

interface Comment {
  _id: string;
  text: string;
  username: string;
  storyId: string;
  status: string;
  createdAt?: string;
}

export default function CommentReviewScreen({ navigation }: { navigation: any }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingComments = async () => {
    try {
      setLoading(true);
      const response = await services.admin.getPendingComments();
      setComments(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to fetch pending comments');
    }
  };

  const handleApprove = async (commentId: string) => {
    try {
      await services.admin.approveComment(commentId);
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
      Alert.alert('Success', 'Comment approved');
    } catch (error) {
      console.error('Error approving comment:', error);
      Alert.alert('Error', 'Failed to approve comment');
    }
  };

  const handleReject = async (commentId: string) => {
    try {
      await services.admin.rejectComment(commentId);
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
      Alert.alert('Success', 'Comment rejected');
    } catch (error) {
      console.error('Error rejecting comment:', error);
      Alert.alert('Error', 'Failed to reject comment');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPendingComments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPendingComments();
  }, []);

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.content}>{item.text}</Text>
        <Text style={styles.user}>By {item.username}</Text>
        <Text style={styles.date}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleApprove(item._id)} style={styles.approveButton}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleReject(item._id)} style={styles.rejectButton}>
          <Ionicons name="close-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Comment Review</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading comments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Comment Review</Text>
      </View>
      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        renderItem={renderCommentItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No comments to review.</Text>}
        refreshing={refreshing}
        onRefresh={handleRefresh}
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
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
  },
  headerText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginLeft: 16 
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
  content: { 
    fontSize: 16, 
    color: '#333',
    marginBottom: 8
  },
  user: { 
    fontSize: 14, 
    color: '#666',
    marginBottom: 4
  },
  date: {
    fontSize: 12,
    color: '#999'
  },
  actions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 8
  },
  rejectButton: {
    backgroundColor: '#E57373',
    borderRadius: 8,
    padding: 8
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