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
  const [branchPath, setBranchPath] = useState<Array<{id: string, text: string}>>([]);

  const storyId = route.params?.storyId;
  const parentBranchId = route.params?.parentBranchId;
  const choiceIndex = route.params?.choiceIndex;
  const parentChoiceText = route.params?.parentChoiceText;
  const previousBranchPath = route.params?.branchPath || [];

  useEffect(() => {
    if (!storyId) {
      Alert.alert('Error', 'No story ID provided');
      navigation.goBack();
      return;
    }

    fetchBranches();
  }, [storyId]);

  useEffect(() => {
    if (previousBranchPath.length > 0) {
      setBranchPath(previousBranchPath);
    }
  }, [previousBranchPath]);

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
      
      if (parentBranchId && typeof choiceIndex === 'number') {
        const parentBranch = formattedBranches.find(branch => branch._id === parentBranchId);
        if (parentBranch && parentBranch.choices && parentBranch.choices[choiceIndex]) {
          const targetBranchId = parentBranch.choices[choiceIndex].nextBranchId;
          const targetBranch = formattedBranches.find(branch => branch._id === targetBranchId);
          
          if (parentChoiceText && parentBranch) {
            const newPathItem = {
              id: parentBranch._id,
              text: parentChoiceText
            };
            
            if (!branchPath.some(item => item.id === newPathItem.id)) {
              setBranchPath(prevPath => [...prevPath, newPathItem]);
            }
          }
          
          if (targetBranch) {
            setCurrentBranch(targetBranch);
            setBranchText(targetBranch.text || '');
            setChoices(targetBranch.choices || []);
            setEditing(true);
          } else {
            handleAddBranch(targetBranchId);
          }
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load branches');
    }
  };

  const handleAddBranch = (predefinedId?: string) => {
    setCurrentBranch(null);
    setBranchText('');
    setChoices([]);
    setEditing(true);
    
    if (predefinedId) {
      setCurrentBranch({
        _id: predefinedId,
        text: '',
        choices: []
      });
    }
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
      nextBranchId: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
        
        let updatedBranches;
        
        if (currentBranches.some(branch => branch._id === currentBranch._id)) {
          updatedBranches = currentBranches.map((branch: Branch) => {
            if (branch._id === currentBranch._id) {
              return { 
                _id: branch._id,
                ...branchData 
              };
            }
            return branch;
          });
        } else {
          updatedBranches = [
            ...currentBranches,
            {
              _id: currentBranch._id,
              ...branchData
            }
          ];
        }

        await services.story.updateStory(storyId, { branches: updatedBranches });
      } else {
        await services.story.addBranch(storyId, branchData);
      }

      setSaving(false);
      setEditing(false);
      await fetchBranches();
      Alert.alert('Success', 'Branch saved successfully');
      return true;
    } catch (error) {
      setSaving(false);
      console.error('Error saving branch:', error);
      Alert.alert('Error', 'Failed to save branch');
      return false;
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

  const handleContinueWriting = (choiceIndex: number) => {
    if (!currentBranch) return;
    
    if (!currentBranch.choices || !currentBranch.choices[choiceIndex]) {
      Alert.alert('Error', 'Invalid choice');
      return;
    }
    
    const targetBranchId = currentBranch.choices[choiceIndex].nextBranchId;
    const choiceText = currentBranch.choices[choiceIndex].text;

    handleSaveBranch().then((success) => {
      if (success) {
        const targetBranch = branches.find(b => b._id === targetBranchId);
        
        const updatedPath = [...branchPath];
        if (currentBranch) {
          const newPathItem = {
            id: currentBranch._id,
            text: choiceText
          };

          if (!updatedPath.some(item => item.id === newPathItem.id && item.text === newPathItem.text)) {
            updatedPath.push(newPathItem);
          }
        }
        
        if (targetBranch) {
          handleEditBranch(targetBranch);
          setBranchPath(updatedPath);
        } else {
          navigation.push('BranchDesign', { 
            storyId: storyId, 
            parentBranchId: currentBranch._id,
            choiceIndex: choiceIndex,
            parentChoiceText: choiceText,
            branchPath: updatedPath
          });
        }
      }
    });
  };

  const handleContinueStory = (choiceIndex: number) => {
    if (!currentBranch) return;
    
    if (!currentBranch.choices || !currentBranch.choices[choiceIndex]) {
      Alert.alert('Error', 'Invalid choice');
      return;
    }
    
    const targetBranchId = currentBranch.choices[choiceIndex].nextBranchId;
    const choiceText = currentBranch.choices[choiceIndex].text;
    
    handleSaveBranch().then((success) => {
      if (success) {
        const updatedPath = [...branchPath];
        if (currentBranch) {
          const newPathItem = {
            id: currentBranch._id,
            text: choiceText
          };
          
          if (!updatedPath.some(item => item.id === newPathItem.id && item.text === newPathItem.text)) {
            updatedPath.push(newPathItem);
          }
        }
        
        navigation.navigate('WriteStory', { 
          storyId: storyId,
          branchId: targetBranchId,
          isNewBranch: true,
          isNewContent: true,
          branchPath: updatedPath,
          parentChoiceText: choiceText
        });
      }
    });
  };

  const renderChoiceItem = ({ item, index }: { item: { text: string; nextBranchId: string }, index: number }) => (
    <View style={styles.choiceItem}>
      <Text style={styles.choiceText}>{item.text}</Text>
      <View style={styles.choiceActions}>
        <TouchableOpacity onPress={() => handleRemoveChoice(index)}>
          <Ionicons name="close-circle" size={22} color="#E57373" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBranchPathItem = ({ item, index }: { item: { id: string, text: string }, index: number }) => (
    <View style={styles.pathItem}>
      <Text style={styles.pathItemText}>{item.text}</Text>
      {index < branchPath.length - 1 && (
        <Ionicons name="chevron-forward" size={16} color="#666" />
      )}
    </View>
  );

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

        {branchPath.length > 0 && (
          <View style={styles.pathContainer}>
            <FlatList
              data={branchPath}
              renderItem={renderBranchPathItem}
              keyExtractor={(item, index) => `path-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pathList}
            />
          </View>
        )}

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
              <View style={styles.choiceItemWithButtons}>
                <View style={styles.choiceContent}>
                  <Text style={styles.choiceText}>{item.text}</Text>
                  <TouchableOpacity onPress={() => handleRemoveChoice(index)}>
                    <Ionicons name="close-circle" size={22} color="#E57373" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.choiceButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.choiceButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => handleContinueStory(index)}
                  >
                    <Ionicons name="create-outline" size={16} color="#fff" />
                    <Text style={styles.choiceButtonText}>Continue Story</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.choiceButton, { backgroundColor: '#2196F3' }]}
                    onPress={() => handleContinueWriting(index)}
                  >
                    <Ionicons name="git-branch-outline" size={16} color="#fff" />
                    <Text style={styles.choiceButtonText}>Add Branches</Text>
                  </TouchableOpacity>
                </View>
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

      {branchPath.length > 0 && (
        <View style={styles.pathContainer}>
          <FlatList
            data={branchPath}
            renderItem={renderBranchPathItem}
            keyExtractor={(item, index) => `path-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pathList}
          />
        </View>
      )}

      <FlatList
        data={branches}
        keyExtractor={(item) => item._id}
        renderItem={renderBranchItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No branches created yet. Start by adding a branch.</Text>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={() => handleAddBranch()}>
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
  pathContainer: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 8,
  },
  pathList: {
    paddingHorizontal: 16,
  },
  pathItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  pathItemText: {
    fontSize: 12,
    color: '#333',
    marginRight: 4,
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
    maxHeight: 250,
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
  choiceItemWithButtons: {
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden'
  },
  choiceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  choiceButtonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  choiceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  choiceButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  choiceText: {
    flex: 1,
    fontSize: 14
  },
  choiceActions: {
    flexDirection: 'row',
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