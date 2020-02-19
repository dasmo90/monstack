import React, {ReactNode} from 'react';
import {Platform, SafeAreaView, StyleSheet, Text, TextInput, View} from 'react-native';

interface ISearchProps {
  data: string[];
  onSelected: (entry: string) => void;
}

interface ISearchState {
  query: string;
}

export default class Search extends React.Component<
  ISearchProps,
  ISearchState
> {
  constructor(params) {
    super(params);
    this.state = {
      query: '',
    };
  }

  render(): ReactNode {
    const {query} = this.state;
    const data = this._filterData(query);
    return (
      <View>
        <TextInput
          style={styles.input}
          onChangeText={text => this.setState({query: text})}
          onSubmitEditing={() => {
            this.props.onSelected(query.trim());
            this.setState({query: ''});
          }}
          value={query}
        />
        <View>
          <View style={styles.list}>
            {data.map((entry, index) => (
              <Text
                key={index}
                style={styles.item}
                onPress={() => this.setState({query: entry})}>
                {entry}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  }

  private _filterData(query: string): string[] {
    if (query) {
      return this.props.data.filter(e => e.startsWith(query));
    } else {
      return [];
    }
  }
}

const styles = StyleSheet.create({
  input: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderColor: 'gray',
    borderWidth: 1,
  },
  list: {
    backgroundColor: 'white',
    position: 'absolute',
    width: '90%',
    top: 0,
    ...Platform.select({
      android: {
        elevation: 1,
      },
    }),
  },
  item: {
    backgroundColor: 'green',
    borderColor: 'gray',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
});
