import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CreateInitialScreen({ navigation }: { navigation: any }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create New Story</Text>
        <TouchableOpacity onPress={() => alert('Story info saved!')}>
          <Ionicons name="save-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
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

        <TouchableOpacity style={styles.coverButton} onPress={() => alert('Upload Cover')}>
          <Text style={styles.coverButtonText}>Upload Cover</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('WriteStory')}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  content: { padding: 16 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#e6e6e6', borderRadius: 8, padding: 12, marginBottom: 16 },
  textArea: { backgroundColor: '#e6e6e6', borderRadius: 8, padding: 12, marginBottom: 16, height: 100 },
  coverButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  coverButtonText: { color: '#fff', fontSize: 16 },
  nextButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
