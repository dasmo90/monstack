import React from 'react';
import {Animated} from 'react-native';

interface IFadeableState {
  fadeAnim: Animated.Value;
}

export class Fadeable extends React.Component<{}, IFadeableState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(0),
    };
  }
  componentDidMount() {
    Animated.timing(this.state.fadeAnim, {toValue: 1}).start();
  }
  render() {
    return (
      <Animated.View style={{opacity: this.state.fadeAnim}}>
        {this.props.children}
      </Animated.View>
    );
  }
}
