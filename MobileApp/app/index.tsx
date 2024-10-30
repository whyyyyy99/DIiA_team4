import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import TenantPlatform from '@/components/TenantPlatform';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <TenantPlatform />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});