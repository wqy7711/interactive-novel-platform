import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import exampleImage from '../assets/image/example.png';

const DATA = [
  { id: '1', title: 'The Time Traveler', image: exampleImage },
  { id: '2', title: 'Mystic Journey', image: exampleImage },
  { id: '3', title: 'AI Chronicles', image: exampleImage },
  { id: '4', title: 'Fantasy Land', image: exampleImage },
  { id: '5', title: 'Mystery Box', image: exampleImage },
  { id: '6', title: 'Parallel Worlds', image: exampleImage },
];

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');

  const renderItem = ({ item }: { item: { id: string; title: string; image: any } }) => (
    <TouchableOpacity style={styles.card} onPress={() => alert(`You selected: ${item.title}`)}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Discover Stories</Text>
        <Ionicons name="book-outline" size={28} color="#555" />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search stories..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6e6e6', margin: 16, borderRadius: 8, padding: 8 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40 },
  grid: { paddingHorizontal: 8 },
  card: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 8, padding: 8, alignItems: 'center' },
  image: { width: '100%', height: 120, borderRadius: 8 },
  title: { marginTop: 8, fontSize: 14, fontWeight: '600' },
});
