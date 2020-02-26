import React, {ReactNode} from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  ViewStyle,
} from 'react-native';

interface ISearchProps {
  data: string[];
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
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
  private input: TextInput | null = null;

  constructor(props: ISearchProps) {
    super(props);
    this.state = {
      query: '',
      closed: true,
    };
  }

  render(): ReactNode {
    const {children, style, inputStyle} = this.props;
    const {query, closed} = this.state;
    const data = this.filterData(query);
    return (
      <>
        <TextInput
          ref={input => {
            this.input = input;
          }}
          style={inputStyle || styles.input}
          onChangeText={text => this.setState({query: text, closed: false})}
          onSubmitEditing={() => {
            const item = query.trim();
            if (item) {
              this.props
                .onSelected(item)
                .then(() => {
                  this.setState({query: '', closed: true});
                })
                .catch(() => {
                  this.input?.focus();
                });
            }
          }}
          value={query}
        />
        <View style={style}>
          {children}
          {closed ? null : (
            <View style={styles.list}>
              {data.map((entry, index) => (
                <TouchableHighlight
                  key={'autocomplete-' + index}
                  onPress={() => this.setState({query: entry, closed: true})}>
                  <Text style={styles.item}>{entry}</Text>
                </TouchableHighlight>
              ))}
            </View>
          )}
        </View>
      </>
    );
  }

  private filterData(query: string): string[] {
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
    borderColor: 'lightgray',
    borderWidth: 1,
  },
  list: {
    backgroundColor: 'white',
    position: 'absolute',
    width: '100%',
    top: 0,
  },
  item: {
    backgroundColor: '#efefef',
    borderColor: 'lightgray',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});
