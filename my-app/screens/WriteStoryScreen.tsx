import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity,Alert,ActivityIndicator,ScrollView,Image} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

export default function WriteStoryScreen({ navigation, route }: { navigation: any, route: any }) {
  const [mainStory, setMainStory] = useState('');
  const [storyId, setStoryId] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(null);

  useEffect(() => {
    const id = route.params?.storyId;
    if (id) {
      setStoryId(id);
      fetchStoryData(id);
    } else {
      Alert.alert('Error', 'No story ID provided');
      navigation.goBack();
    }

    if (route.params?.illustrationUrl) {
      setIllustrationUrl(route.params.illustrationUrl);
    }
  }, [route.params]);

  const fetchStoryData = async (id: string) => {
    try {
      setLoading(true);
      const story = await services.story.getStoryById(id);
      setStoryData(story);
      
      if (story.branches && story.branches.length > 0) {
        setMainStory(story.branches[0].text || '');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching story:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load story data');
    }
  };

  const handleSave = async () => {
    if (!storyId) return;
    
    if (!mainStory.trim()) {
      Alert.alert('Error', 'Please write some content for your story');
      return;
    }

    try {
      setSaving(true);
      
      let updatedStory;
      
      if (storyData && storyData.branches && storyData.branches.length > 0) {
        const firstBranchId = storyData.branches[0]._id;
        updatedStory = await services.story.updateStory(storyId, {
          branches: [
            {
              _id: firstBranchId,
              text: mainStory,
              choices: storyData.branches[0].choices || []
            },
            ...storyData.branches.slice(1)
          ]
        });
      } else {
        const branchData = {
          text: mainStory,
          choices: []
        };
        await services.story.addBranch(storyId, branchData);
        updatedStory = await services.story.getStoryById(storyId);
      }
      
      if (illustrationUrl) {
        updatedStory = await services.story.updateStory(storyId, {
          illustrationUrl
        });
      }
      
      setStoryData(updatedStory);
      setSaving(false);
      
      Alert.alert('Success', 'Story saved successfully');
    } catch (error) {
      console.error('Error saving story:', error);
      setSaving(false);
      Alert.alert('Error', 'Failed to save story');
    }
  };

  const navigateToBranchDesign = () => {
    if (!storyId) return;
    navigation.navigate('BranchDesign', { storyId });
  };

  const navigateToUploadImage = () => {
    Alert.alert('Upload Image', 'This would open your device image picker');
  };

  const navigateToAIIllustration = () => {
    if (!storyId) return;
    navigation.navigate('AIIllustration', { storyId });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Write Story</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading story...</Text>
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
        <Text style={styles.headerText}>Write Story</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <Ionicons name="save-outline" size={28} color="#333" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {illustrationUrl && (
          <View style={styles.illustrationContainer}>
            <Image source={{ uri: illustrationUrl }} style={styles.illustration} />
          </View>
        )}

        <Text style={styles.label}>Main Story</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Write the main storyline here..."
          multiline
          value={mainStory}
          onChangeText={setMainStory}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={navigateToBranchDesign}
        >
          <Ionicons name="git-branch-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add Branch</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={navigateToUploadImage}
        >
          <Ionicons name="image-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Upload Local Image</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={navigateToAIIllustration}
        >
          <Ionicons name="color-wand-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Generate AI Image</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.publishButton]} 
          onPress={() => {
            Alert.alert(
              'Submit Story',
              'Submit your story for review?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel'
                },
                {
                  text: 'Submit',
                  onPress: async () => {
                    try {
                      await services.story.updateStory(storyId!, { status: 'pending' });
                      Alert.alert('Success', 'Story submitted for review');
                      navigation.navigate('Home');
                    } catch (error) {
                      console.error('Error submitting story:', error);
                      Alert.alert('Error', 'Failed to submit story');
                    }
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Submit for Review</Text>
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
  textArea: { 
    backgroundColor: '#e6e6e6', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16, 
    height: 200,
    textAlignVertical: 'top'
  },
  button: { 
    backgroundColor: '#4CAF50', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16,
    marginLeft: 8
  },
  publishButton: {
    backgroundColor: '#3949AB',
    marginTop: 16
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
  illustrationContainer: {
    marginBottom: 16,
    alignItems: 'center'
  },
  illustration: {
    width: '100%',
    height: 200,
    borderRadius: 8
  }
});