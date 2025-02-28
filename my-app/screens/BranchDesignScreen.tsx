import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

interface Branch {
  _id: string;
  text?: string;
  choices?: Array<{
    text: string;
    nextBranchId: string;
  }>;
}

interface Story {
  _id: string;
  branches?: Branch[];
  title?: string;
  description?: string;
  status?: string;
  coverImage?: string;
  authorId?: string;
}

export default function BranchDesignScreen({ navigation, route }: { navigation: any; route: any }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [branchText, setBranchText] = useState('');
  const [choices, setChoices] = useState<Array<{ text: string; nextBranchId: string }>>([]);
  const [newChoiceText, setNewChoiceText] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const storyId = route.params?.storyId;

  useEffect(() => {
    if (!storyId) {
      Alert.alert('Error', 'No story ID provided');
      navigation.goBack();
      return;
    }

    fetchBranches();
  }, [storyId]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await services.story.getBranches(storyId);
      
      const branchArray = Array.isArray(response) ? response : [];
      
      const formattedBranches: Branch[] = branchArray.map(item => ({
        _id: item._id || `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: item.text || '',
        choices: Array.isArray(item.choices) ? item.choices : []
      }));
      
      setBranches(formattedBranches);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load branches');
    }
  };

  const handleAddBranch = () => {
    setCurrentBranch(null);
    setBranchText('');
    setChoices([]);
    setEditing(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setCurrentBranch(branch);
    setBranchText(branch.text || '');
    setChoices(branch.choices || []);
    setEditing(true);
  };

  const handleAddChoice = () => {
    if (!newChoiceText.trim()) {
      Alert.alert('Error', 'Please enter choice text');
      return;
    }

    const newChoice = {
      text: newChoiceText,
      nextBranchId: `branch_${Date.now()}`
    };

    setChoices([...choices, newChoice]);
    setNewChoiceText('');
  };

  const handleRemoveChoice = (index: number) => {
    const updatedChoices = [...choices];
    updatedChoices.splice(index, 1);
    setChoices(updatedChoices);
  };

  const handleSaveBranch = async () => {
    if (!branchText.trim()) {
      Alert.alert('Error', 'Please enter branch text');
      return;
    }

    try {
      setSaving(true);
      const branchData = {
        text: branchText,
        choices: choices
      };

      if (currentBranch) {
        const storyData: Story = await services.story.getStoryById(storyId);
        
        if (!storyData) {
          throw new Error('Story data not found');
        }
        
        const currentBranches: Branch[] = Array.isArray(storyData.branches) ? storyData.branches : [];
        
        const updatedBranches = currentBranches.map((branch: Branch) => {
          if (branch._id === currentBranch._id) {
            return { 
              _id: branch._id,
              ...branchData 
            };
          }
          return branch;
        });

        await services.story.updateStory(storyId, { branches: updatedBranches });
      } else {
        await services.story.addBranch(storyId, branchData);
      }

      setSaving(false);
      setEditing(false);
      await fetchBranches();
      Alert.alert('Success', 'Branch saved successfully');
    } catch (error) {
      setSaving(false);
      console.error('Error saving branch:', error);
      Alert.alert('Error', 'Failed to save branch');
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      await services.story.deleteBranch(storyId, branchId);
      await fetchBranches();
      Alert.alert('Success', 'Branch deleted successfully');
    } catch (error) {
      console.error('Error deleting branch:', error);
      Alert.alert('Error', 'Failed to delete branch');
    }
  };

  const renderBranchItem = ({ item }: { item: Branch }) => (
    <View style={styles.branchItem}>
      <Text style={styles.branchTitle}>
        {item.text ? (item.text.length > 30 ? `${item.text.substring(0, 30)}...` : item.text) : 'No text'}
      </Text>
      <Text style={styles.choiceCount}>
        {Array.isArray(item.choices) ? `${item.choices.length} choices` : 'No choices'}
      </Text>
      
      <View style={styles.branchActions}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => handleEditBranch(item)}
        >
          <Ionicons name="create-outline" size={22} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Branch',
              'Are you sure you want to delete this branch?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => handleDeleteBranch(item._id) }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={22} color="#E57373" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Branch Design</Text>
          <View style={{ width: 28 }}></View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading branches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (editing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setEditing(false)}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>{currentBranch ? 'Edit Branch' : 'New Branch'}</Text>
          <TouchableOpacity onPress={handleSaveBranch} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#333" />
            ) : (
              <Ionicons name="save-outline" size={28} color="#333" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.editContainer}>
          <Text style={styles.label}>Branch Text</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter branch text/narrative..."
            multiline
            value={branchText}
            onChangeText={setBranchText}
          />

          <Text style={styles.label}>Choices</Text>
          <FlatList
            data={choices}
            keyExtractor={(_, index) => `choice-${index}`}
            renderItem={({ item, index }) => (
              <View style={styles.choiceItem}>
                <Text style={styles.choiceText}>{item.text}</Text>
                <TouchableOpacity onPress={() => handleRemoveChoice(index)}>
                  <Ionicons name="close-circle" size={22} color="#E57373" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No choices added yet</Text>
            }
            style={styles.choicesList}
          />

          <View style={styles.addChoiceContainer}>
            <TextInput
              style={styles.choiceInput}
              placeholder="Enter choice text..."
              value={newChoiceText}
              onChangeText={setNewChoiceText}
            />
            <TouchableOpacity style={styles.addChoiceButton} onPress={handleAddChoice}>
              <Ionicons name="add-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Branch Design</Text>
        <View style={{ width: 28 }}></View>
      </View>

      <FlatList
        data={branches}
        keyExtractor={(item) => item._id}
        renderItem={renderBranchItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No branches created yet. Start by adding a branch.</Text>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddBranch}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add New Branch</Text>
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
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16 
  },
  headerText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  list: { 
    padding: 16,
    flexGrow: 1
  },
  branchItem: { 
    padding: 16, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    marginBottom: 12,
    elevation: 2
  },
  branchTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333',
    marginBottom: 8
  },
  choiceCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  branchActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  editButton: {
    padding: 8,
    marginRight: 8
  },
  deleteButton: {
    padding: 8
  },
  addButton: { 
    backgroundColor: '#4CAF50', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  addButtonText: { 
    color: '#fff', 
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold'
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  editContainer: {
    flex: 1,
    padding: 16
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  textArea: {
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16
  },
  choicesList: {
    maxHeight: 200,
    marginBottom: 16
  },
  choiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  choiceText: {
    flex: 1,
    fontSize: 14
  },
  addChoiceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  choiceInput: {
    flex: 1,
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    padding: 12,
    marginRight: 8
  },
  addChoiceButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8
  }
});