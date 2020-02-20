/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {Platform, SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import Main from './Main';

const pokemons = [
    'Bisasam',
  'Bisaknosp',
  'Bisaflor',
  'Glumanda',
  'Glutexo'];

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.fullHeight}>
        <Main data={pokemons} />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  fullHeight: {
    height: '100%',
  },
});

export default App;
