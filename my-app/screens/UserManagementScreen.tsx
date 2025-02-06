import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const USERS = [
  { id: '1', name: 'Lucy', email: 'lucy@example.com' },
  { id: '2', name: 'Wendy', email: 'wendy@example.com' },
];

export default function UserManagementScreen({ navigation }: { navigation: any }) {
  const renderUserItem = ({ item }: { item: { id: string; name: string; email: string } }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => alert(`Edit user: ${item.name}`)} style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alert(`Delete user: ${item.name}`)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#E57373" />
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
        <Text style={styles.headerText}>User Management</Text>
      </View>
      <FlatList
        data={USERS}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No users available.</Text>}
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
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 16 },
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
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#666' },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, 
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10 },
});
