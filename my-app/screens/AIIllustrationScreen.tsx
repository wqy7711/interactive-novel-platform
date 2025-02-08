import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AIIllustrationScreen({ navigation }: { navigation: any }) {
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>AI Illustration</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Describe the image:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="E.g. A warrior under the moonlight..."
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.generateButton} onPress={() => alert('Generating Image...')}>
          <Ionicons name="color-wand-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Generate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={() => setDescription('')}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.generatedImage} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={60} color="#aaa" />
            <Text style={styles.placeholderText}>AI-generated image will appear here</Text>
          </View>
        )}
      </View>
      <TouchableOpacity 
        style={[styles.insertButton, { backgroundColor: imageUri ? '#4CAF50' : '#ccc' }]} 
        onPress={() => imageUri ? alert('Image Inserted!') : null}
        disabled={!imageUri}
      >
        <Ionicons name="add-outline" size={24} color="#fff" />
        <Text style={styles.buttonText}>Insert into Story</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', justifyContent: 'space-between' },
  
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
    },
  
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E57373',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
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
    },
  
    generatedImage: {
      width: 250,
      height: 250,
      borderRadius: 12,
    },
  
    insertButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginHorizontal: 20,
      borderRadius: 8,
      marginBottom: 20,
    },
  });
