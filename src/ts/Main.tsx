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

  private showAddDialog(): void {
    let stackName: string = '';
    showDialog({
      reactContent: (
        <View>
          <Text>Enter your stack name:</Text>
          <TextInput
            style={styles.addInput}
            onChangeText={text => (stackName = text)}
          />
          <View style={styles.addBottomBorder} />
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

  private showRemoveDialog(label: ILabel): void {
    showDialog({
      content: `Do you really want to delete your ${label.label}'s stack?`,
      options: [
        {
          text: 'No',
          action: () => {
            hideDialog();
          },
        },
        {
          text: 'Yes',
          action: () => {
            this.storage
              .removeStack(label.id)
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
        {stacks.map(stack => {
          const percentage = stack.count / 100;
          const colorDesc = 255 * (1 - Math.pow(percentage, 7));
          const colorAsc = percentage > 0.8 ? 255 : 128;
          return (
            <View key={stack.id} style={[styles.item, {height: itemSize}]}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.stack,
                  {
                    backgroundColor: `rgb(255, ${colorDesc}, ${colorDesc})`,
                  },
                ]}
                onPress={() => navigation.navigate('Stack', stack)}
                onLongPress={() => this.showRemoveDialog(stack)}>
                <Text
                  style={[
                    styles.stackName,
                    {color: `rgb(${colorAsc}, ${colorAsc}, ${colorAsc})`},
                  ]}>
                  {stack.label}
                </Text>
                <Text
                  style={[
                    styles.stackCount,
                    {color: `rgb(${colorAsc}, ${colorAsc}, ${colorAsc})`},
                  ]}>
                  ({stack.count})
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <View
          style={[styles.item, {height: itemSize}]}
          onLayout={event => {
            if (!this.state.itemSize) {
              this.setState({itemSize: event.nativeEvent.layout.width});
            }
          }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.showAddDialog()}>
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
  addInput: {
    marginTop: 5,
    paddingVertical: 3,
  },
  addBottomBorder: {
    height: 1,
    backgroundColor: 'black',
  },
  stack: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackName: {
    fontSize: 24,
  },
  stackCount: {
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
