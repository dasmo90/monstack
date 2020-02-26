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
import Stack from './Stack';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Main from './Main';
import Dialog from './components/Dialog';
import IDialog from './model/IDialog';
import ILabel from "./model/ILabel";

const NavigatorStack = createStackNavigator();

interface IAppState {
  dialog: IDialog | null;
}

let app: App;

export default class App extends React.Component<{}, IAppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      dialog: null,
    };
    // eslint-disable-next-line consistent-this
    app = this;
  }
  render() {
    const {dialog} = this.state;
    return (
      <NavigationContainer>
        <NavigatorStack.Navigator>
          <NavigatorStack.Screen name="Home" options={{title: 'Accounts'}}>
            {props => <Main {...props} />}
          </NavigatorStack.Screen>
          <NavigatorStack.Screen
            name="Stack"
            component={Stack}
            options={props => {
              const params = props.route.params as ILabel;
              return {title: params.label};
            }}
          />
        </NavigatorStack.Navigator>
        {dialog ? (
          <Dialog
            dialog={dialog}
            onClose={() => this.setState({dialog: null})}
          />
        ) : null}
      </NavigationContainer>
    );
  }
}

export function showDialog(dialog: IDialog) {
  if (app) {
    app.setState({dialog: dialog});
  }
}

export function hideDialog() {
  if (app) {
    app.setState({dialog: null});
  }
}
