import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ReadScreen from './screens/ReadScreen';
import CreateInitialScreen from './screens/CreateInitialScreen';
import WriteStoryScreen from './screens/WriteStoryScreen';
import BranchDesignScreen from './screens/BranchDesignScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import MyStoriesScreen from './screens/MyStoriesScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminProfileScreen from './screens/AdminProfileScreen';
import StoryReviewScreen from './screens/StoryReviewScreen';
import UserManagementScreen from './screens/UserManagementScreen';
import CommentReviewScreen from './screens/CommentReviewScreen';
import AIIllustrationScreen from './screens/AIIllustrationScreen';
import StoryDetailScreen from './screens/StoryDetailScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#f9f9f9',
          width: 240,
        },
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Create" component={CreateInitialScreen} />
      <Drawer.Screen name="Favorites" component={FavoritesScreen} />
      <Drawer.Screen name="Bookmarks" component={BookmarksScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { color: '#333', fontWeight: 'bold' },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Login' }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Register' }} 
        />
        <Stack.Screen 
          name="MainDrawer" 
          component={MainDrawer} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Read" 
          component={ReadScreen} 
          options={{ title: 'Read Story' }} 
        />
        <Stack.Screen 
          name="StoryDetail" 
          component={StoryDetailScreen} 
          options={{ title: 'Story Details', headerShown: false }} 
        />
        <Stack.Screen 
          name="CreateInitial" 
          component={CreateInitialScreen} 
          options={{ title: 'Create New Story' }} 
        />
        <Stack.Screen 
          name="WriteStory" 
          component={WriteStoryScreen} 
          options={{ title: 'Write Story' }} 
        />
        <Stack.Screen 
          name="BranchDesign" 
          component={BranchDesignScreen} 
          options={{ title: 'Branch Design' }} 
        />
        <Stack.Screen 
          name="Favorites" 
          component={FavoritesScreen} 
          options={{ title: 'Favorites' }} 
        />
        <Stack.Screen 
          name="Bookmarks" 
          component={BookmarksScreen} 
          options={{ title: 'Bookmarks' }} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: 'Profile' }} 
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen} 
          options={{ title: 'Edit Profile', headerShown: false }} 
        />
        <Stack.Screen 
          name="MyStories" 
          component={MyStoriesScreen} 
          options={{ title: 'My Stories', headerShown: false }} 
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboardScreen} 
          options={{ title: 'Admin Dashboard' }} 
        />
        <Stack.Screen 
          name="AdminProfile" 
          component={AdminProfileScreen} 
          options={{ title: 'Admin Profile' }} 
        />
        <Stack.Screen 
          name="StoryReview" 
          component={StoryReviewScreen} 
          options={{ title: 'Story Review' }} 
        />
        <Stack.Screen 
          name="UserManagement" 
          component={UserManagementScreen} 
          options={{ title: 'User Management' }} 
        />
        <Stack.Screen 
          name="CommentReview" 
          component={CommentReviewScreen} 
          options={{ title: 'Comment Review' }} 
        />
        <Stack.Screen 
          name="AIIllustration" 
          component={AIIllustrationScreen} 
          options={{ title: 'AI Illustration' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}