/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import 'react-native-gesture-handler';
import React from 'react';
import {StyleSheet} from 'react-native';
import Stack from './Stack';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Main from './Main';

const NavigatorStack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <NavigatorStack.Navigator>
        <NavigatorStack.Screen name="Home" options={{title: 'Home'}}>
          {props => <Main {...props} />}
        </NavigatorStack.Screen>
        <NavigatorStack.Screen
          name="Stack"
          component={Stack}
          options={{title: 'Stack'}}
        />
      </NavigatorStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  fullHeight: {
    height: '100%',
  },
});

export default App;
