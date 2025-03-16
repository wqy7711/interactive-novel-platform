import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await services.auth.getCurrentUser();
        if (user) {
          setUserInfo(user);
        } else {
          Alert.alert('Session Expired', 'Please login again');
          navigation.navigate('Login');
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error fetching user info:', error);
        Alert.alert(
          'Error',
          'Failed to load profile information'
        );
      }
    };

    fetchUserInfo();
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserInfo();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await services.auth.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const navigateToMyStories = () => {
    navigation.navigate('MyStories');
  };

  const navigateToBookmarks = () => {
    navigation.navigate('Bookmarks');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Image
          source={{ uri: userInfo?.avatar || 'https://placekitten.com/150/150' }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{userInfo?.username || 'User'}</Text>
        <Text style={styles.userEmail}>{userInfo?.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.optionList}>
        <TouchableOpacity style={styles.optionItem} onPress={handleEditProfile}>
          <Ionicons name="person-outline" size={24} color="#4CAF50" />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={navigateToMyStories}>
          <Ionicons name="book-outline" size={24} color="#4CAF50" />
          <Text style={styles.optionText}>My Stories</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={navigateToBookmarks}>
          <Ionicons name="bookmark-outline" size={24} color="#4CAF50" />
          <Text style={styles.optionText}>My Bookmarks</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#E57373" />
          <Text style={[styles.optionText, { color: '#E57373' }]}>Logout</Text>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  profileHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: '#f0f0f0',
    marginTop: 5,
  },
  optionList: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    borderRadius: 20,
  },
});