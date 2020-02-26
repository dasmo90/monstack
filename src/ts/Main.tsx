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
import IDialog from './model/IDialog';
import Dialog from './components/Dialog';
import Swipeable from './components/Swipeable';
import {Fadeable} from './components/Fadeable';

interface IMainProps {
  data: string[];
}

interface IMainState {
  list: {label: string; id: number}[];
  suggestions: string[];
  dialog: IDialog | null;
  test: number;
}

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

  componentDidMount(): void {
    AsyncStorage.getItem('userSuggestions').then(value => {
      this.setState({suggestions: JSON.parse(value || '[]')});
    });
    AsyncStorage.getItem('list').then(value => {
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
      this.setState({
        dialog: {
          content: text,
          options: [
            {
              text: 'No',
              action: () => {
                this.setState({dialog: null});
                reject();
              },
            },
            {
              text: 'Yes',
              action: () => {
                yesAction();
                resolve();
              },
            },
          ],
        },
      });
    });
  }

  private addElement<K extends keyof IMainState>(
    item: string,
  ): Promise<{label: string; id: number}[]> {
    const {list} = this.state;
    list.unshift({label: item, id: new Date().getTime()});
    return AsyncStorage.setItem('list', JSON.stringify(list)).then(() => {
      return list;
    });
  }

  private removeElement<K extends keyof IMainState>(
    index: number,
  ): Promise<{label: string; id: number}[]> {
    const {list} = this.state;
    list.splice(index, 1);
    return AsyncStorage.setItem('list', JSON.stringify(list)).then(() => {
      return list;
    });
  }

  private clear<K extends keyof IMainState>(): Promise<void> {
    return AsyncStorage.setItem('list', '[]');
  }

  render(): ReactNode {
    const {data} = this.props;
    const {list, dialog, suggestions} = this.state;
    const all = data.concat(suggestions);
    return (
      <View style={styles.fullHeight}>
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
                        dialog: null,
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
                  .then(() => this.setState({list: [], dialog: null}))
                  .catch(() => {});
              }}>
              Clear stack
            </Text>
          </View>
        </Search>
        {dialog ? (
          <Dialog
            dialog={dialog}
            onClose={() => this.setState({dialog: null})}
          />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullHeight: {
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
