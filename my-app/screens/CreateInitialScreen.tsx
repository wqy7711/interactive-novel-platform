import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Alert,ActivityIndicator,ScrollView,Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function CreateInitialScreen({ navigation }: { navigation: any }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a story title');
      return;
    }

    try {
      setLoading(true);
      
      const user = await api.auth.getCurrentUser();
      if (!user) {
        setLoading(false);
        Alert.alert('Authentication Error', 'Please login to create a story');
        navigation.navigate('Login');
        return;
      }

      const storyData = {
        title,
        description,
        coverImage,
        authorId: user.uid,
        status: 'draft'
      };

      const response = await api.story.createStory(storyData);
      
      setLoading(false);
      
      navigation.navigate('WriteStory', { storyId: response.story._id });
      
    } catch (error) {
      setLoading(false);
      console.error('Error creating story:', error);
      Alert.alert('Error', 'Failed to save story information');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload a cover image');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        setCoverImage(uri);
        
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create New Story</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <Ionicons name="save-outline" size={28} color="#333" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Story Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter story title"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Story Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter story description"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Cover Image</Text>
        {coverImage ? (
          <View style={styles.coverImageContainer}>
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
            <TouchableOpacity 
              style={styles.changeCoverButton} 
              onPress={pickImage}
            >
              <Text style={styles.changeCoverButtonText}>Change Cover</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.coverButton} 
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={24} color="#fff" />
            <Text style={styles.coverButtonText}>Upload Cover</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16 
  },
  headerText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  content: { 
    padding: 16 
  },
  label: { 
    fontSize: 16, 
    marginBottom: 8, 
    fontWeight: 'bold' 
  },
  input: { 
    backgroundColor: '#e6e6e6', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16 
  },
  textArea: { 
    backgroundColor: '#e6e6e6', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16, 
    height: 100, 
    textAlignVertical: 'top' 
  },
  coverButton: { 
    backgroundColor: '#4CAF50', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  coverButtonText: { 
    color: '#fff', 
    fontSize: 16,
    marginLeft: 8
  },
  coverImageContainer: {
    marginBottom: 16,
    alignItems: 'center'
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8
  },
  changeCoverButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 8,
  },
  changeCoverButtonText: {
    color: '#fff',
    fontSize: 14
  },
  nextButton: { 
    backgroundColor: '#4CAF50', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 30,
    height: 48,
    justifyContent: 'center'
  },
  nextButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});