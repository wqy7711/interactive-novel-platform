import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const branches = [
  { id: '1', title: 'Branch 1: Enter the Cave' },
  { id: '2', title: 'Branch 2: Climb the Mountain' },
];

export default function BranchDesignScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Branch Design</Text>
        <TouchableOpacity onPress={() => alert('Branches saved!')}>
          <Ionicons name="save-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={branches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.branchItem}>
            <Text style={styles.branchTitle}>{item.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => alert('Add New Branch')}>
        <Text style={styles.addButtonText}>Add New Branch</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  list: { padding: 16 },
  branchItem: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10 },
  branchTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  addButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', margin: 16 },
  addButtonText: { color: '#fff', fontSize: 16 },
});
