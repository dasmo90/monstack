import React, {ReactNode} from 'react';
import {Button, StyleSheet, View} from 'react-native';

interface IMainProps {
  navigation: any;
}

interface IMainState {}

export default class Main extends React.Component<IMainProps, IMainState> {
  constructor(props: IMainProps) {
    super(props);
    this.state = {
      list: [],
      suggestions: [],
      dialog: null,
      test: 0,
    };
  }

  render(): ReactNode {
    const {navigation} = this.props;
    return (
      <View>
        <Button
          onPress={() => navigation.navigate('Stack', {id: 'test'})}
          title={'Test'}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullHeight: {
    height: '100%',
  },
});
