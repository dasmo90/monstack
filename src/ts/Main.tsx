import React, {ReactNode} from 'react';
import {
  LayoutAnimation,
  Platform,
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
    state?: Pick<IMainState, K>,
  ) {
    const {list} = this.state;
    list.unshift({label: item, id: new Date().getTime()});
    this.setState(state || ({} as Pick<IMainState, K>));
  }

  render(): ReactNode {
    const {data} = this.props;
    const {list, dialog, suggestions} = this.state;
    const all = data.concat(suggestions);
    return (
      <View style={styles.fullHeight}>
        <View style={styles.body}>
          <View style={styles.searchContainer}>
            <Search
              data={all}
              onSelected={item => {
                if (all.indexOf(item) >= 0) {
                  this.addElement(item);
                  return Promise.resolve();
                } else {
                  return this.showDialog(
                    `Do you really want to add "${item}" to your stack?`,
                    () => {
                      this.addSuggestion(item).then(suggestionList => {
                        this.addElement(item, {
                          suggestions: suggestionList,
                          dialog: null,
                        });
                      });
                    },
                  );
                }
              }}
            />
          </View>
          <ScrollView
            bounces={false}
            contentInsetAdjustmentBehavior="automatic"
            style={styles.list}>
            {list.length === 0 ? (
              <Text style={styles.empty}>Your stack is empty.</Text>
            ) : (
              list.map((entry, index) => {
                const style =
                  index % 2 === 0 ? styles.itemOdd : styles.itemEven;
                const view = (
                  <View style={[styles.item, style]}>
                    <Text>{entry.label}</Text>
                  </View>
                );
                return (
                  <Swipeable
                    key={entry.id}
                    onSwipedLeft={() => {
                      this.addElement(entry.label);
                    }}
                    onSwipedRight={() => {
                      list.splice(index, 1);
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut,
                      );
                      this.setState({list: list});
                    }}>
                    {index === 0 ? <Fadeable>{view}</Fadeable> : view}
                  </Swipeable>
                );
              })
            )}
          </ScrollView>
        </View>
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
  },
  body: {
    padding: 10,
  },
  list: {
    marginTop: 25,
  },
  empty: {
    color: 'gray',
  },
  line: {
    height: 2,
    backgroundColor: '#efefef',
  },
  item: {
    padding: 12,
  },
  itemEven: {
    backgroundColor: 'white',
  },
  itemOdd: {
    backgroundColor: '#efefef',
  },
  searchContainer: {
    ...Platform.select({
      ios: {
        zIndex: 1,
      },
    }),
  },
});
