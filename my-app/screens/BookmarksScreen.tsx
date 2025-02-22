import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert,ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

interface BookmarkItem {
  _id: string;
  storyId: {
    _id: string;
    title: string;
  };
  chapter: string;
  progress: string;
}

export default function BookmarksScreen({ navigation }: { navigation: any }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const initData = async () => {
    try {
      const user = await api.auth.getCurrentUser();
      if (user) {
        setUserId(user.uid);
        await fetchBookmarks(user.uid);
      } else {
        setLoading(false);
        Alert.alert('Session Expired', 'Please login again');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load bookmarks');
    }
  };

  const fetchBookmarks = async (uid: string) => {
    try {
      const response = await api.bookmark.getBookmarks(uid);
      setBookmarks(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load bookmarks');
    }
  };

  const handleRemove = (bookmarkId: string) => {
    Alert.alert(
      'Remove Bookmark',
      'This bookmark will be removed.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              await api.bookmark.removeBookmark(bookmarkId);
              setBookmarks(prevBookmarks => 
                prevBookmarks.filter(item => item._id !== bookmarkId)
              );
            } catch (error) {
              console.error('Error removing bookmark:', error);
              Alert.alert('Error', 'Failed to remove bookmark');
            }
          }
        }
      ]
    );
  };

  const continueReading = (bookmark: BookmarkItem) => {
    navigation.navigate('Read', { 
      storyId: bookmark.storyId._id,
      chapter: bookmark.chapter,
      progress: bookmark.progress 
    });
  };

  const handleRefresh = async () => {
    if (!userId) return;
    
    setRefreshing(true);
    await fetchBookmarks(userId);
    setRefreshing(false);
  };

  useEffect(() => {
    initData();
  }, []);

  const renderItem = ({ item }: { item: BookmarkItem }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => continueReading(item)}
    >
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.storyId.title}</Text>
        <Text style={styles.chapter}>{item.chapter}</Text>
        <Text style={styles.progress}>Progress: {item.progress}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => handleRemove(item._id)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>My Bookmarks</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading bookmarks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Bookmarks</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No bookmarks yet. Start reading stories to add bookmarks!</Text>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
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
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 12,
    overflow: 'hidden',
    padding: 12,
  },
  infoContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chapter: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  progress: {
    fontSize: 12,
    color: '#888',
  },
  removeButton: {
    backgroundColor: '#E57373',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    width: 50,
    alignItems: 'center',
  },
  placeholder: {
    width: 50,
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