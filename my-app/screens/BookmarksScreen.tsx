import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_DATA = [
  { id: '1', title: 'The Time Traveler', chapter: 'Chapter 3: The Beginning', progress: '45%' },
  { id: '2', title: 'Mystic Journey', chapter: 'Chapter 2: The Awakening', progress: '25%' },
  { id: '3', title: 'Fantasy Land', chapter: 'Chapter 5: The Portal', progress: '60%' },
  { id: '4', title: 'Parallel Worlds', chapter: 'Chapter 1: Discovery', progress: '10%' },
];

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState(INITIAL_DATA);

  const handleRemove = (id: string) => {
    Alert.alert('Remove Bookmark', 'This bookmark will be removed.');
  };

  const renderItem = ({ item }: { item: { id: string; title: string; chapter: string; progress: string } }) => (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.chapter}>{item.chapter}</Text>
        <Text style={styles.progress}>Progress: {item.progress}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Bookmarks</Text>
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookmarks yet.</Text>}
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
});
