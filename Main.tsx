import React, {ReactNode} from 'react';
import {Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import Search from './Search';

interface IMainProps {
  data: string[];
}

interface IMainState {
  list: string[];
}

export default class Main extends React.Component<IMainProps, IMainState> {
  constructor(params) {
    super(params);
    this.state = {
      list: [],
    };
  }

  render(): ReactNode {
    const {list} = this.state;
    return (
      <View>
        <View style={styles.body}>
          <View style={styles.searchContainer}>
            <Search
              data={this.props.data}
              onSelected={item => this.setState({list: list.concat(item)})}
            />
          </View>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.list}>
            {list.map((entry, index) => {
              let style = index % 2 === 0 ? styles.itemOdd : styles.itemEven;
              return (
                <Text key={index} style={[styles.item, style]}>
                  {entry}
                </Text>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    padding: 10,
  },
  list: {
    marginTop: 25,
  },
  item: {
    padding: 10,
  },
  itemEven: {
    backgroundColor: 'white',
  },
  itemOdd: {
    backgroundColor: 'lightgray',
  },
  searchContainer: {
    ...Platform.select({
      ios: {
        zIndex: 1,
      },
    }),
  },
});
