import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, SafeAreaView, TouchableOpacity, Alert,ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

interface FavoriteItem {
  _id: string;
  storyId: {
    _id: string;
    title: string;
    coverImage: string;
  };
}

export default function FavoritesScreen({ navigation }: { navigation: any }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const initData = async () => {
    try {
      const user = await services.auth.getCurrentUser();
      if (user) {
        setUserId(user.uid);
        await fetchFavorites(user.uid);
      } else {
        setLoading(false);
        Alert.alert('Session Expired', 'Please login again');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load favorites');
    }
  };

  const fetchFavorites = async (uid: string) => {
    try {
      const response = await services.favorite.getFavorites(uid);
      setFavorites(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load favorites');
    }
  };

  const handleRemove = (favoriteId: string) => {
    Alert.alert(
      'Remove',
      'Are you sure you want to remove this from favorites?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              await services.favorite.removeFavorite(favoriteId);
              setFavorites(prevFavorites => 
                prevFavorites.filter(item => item._id !== favoriteId)
              );
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Error', 'Failed to remove favorite');
            }
          }
        }
      ]
    );
  };

  const navigateToRead = (storyId: string) => {
    navigation.navigate('Read', { storyId });
  };

  const handleRefresh = async () => {
    if (!userId) return;
    
    setRefreshing(true);
    await fetchFavorites(userId);
    setRefreshing(false);
  };

  useEffect(() => {
    initData();
  }, []);

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardContent} 
        onPress={() => navigateToRead(item.storyId._id)}
      >
        <Image 
          source={{ uri: item.storyId.coverImage || 'https://via.placeholder.com/80' }} 
          style={styles.image} 
        />
        <View style={styles.info}>
          <Text style={styles.title}>{item.storyId.title}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => handleRemove(item._id)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>My Favorites</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
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
        <Text style={styles.headerText}>My Favorites</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No favorites yet. Discover more stories to add to your favorites!</Text>
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
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
  },
  info: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#E57373',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
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