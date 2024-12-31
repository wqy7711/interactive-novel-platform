import React, { useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_DATA = [
  { id: '1', title: 'The Time Traveler', image: 'https://placekitten.com/200/300' },
  { id: '2', title: 'Mystic Journey', image: 'https://placekitten.com/200/301' },
  { id: '3', title: 'Fantasy Land', image: 'https://placekitten.com/200/302' },
  { id: '4', title: 'Parallel Worlds', image: 'https://placekitten.com/200/303' },
];

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState(INITIAL_DATA);

  const handleRemove = (id: string) => {
    Alert.alert('Remove', `Are you sure you want to remove this item?`);
  };

  const renderItem = ({ item }: { item: { id: string; title: string; image: string } }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Favorites</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No favorites yet.</Text>}
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
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
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
    marginTop: 20,
  },
});
