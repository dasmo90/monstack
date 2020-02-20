import React, {ReactNode} from 'react';
import {Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import Search from './components/Search';
import IDialog from './model/IDialog';
import Dialog from './components/Dialog';

interface IMainProps {
  data: string[];
}

interface IMainState {
  list: string[];
  dialog: IDialog | null;
}

export default class Main extends React.Component<IMainProps, IMainState> {
  constructor(props: IMainProps) {
    super(props);
    this.state = {
      list: [],
      dialog: null,
    };
  }

  showDialog(text: string, yesAction: () => void): Promise<void> {
    return new Promise((resolve: () => void, reject: () => void) => {
      this.setState({
        dialog: {
          content: text,
          options: [
            {
              text: 'Yes',
              action: () => {
                yesAction();
                resolve();
              },
            },
            {
              text: 'No',
              action: () => {
                this.setState({dialog: null});
                reject();
              },
            },
          ],
        },
      });
    });
  }

  render(): ReactNode {
    const {data} = this.props;
    const {list, dialog} = this.state;
    return (
      <View style={styles.fullHeight}>
        <View style={styles.body}>
          <View style={styles.searchContainer}>
            <Search
              data={data}
              onSelected={item => {
                if (data.indexOf(item) >= 0) {
                  this.setState({list: list.concat(item)});
                  return Promise.resolve();
                } else {
                  return this.showDialog(
                    `Do you really want to add "${item}" to your stack?`,
                    () => {
                      this.setState({
                        list: list.concat(item),
                        dialog: null,
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
              list
                .map((entry, index) => {
                  let style =
                    index % 2 === 0 ? styles.itemOdd : styles.itemEven;
                  return (
                    <Text key={'list-' + index} style={[styles.item, style]}>
                      {entry}
                    </Text>
                  );
                })
                .concat(<View style={styles.line} />)
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
