import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity,Alert,ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

interface User {
  _id: string;
  uid: string;
  username: string;
  email: string;
  role: string;
}

export default function UserManagementScreen({ navigation }: { navigation: any }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await services.admin.getUsers();
      setUsers(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleEdit = (user: User) => {
    Alert.alert(
      'Edit User',
      `Edit user: ${user.username}`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Block User',
          style: 'destructive',
          onPress: () => handleBlockUser(user)
        },
        {
          text: 'Unblock User',
          onPress: () => handleUnblockUser(user)
        }
      ]
    );
  };

  const handleBlockUser = async (user: User) => {
    try {
      await services.admin.blockUser(user._id);
      Alert.alert('Success', `User ${user.username} has been blocked`);
      fetchUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
      Alert.alert('Error', 'Failed to block user');
    }
  };

  const handleUnblockUser = async (user: User) => {
    try {
      await services.admin.unblockUser(user._id);
      Alert.alert('Success', `User ${user.username} has been unblocked`);
      fetchUsers();
    } catch (error) {
      console.error('Error unblocking user:', error);
      Alert.alert('Error', 'Failed to unblock user');
    }
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.username}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await services.admin.deleteUser(user._id);
              setUsers(prevUsers => prevUsers.filter(u => u._id !== user._id));
              Alert.alert('Success', `User ${user.username} has been deleted`);
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={[
          styles.role, 
          item.role === 'blocked' && styles.blockedRole
        ]}>
          {item.role === 'blocked' ? 'Blocked' : item.role}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          onPress={() => handleEdit(item)} 
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDelete(item)} 
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color="#E57373" />
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
          <Text style={styles.headerText}>User Management</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading users...</Text>
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
        <Text style={styles.headerText}>User Management</Text>
      </View>
      
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users available.</Text>
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
    padding: 16 
  },
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
  name: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  email: { 
    fontSize: 14, 
    color: '#666',
    marginTop: 4
  },
  role: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: 'bold'
  },
  blockedRole: {
    color: '#E57373'
  },
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
  emptyText: { 
    textAlign: 'center', 
    color: '#999', 
    marginTop: 10 
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
  }
});