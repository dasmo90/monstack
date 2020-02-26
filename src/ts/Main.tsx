import React, {ReactNode} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {hideDialog, showDialog} from './App';
import Storage from './data/Storage';
import ILabel from './model/ILabel';

interface IMainProps {
  navigation: any;
}

interface IMainState {
  itemSize: number;
  stacks: (ILabel & {count: number})[];
}

export default class Main extends React.Component<IMainProps, IMainState> {
  private storage = new Storage();
  private updateState = (stacks: ILabel[]) => {
    return Promise.all(
      stacks.map(stack => this.storage.fetchStackCount(stack.id)),
    ).then(counts => {
      this.setState({
        stacks: stacks.map((stack, index) => ({
          ...stack,
          count: counts[index],
        })),
      });
    });
  };
  private loadFromStorage = () => {
    this.storage.fetchStacks().then(this.updateState);
  };
  private unsubscribe: any;

  constructor(props: IMainProps) {
    super(props);
    this.state = {
      itemSize: 0,
      stacks: [],
    };
  }

  componentDidMount(): void {
    this.loadFromStorage();
    this.unsubscribe = this.props.navigation.addListener(
      'focus',
      this.loadFromStorage,
    );
  }

  componentWillUnmount(): void {
    this.unsubscribe();
  }

  private showDialog(): void {
    let stackName: string = '';
    showDialog({
      reactContent: (
        <View>
          <Text>Enter your stack name:</Text>
          <TextInput onChangeText={text => (stackName = text)} />
        </View>
      ),
      options: [
        {
          text: 'Cancel',
          action: () => {
            hideDialog();
          },
        },
        {
          text: 'Okay',
          action: () => {
            this.storage
              .addStack(stackName)
              .then(this.updateState)
              .then(() => hideDialog());
          },
        },
      ],
    });
  }

  render(): ReactNode {
    const {navigation} = this.props;
    const {itemSize, stacks} = this.state;
    return (
      <View style={styles.fullHeight}>
        {stacks.map(stack => (
          <View key={stack.id} style={[styles.item, {height: itemSize}]}>
            <TouchableOpacity
              style={[styles.button, styles.stack]}
              onPress={() => navigation.navigate('Stack', stack)}
              onLongPress={() =>
                this.storage.removeStack(stack.id).then(this.updateState)
              }>
              <Text style={styles.stackName}>{stack.label}</Text>
              <Text style={styles.stackCount}>({stack.count})</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View
          style={[styles.item, {height: itemSize}]}
          onLayout={event => {
            if (!this.state.itemSize) {
              this.setState({itemSize: event.nativeEvent.layout.width});
            }
          }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.showDialog()}>
            <View
              style={[
                styles.cross,
                styles.crossVertical,
                {
                  top: ((itemSize - 10) * 3) / 8,
                  left: (itemSize - 10) / 2,
                  height: (itemSize - 10) / 4,
                },
              ]}
            />
            <View
              style={[
                styles.cross,
                styles.crossHorizontal,
                {
                  left: ((itemSize - 10) * 3) / 8,
                  top: (itemSize - 10) / 2,
                  width: (itemSize - 10) / 4,
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullHeight: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  item: {
    width: '50%',
    padding: 5,
  },
  button: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  stack: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackName: {
    color: 'gray',
    fontSize: 24,
  },
  stackCount: {
    color: 'gray',
    fontSize: 16,
  },
  cross: {
    position: 'absolute',
    backgroundColor: 'gray',
  },
  crossHorizontal: {
    height: 1,
  },
  crossVertical: {
    width: 1,
  },
});
