import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WriteStoryScreen({ navigation }: { navigation: any }) {
  const [mainStory, setMainStory] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Write Story</Text>
        <TouchableOpacity onPress={() => alert('Story saved!')}>
          <Ionicons name="save-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Main Story</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Write the main storyline here..."
          multiline
          value={mainStory}
          onChangeText={setMainStory}
        />

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BranchDesign')}>
          <Text style={styles.buttonText}>Add Branch</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => alert('Upload Image')}>
          <Text style={styles.buttonText}>Upload Local Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AIIllustration')}>
          <Text style={styles.buttonText}>Generate AI Image</Text>
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
  textArea: { backgroundColor: '#e6e6e6', borderRadius: 8, padding: 12, marginBottom: 16, height: 150 },
  button: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16 },
});
