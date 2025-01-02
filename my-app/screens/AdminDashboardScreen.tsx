import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PENDING_STORIES = [
  { id: '1', title: 'The Time Traveler', author: 'Lucy' },
  { id: '2', title: 'Mystic Journey', author: 'Wendy' },
];

export default function AdminDashboardScreen() {
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
        <Text style={styles.headerText}>Admin Dashboard</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Stories</Text>
        <FlatList
          data={PENDING_STORIES}
          keyExtractor={(item) => item.id}
          renderItem={renderStoryItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No pending stories.</Text>}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage Comments</Text>
        <TouchableOpacity style={styles.sectionButton} onPress={() => alert('Manage Comments')}>
          <Ionicons name="chatbubble-outline" size={24} color="#fff" />
          <Text style={styles.sectionButtonText}>Go to Comments</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage Users</Text>
        <TouchableOpacity style={styles.sectionButton} onPress={() => alert('Manage Users')}>
          <Ionicons name="person-outline" size={24} color="#fff" />
          <Text style={styles.sectionButtonText}>Go to Users</Text>
        </TouchableOpacity>
      </View>
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
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  listContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  author: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#E57373',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  sectionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});
