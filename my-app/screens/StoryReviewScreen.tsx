import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PENDING_STORIES = [
  { id: '1', title: 'The Time Traveler', author: 'Lucy' },
  { id: '2', title: 'Mystic Journey', author: 'Wendy' },
];

export default function StoryReviewScreen({ navigation }: { navigation: any }) {
  const renderStoryItem = ({ item }: { item: { id: string; title: string; author: string } }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>By {item.author}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => alert('Approved')}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => alert('Rejected')}>
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
      <FlatList
        data={PENDING_STORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderStoryItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No pending stories.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
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
  listContainer: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  author: { fontSize: 14, color: '#666' },
  actionButtons: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  approveButton: { backgroundColor: '#4CAF50' },
  rejectButton: { backgroundColor: '#E57373' },
  actionText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10 },
});
