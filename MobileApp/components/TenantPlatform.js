import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import LoginTab from './tabs/LoginTab';
import UploadTab from './tabs/UploadTab';
import InstructionsTab from './tabs/InstructionsTab';

export default function TenantPlatform() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'login', title: 'Login' },
    { key: 'upload', title: 'Upload Photo' },
    { key: 'instructions', title: 'Instructions' },
  ]);

  const renderScene = SceneMap({
    login: LoginTab,
    upload: UploadTab,
    instructions: InstructionsTab,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#007bff' }}
      style={{ backgroundColor: '#f0f0f0' }}
      labelStyle={{ color: '#007bff', fontWeight: 'bold' }}
    />
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
        style={styles.tabView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: '100%',
    height: 100,
    marginVertical: 20,
  },
  tabView: {
    flex: 1,
  },
});