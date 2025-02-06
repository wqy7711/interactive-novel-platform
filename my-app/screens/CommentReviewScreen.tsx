import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COMMENTS = [
  { id: '1', content: 'Great story!', user: 'Lucy' },
  { id: '2', content: 'Could use some improvements.', user: 'Wendy' },
];

export default function CommentReviewScreen({ navigation }: { navigation: any }) {
  const renderCommentItem = ({ item }: { item: { id: string; content: string; user: string } }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.user}>By {item.user}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => alert('Approve Comment')}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alert('Delete Comment')}>
          <Ionicons name="trash-outline" size={24} color="#E57373" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Comment Review</Text>
      </View>
      <FlatList
        data={COMMENTS}
        keyExtractor={(item) => item.id}
        renderItem={renderCommentItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No comments to review.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
  },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 16 },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: { fontSize: 16, color: '#333' },
  user: { fontSize: 14, color: '#666' },
  actions: { flexDirection: 'row', gap: 12 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10 },
});
