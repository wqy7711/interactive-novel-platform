import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ReadScreen from './screens/ReadScreen';
import CreateScreen from './screens/CreateScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import BookmarksScreen from './screens/BookmarksScreen';


const Stack = createNativeStackNavigator();

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
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Home' }} 
        />
        <Stack.Screen 
          name="Read" 
          component={ReadScreen} 
          options={{ title: 'Read Story' }} 
        />
        <Stack.Screen 
          name="Create" 
          component={CreateScreen} 
          options={{ title: 'Create Story' }} 
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}


