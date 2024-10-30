import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function InstructionsTab() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How to Use This Platform</Text>
      <Text style={styles.subtitle}>Learn why we need your photos and how to submit them</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why We Need Your Photos</Text>
        <Text style={styles.text}>Your interior photos help us:</Text>
        <Text style={styles.listItem}>• Identify potential maintenance issues early</Text>
        <Text style={styles.listItem}>• Plan renovations and improvements more effectively</Text>
        <Text style={styles.listItem}>• Ensure the safety and comfort of all our tenants</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Submit Photos</Text>
        <Text style={styles.listItem}>1. Log in to your account using your email and password</Text>
        <Text style={styles.listItem}>2. Navigate to the "Upload Photo" tab</Text>
        <Text style={styles.listItem}>3. Tap to select a photo from your device</Text>
        <Text style={styles.listItem}>4. Select the room type from the dropdown menu</Text>
        <Text style={styles.listItem}>5. Tap "Submit Photo"</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tips for Good Photos</Text>
        <Text style={styles.listItem}>• Ensure good lighting - open curtains or turn on lights</Text>
        <Text style={styles.listItem}>• Take clear, focused shots of the entire room</Text>
        <Text style={styles.listItem}>• Include close-ups of any areas of concern (e.g., cracks, leaks)</Text>
        <Text style={styles.listItem}>• Avoid including personal items or people in the photos</Text>
      </View>
      
      <Text style={styles.footer}>
        If you need help, contact our support team at support@kleurrijkwonen.nl
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  listItem: {
    fontSize: 16,
    marginBottom: 5,
    paddingLeft: 15,
  },
  footer: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});