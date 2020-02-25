import React, {ReactNode} from 'react';
import {Animated, LayoutRectangle, StyleSheet, View} from 'react-native';

interface ISwipeableProps {
  onSwipedRight: () => void;
  onSwipedLeft: () => void;
}

interface ISwipeableState {
  direction: 'RIGHT' | 'LEFT';
  x: Animated.Value;
}

export default class Swipeable extends React.Component<
  ISwipeableProps,
  ISwipeableState
> {
  private layout: LayoutRectangle = {x: 0, y: 0, height: 0, width: 0};
  private startX = 0;

  constructor(props: ISwipeableProps) {
    super(props);
    this.state = {
      direction: 'LEFT',
      x: new Animated.Value(0),
    };
  }

  render(): ReactNode {
    const {children} = this.props;
    const {x, direction} = this.state;
    let backgroundColor = direction === 'RIGHT' ? '#FFC0CB' : '#98FB98';
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
        <View
          style={styles.touchable}
          onTouchStart={event => {
            this.startX = event.nativeEvent.locationX;
            this.setState({
              x: new Animated.Value(0),
            });
          }}
          onTouchMove={event => {
            let distance = event.nativeEvent.locationX - this.startX;
            this.setState({
              direction: distance > 0 ? 'RIGHT' : 'LEFT',
              x: new Animated.Value(distance),
            });
          }}
          onTouchEnd={event => {
            const distance = event.nativeEvent.locationX - this.startX;
            if (distance > this.layout.width / 4) {
              Animated.timing(this.state.x, {
                toValue: this.layout.width,
                duration: 250,
              }).start(() => {
                this.setState(
                  {
                    x: new Animated.Value(0),
                  },
                  this.props.onSwipedRight,
                );
              });
            } else if (distance < -this.layout.width / 4) {
              Animated.timing(this.state.x, {
                toValue: -this.layout.width,
                duration: 250,
              }).start(() => {
                this.setState(
                  {
                    x: new Animated.Value(0),
                  },
                  this.props.onSwipedLeft,
                );
              });
            } else {
              Animated.timing(this.state.x, {
                toValue: 0,
                duration: 100,
              }).start();
            }
          }}
        />
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
  },
  watermark: {
    opacity: 0.5,
  },
});
