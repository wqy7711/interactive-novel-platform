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

  const fetchStories = async () => {
    try {
      const response = await services.story.getStories();
      
      if (Array.isArray(response)) {
        const approvedStories = response.filter(story => 
          story && (story as Story).status === 'approved'
        );
        
        setStories(approvedStories);
        setFilteredStories(approvedStories);
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
    fetchStories();
  }, []);

  const renderItem = ({ item }: { item: StoryItem }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigateToStoryDetail(item._id)}
    >
      <Image 
        source={item.coverImage ? { uri: item.coverImage } : exampleImage} 
        style={styles.image} 
      />
      <Text style={styles.title}>{item.title || 'Untitled'}</Text>
    </TouchableOpacity>
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
    padding: 8, 
    alignItems: 'center',
    elevation: 2
  },
  image: { 
    width: '100%', 
    height: 120, 
    borderRadius: 8 
  },
  title: { 
    marginTop: 8, 
    fontSize: 14, 
    fontWeight: '600',
    textAlign: 'center'
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