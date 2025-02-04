import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminProfileScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Image
          source={{ uri: 'https://placekitten.com/150/150' }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>Admin</Text>
        <Text style={styles.userEmail}>admin@example.com</Text>
      </View>

      <View style={styles.optionList}>
        <TouchableOpacity style={styles.optionItem} onPress={() => alert('Modify Profile')}>
          <Ionicons name="person-outline" size={24} color="#4CAF50" />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={() => alert('System Settings')}>
          <Ionicons name="settings-outline" size={24} color="#4CAF50" />
          <Text style={styles.optionText}>System Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionItem} onPress={() => alert('Logout')}>
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
