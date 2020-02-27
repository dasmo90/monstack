import React, {ReactNode} from 'react';
import {
  Animated,
  GestureResponderEvent,
  LayoutRectangle,
  PanResponder,
  PanResponderInstance,
  StyleSheet,
  View,
} from 'react-native';

interface ISwipeableProps {
  onSwipedRight?: () => void;
  onSwipedLeft?: () => void;
}

interface ISwipeableState {
  direction: 'RIGHT' | 'LEFT' | 'NONE';
  x: Animated.Value;
}

export default class Swipeable extends React.Component<
  ISwipeableProps,
  ISwipeableState
> {
  private layout: LayoutRectangle = {x: 0, y: 0, height: 0, width: 0};
  private startX = 0;
  private panResponder: PanResponderInstance;

  constructor(props: ISwipeableProps) {
    super(props);
    this.state = {
      direction: 'NONE',
      x: new Animated.Value(0),
    };
    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (event, gesture) => {
        if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
          this.startX = event.nativeEvent.locationX;
          this.setState({
            x: new Animated.Value(0),
          });
          return true;
        }
        return false;
      },
      onPanResponderMove: this.touchMove,
      onPanResponderEnd: this.touchEnd,
      onPanResponderTerminate: this.touchEnd,
    });
  }

  private touchMove: (event: GestureResponderEvent) => void = event => {
    let distance = event.nativeEvent.locationX - this.startX;
    const direction =
      distance > 0 && this.props.onSwipedRight
        ? 'RIGHT'
        : distance < 0 && this.props.onSwipedLeft
        ? 'LEFT'
        : 'NONE';
    this.setState({
      direction: direction,
      x: new Animated.Value(distance),
    });
  };

  private touchEnd: (event: GestureResponderEvent) => void = event => {
    const distance = event.nativeEvent.locationX - this.startX;
    if (distance > this.layout.width / 3 && this.props.onSwipedRight) {
      Animated.timing(this.state.x, {
        toValue: this.layout.width,
        duration: 250,
      }).start(() => {
        this.setState(
          {
            x: new Animated.Value(0),
            direction: 'NONE',
          },
          this.props.onSwipedRight,
        );
      });
    } else if (distance < -this.layout.width / 3 && this.props.onSwipedLeft) {
      Animated.timing(this.state.x, {
        toValue: -this.layout.width,
        duration: 250,
      }).start(() => {
        this.setState(
          {
            x: new Animated.Value(0),
            direction: 'NONE',
          },
          this.props.onSwipedLeft,
        );
      });
    } else {
      Animated.timing(this.state.x, {
        toValue: 0,
        duration: 250,
      }).start(() => {
        this.setState({
          direction: 'NONE',
        });
      });
    }
  };

  render(): ReactNode {
    const {children} = this.props;
    const {x, direction} = this.state;
    let backgroundColor =
      direction === 'NONE'
        ? '#EFEFEF'
        : direction === 'RIGHT'
        ? '#98FB98'
        : '#FFC0CB';
    return (
      <View
        onLayout={event => {
          this.layout = event.nativeEvent.layout;
        }}
        style={{
          backgroundColor: backgroundColor,
        }}>
        <Animated.View
          style={{
            left: x,
          }}>
          {children}
        </Animated.View>
        <View style={[styles.touchable, styles.watermark]}>{children}</View>
        <View style={styles.touchable} {...this.panResponder.panHandlers} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  touchable: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0,
  },
  watermark: {
    opacity: 0.5,
  },
});
