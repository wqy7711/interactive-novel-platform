import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Image,ActivityIndicator,Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

export default function AIIllustrationScreen({ navigation, route }: { navigation: any, route: any }) {
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  
  const storyId = route.params?.storyId;

  const handleGenerateImage = async () => {
    if (!description || description.trim() === '') {
      Alert.alert('Notice', 'Please enter an image description');
      return;
    }

    try {
      setGenerating(true);
      
      const imageUrl = await services.ai.generateImage(description);
      
      setImageUri(imageUrl);
      setGenerating(false);
    } catch (error) {
      setGenerating(false);
      Alert.alert(
        'Generation Failed', 
        error instanceof Error ? error.message : 'An unknown error occurred during image generation'
      );
    }
  };

  const handleClear = () => {
    setDescription('');
    setImageUri(null);
  };

  const handleInsertImage = async () => {
    if (!imageUri) {
      return;
    }

    if (storyId) {
      try {
        const updatedStory = await services.story.updateStory(storyId, {
          illustrationUrl: imageUri
        });
        
        Alert.alert('Success', 'Image inserted into story');
        navigation.goBack();
      } catch (error) {
        Alert.alert(
          'Insert Failed', 
          error instanceof Error ? error.message : 'An unknown error occurred when inserting image'
        );
      }
    } else {
      navigation.navigate('WriteStory', { illustrationUrl: imageUri });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>AI Illustration</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Describe your image:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="E.g.: A warrior under the moonlight..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          editable={!generating}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.generateButton} 
          onPress={handleGenerateImage}
          disabled={generating || !description}
        >
          {generating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="color-wand-outline" size={24} color="#fff" />
              <Text style={styles.buttonText}>Generate</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={handleClear}
          disabled={generating}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        {generating ? (
          <View style={styles.generatingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.generatingText}>AI is creating your image...</Text>
          </View>
        ) : imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.generatedImage} 
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={60} color="#aaa" />
            <Text style={styles.placeholderText}>AI-generated image will appear here</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.insertButton, 
          { backgroundColor: imageUri && !generating ? '#4CAF50' : '#ccc' }
        ]} 
        onPress={handleInsertImage}
        disabled={!imageUri || generating}
      >
        <Ionicons name="add-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Insert into Story</Text>
      </TouchableOpacity>
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
  
  backButton: {
    padding: 8,
  },
  
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  
  inputContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  
  textInput: {
    backgroundColor: '#e6e6e6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 120,
  },
  
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E57373',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 120,
  },
  
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  imageContainer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
  },
  
  placeholder: {
    width: 250,
    height: 250,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  
  placeholderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  
  generatedImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    backgroundColor: '#e6e6e6',
  },
  
  insertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 20,
  },

  generatingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
  },

  generatingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});