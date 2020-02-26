import React, {ReactNode} from 'react';
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Search from './components/Search';
import Swipeable from './components/Swipeable';
import {Fadeable} from './components/Fadeable';
import {RouteProp} from '@react-navigation/core/src/types';
import {ALL} from './data/Pokemon';
import {hideDialog, showDialog} from './App';
import ILabel from './model/ILabel';

interface IStackProps {
  route: RouteProp<Record<string, ILabel>, 'Stack'>;
}

interface IStackState {
  list: {label: string; id: number}[];
  suggestions: string[];
}

export default class Stack extends React.Component<IStackProps, IStackState> {
  constructor(props: IStackProps) {
    super(props);
    this.state = {
      list: [],
      suggestions: [],
    };
  }

  get stackListKey(): string {
    return `stack_${this.props.route.params.id}`;
  }

  componentDidMount(): void {
    AsyncStorage.getItem('userSuggestions').then(value => {
      this.setState({suggestions: JSON.parse(value || '[]')});
    });
    AsyncStorage.getItem(this.stackListKey).then(value => {
      this.setState({list: JSON.parse(value || '[]')});
    });
  }

  private addSuggestion(item: string): Promise<string[]> {
    const {suggestions} = this.state;
    if (suggestions.map(s => s.toLowerCase()).indexOf(item.toLowerCase()) < 0) {
      let newSuggestions = suggestions.concat(item);
      return AsyncStorage.setItem(
        'userSuggestions',
        JSON.stringify(newSuggestions),
      ).then(() => {
        return newSuggestions;
      });
    } else {
      return Promise.resolve(suggestions);
    }
  }

  private showDialog(text: string, yesAction: () => void): Promise<void> {
    return new Promise((resolve: () => void, reject: () => void) => {
      showDialog({
        content: text,
        options: [
          {
            text: 'No',
            action: () => {
              hideDialog();
              reject();
            },
          },
          {
            text: 'Yes',
            action: () => {
              yesAction();
              hideDialog();
              resolve();
            },
          },
        ],
      });
    });
  }

  private addElement<K extends keyof IStackState>(
    item: string,
  ): Promise<{label: string; id: number}[]> {
    const {list} = this.state;
    list.unshift({label: item, id: new Date().getTime()});
    return this.storeList();
  }

  private removeElement<K extends keyof IStackState>(
    index: number,
  ): Promise<{label: string; id: number}[]> {
    const {list} = this.state;
    list.splice(index, 1);
    return this.storeList();
  }

  private clear<K extends keyof IStackState>(): Promise<
    {label: string; id: number}[]
  > {
    const {list} = this.state;
    list.length = 0;
    return this.storeList();
  }

  private storeList() {
    const {list} = this.state;
    return AsyncStorage.setItem(this.stackListKey, JSON.stringify(list)).then(
      () => {
        return list;
      },
    );
  }

  render(): ReactNode {
    const {list, suggestions} = this.state;
    const all = ALL.concat(suggestions);
    return (
      <View style={styles.main}>
        <Search
          style={styles.body}
          inputStyle={styles.input}
          data={all}
          onSelected={item => {
            if (all.indexOf(item) >= 0) {
              return this.addElement(item).then(stackList =>
                this.setState({list: stackList}),
              );
            } else {
              return this.showDialog(
                `Do you really want to add "${item}" to your stack?`,
                () => {
                  this.addSuggestion(item).then(suggestionList => {
                    return this.addElement(item).then(stackList =>
                      this.setState({
                        list: stackList,
                        suggestions: suggestionList,
                      }),
                    );
                  });
                },
              );
            }
          }}>
          <View style={styles.inputSeparator} />
          <ScrollView
            bounces={false}
            contentInsetAdjustmentBehavior="automatic"
            style={styles.list}>
            {list.length === 0 ? (
              <Text style={styles.empty}>Your stack is empty.</Text>
            ) : (
              list.map((entry, index) => {
                const view = (
                  <Swipeable
                    key={entry.id}
                    onSwipedLeft={() => {
                      this.addElement(entry.label).then(stackList =>
                        this.setState({list: stackList}),
                      );
                    }}
                    onSwipedRight={() => {
                      this.removeElement(index).then(stackList => {
                        LayoutAnimation.configureNext(
                          LayoutAnimation.Presets.easeInEaseOut,
                        );
                        this.setState({list: stackList});
                      });
                    }}>
                    <View style={styles.item}>
                      <Text>{entry.label}</Text>
                    </View>
                    <View style={styles.itemSeparator} />
                  </Swipeable>
                );
                return index === 0 ? (
                  <Fadeable key={entry.id}>{view}</Fadeable>
                ) : (
                  view
                );
              })
            )}
          </ScrollView>
          <View style={styles.footer}>
            <Text
              onPress={() => {
                this.showDialog(
                  'Do you really want to clear your stack?',
                  () => {},
                )
                  .then(() => this.clear())
                  .then(() => this.setState({list: []}))
                  .catch(() => {});
              }}>
              Clear stack
            </Text>
          </View>
        </Search>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
  inputSeparator: {
    height: 5,
    backgroundColor: '#efefef',
  },
  list: {
    marginTop: 20,
    flexGrow: 1,
  },
  footer: {
    marginVertical: 15,
    display: 'flex',
    alignItems: 'center',
  },
  empty: {
    paddingHorizontal: 8,
    color: 'gray',
  },
  line: {
    height: 2,
    backgroundColor: '#efefef',
  },
  item: {
    padding: 12,
    backgroundColor: 'white',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#efefef',
  },
});
