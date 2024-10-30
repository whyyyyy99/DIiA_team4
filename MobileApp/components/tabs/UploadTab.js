import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

export default function UploadTab() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [roomType, setRoomType] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (selectedImage && roomType) {
      Alert.alert('Photo Submitted', 'Thank you for contributing to our maintenance efforts.');
      setSelectedImage(null);
      setRoomType('');
    } else {
      Alert.alert('Submission Incomplete', 'Please select a photo and room type before submitting.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload Interior Photo</Text>
      <Text style={styles.subtitle}>Help us maintain your building and earn rewards!</Text>
      <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <Text style={styles.uploadText}>Tap to select a photo</Text>
        )}
      </TouchableOpacity>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={roomType}
          style={styles.picker}
          onValueChange={(itemValue) => setRoomType(itemValue)}
        >
          <Picker.Item label="Select room type" value="" />
          <Picker.Item label="Living Room" value="living-room" />
          <Picker.Item label="Bedroom" value="bedroom" />
          <Picker.Item label="Kitchen" value="kitchen" />
          <Picker.Item label="Bathroom" value="bathroom" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Photo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  uploadArea: {
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  uploadText: {
    fontSize: 16,
    color: '#666',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});