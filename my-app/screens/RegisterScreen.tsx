import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import services from '../services';

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword || !role) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    } 
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      
      const response = await services.auth.register({
        username,
        email,
        password,
        role
      });
      
      setLoading(false);
      
      if (response && typeof response === 'object' && 'message' in response) {
        Alert.alert(
          'Success', 
          response.message || 'Account registered successfully!',
          [
            {
              text: 'Login',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert(
          'Success', 
          'Account registered successfully!',
          [
            {
              text: 'Login',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      
      let errorMessage = 'An unknown error occurred during registration';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="person-add-outline" size={60} color="#4CAF50" />
          <Text style={styles.headerText}>Create Account</Text>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'user' && styles.selectedRole]}
            onPress={() => setRole('user')}
          >
            <Text style={[
              styles.roleText, 
              role === 'user' && { color: '#fff' }
            ]}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'admin' && styles.selectedRole]}
            onPress={() => setRole('admin')}
          >
            <Text style={[
              styles.roleText, 
              role === 'admin' && { color: '#fff' }
            ]}>Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Username"
            style={styles.input}
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            style={styles.input}
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
          <TextInput
            placeholder="Confirm Password"
            style={styles.input}
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            secureTextEntry={true}
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}> Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 30
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 15,
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#4CAF50',
  },
  roleText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#555',
  },
  loginText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});