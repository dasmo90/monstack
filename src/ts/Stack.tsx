import React, {ReactNode} from 'react';
import {
  FlatList,
  LayoutAnimation,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  list: ILabel[];
  suggestions: string[];
  loading: boolean;
  increased: boolean;
}

export default class Stack extends React.Component<IStackProps, IStackState> {
  private listRenderItem: ListRenderItem<ILabel> = ({item, index}) => {
    const {list, increased} = this.state;
    const view = (
      <Swipeable
        onSwipedRight={() => {
          this.addElement(item.label).then(stackList =>
            this.setState({list: stackList, increased: true}),
          );
        }}
        onSwipedLeft={
          index === 0 || index === list.length - 1
            ? () => {
                this.removeElement(index).then(stackList => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  );
                  this.setState({list: stackList, increased: false});
                });
              }
            : undefined
        }>
        <View style={styles.item}>
          <Text style={styles.itemNumber}>{list.length - index}.</Text>
          <Text>{item.label}</Text>
        </View>
        <View style={styles.itemSeparator} />
      </Swipeable>
    );
    return index === 0 && increased ? <Fadeable>{view}</Fadeable> : view;
  };
  constructor(props: IStackProps) {
    super(props);
    this.state = {
      list: [],
      suggestions: [],
      loading: true,
      increased: false,
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
      this.setState({list: JSON.parse(value || '[]'), loading: false});
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
  ): Promise<ILabel[]> {
    const {list} = this.state;
    list.unshift({label: item, id: `${new Date().getTime()}`});
    return this.storeList();
  }

  private removeElement<K extends keyof IStackState>(
    index: number,
  ): Promise<ILabel[]> {
    const {list} = this.state;
    list.splice(index, 1);
    return this.storeList();
  }

  private clear<K extends keyof IStackState>(): Promise<ILabel[]> {
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
    const {list, loading, suggestions} = this.state;
    const all = ALL.concat(suggestions);
    return (
      <View style={styles.main}>
        <Search
          style={styles.body}
          inputStyle={styles.input}
          instantPick={true}
          data={all}
          onSelected={item => {
            if (all.indexOf(item) >= 0) {
              return this.addElement(item).then(stackList =>
                this.setState({list: stackList, increased: true}),
              );
            } else {
              return this.showDialog(
                `Do you really want to add "${item}" to your stack?`,
                () => {
                  this.addSuggestion(item).then(suggestionList => {
                    return this.addElement(item).then(stackList =>
                      this.setState({
                        list: stackList,
                        increased: true,
                        suggestions: suggestionList,
                      }),
                    );
                  });
                },
              );
            }
          }}>
          <View style={styles.list}>
            {loading ? (
              <Text style={styles.empty}>Loading ...</Text>
            ) : list.length === 0 ? (
              <Text style={styles.empty}>Your stack is empty.</Text>
            ) : (
              <FlatList
                data={list}
                bounces={false}
                removeClippedSubviews={false}
                initialNumToRender={15}
                keyExtractor={item => item.id}
                renderItem={this.listRenderItem}
              />
            )}
          </View>
          <TouchableOpacity
            style={styles.footer}
            onPress={() => {
              this.showDialog(
                'Do you really want to clear your stack?',
                () => {},
              )
                .then(() => this.clear())
                .then(() => this.setState({list: [], increased: false}))
                .catch(() => {});
            }}>
            <Text>Clear stack</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 5,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  input: {
    marginTop: 5,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    color: 'gray',
  },
  list: {
    marginTop: 5,
    flex: 1,
  },
  footer: {
    marginTop: 5,
    backgroundColor: 'white',
    marginHorizontal: -15,
    flexBasis: 45,
    paddingVertical: 15,
    display: 'flex',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'lightgray',
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
    display: 'flex',
    flexDirection: 'row',
  },
  itemNumber: {
    marginRight: 10,
    width: 25,
    textAlign: 'right',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#efefef',
  },
});
