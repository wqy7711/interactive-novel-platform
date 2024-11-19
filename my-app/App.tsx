import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function App() {

  const handlePress = () => {
    Alert.alert("Welcome", "This is a test ！", [{ text: "Successful" }]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fictify</Text>
      <Text style={styles.subtitle}>Welcome to the testing page</Text>
      <Button title="Click to test" onPress={handlePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});

