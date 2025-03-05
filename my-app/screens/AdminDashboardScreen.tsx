import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

export default function AdminDashboardScreen({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminInfo = async () => {
      try {
        setLoading(true);
        const user = await services.auth.getCurrentUser();
        
        if (!user) {
          Alert.alert('Error', 'Failed to load admin information');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
          return;
        }
        
        if (user.role !== 'admin') {
          Alert.alert('Access Denied', 'You do not have admin privileges');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
          return;
        }
        
        setUsername(user.username || 'Administrator');
        setLoading(false);
      } catch (error) {
        console.error('Error loading admin info:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to load admin information');
      }
    };
    
    loadAdminInfo();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Admin Dashboard</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.welcomeText}>
          Welcome, {username}
        </Text>
        <Text style={styles.subText}>Manage platform content efficiently</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AdminProfile')}
        >
          <Ionicons name="person-outline" size={28} color="#4CAF50" />
          <Text style={styles.menuText}>Personal Information</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('StoryReview')}
        >
          <Ionicons name="book-outline" size={28} color="#4CAF50" />
          <Text style={styles.menuText}>Story Review</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('UserManagement')}
        >
          <Ionicons name="people-outline" size={28} color="#4CAF50" />
          <Text style={styles.menuText}>User Management</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('CommentReview')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="#4CAF50" />
          <Text style={styles.menuText}>Comment Review</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await services.auth.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9', 
    justifyContent: 'space-between' 
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  menu: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    elevation: 2,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    alignItems: 'center',
    padding: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E57373',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});