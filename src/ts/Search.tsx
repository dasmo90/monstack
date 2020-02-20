import React, {ReactNode} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native';

interface ISearchProps {
  data: string[];
  onSelected: (entry: string) => Promise<void>;
}

interface ISearchState {
  query: string;
  closed: boolean;
}

export default class Search extends React.Component<
  ISearchProps,
  ISearchState
> {
  constructor(props: ISearchProps) {
    super(props);
    this.state = {
      query: '',
      closed: true,
    };
  }

  render(): ReactNode {
    const {query, closed} = this.state;
    const data = this._filterData(query);
    return (
      <View>
        <TextInput
          style={styles.input}
          onChangeText={text => this.setState({query: text, closed: false})}
          onSubmitEditing={() => {
            this.props
              .onSelected(query.trim())
              .then(() => {
                this.setState({query: '', closed: true});
              })
              .catch(() => {});
          }}
          value={query}
        />
        {closed ? null : (
          <View>
            <View style={styles.list}>
              {data.map((entry, index) => (
                <TouchableHighlight
                  key={'autocomplete-' + index}
                  onPress={() => this.setState({query: entry, closed: true})}>
                  <Text style={styles.item}>{entry}</Text>
                </TouchableHighlight>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }

  private _filterData(query: string): string[] {
    if (query) {
      return this.props.data
        .filter(e => e.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 5);
    } else {
      return [];
    }
  }
}

const styles = StyleSheet.create({
  input: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderColor: 'gray',
    borderWidth: 1,
  },
  list: {
    backgroundColor: 'white',
    position: 'absolute',
    width: '100%',
    top: 0,
    ...Platform.select({
      android: {
        elevation: 1,
      },
    }),
  },
  item: {
    backgroundColor: '#efefef',
    borderColor: 'gray',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});
