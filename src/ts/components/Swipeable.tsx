import React, {ReactNode} from 'react';
import {Animated, StyleProp, View, ViewStyle} from 'react-native';

interface ISwipeableProps {
  style?: StyleProp<ViewStyle>;
}

interface ISwipeableState {
  moving: boolean;
  startX: number;
  x: Animated.Value;
}

export default class Swipeable extends React.Component<
  ISwipeableProps,
  ISwipeableState
> {
  constructor(props: ISwipeableProps) {
    super(props);
    this.state = {
      moving: false,
      startX: 0,
      x: new Animated.Value(0),
    };
  }

  render(): ReactNode {
    const {style, children} = this.props;
    const {x} = this.state;
    return (
      <View style={style}>
        <Animated.View
          style={{
            left: x,
          }}>
          {children}
        </Animated.View>
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            flex: 1,
          }}
          onTouchStart={event => {
            this.setState({
              moving: true,
              startX: event.nativeEvent.locationX,
              x: new Animated.Value(0),
            });
          }}
          onTouchMove={event => {
            this.setState({
              x: new Animated.Value(
                event.nativeEvent.locationX - this.state.startX,
              ),
            });
          }}
          onTouchEnd={() => {
            this.setState({moving: false});
            Animated.timing(this.state.x, { toValue: 0, duration: 100 }).start();
          }}
        />
      </View>
    );
  }
}
