import React, {ReactNode} from 'react';
import {Animated, View} from 'react-native';

interface IHideableProps {
  hidden: boolean;
  onStateChange?: (hidden: boolean) => void;
}

interface IHideableState {
  animatedHeight: Animated.Value | null;
}

export default class Hideable extends React.Component<
  IHideableProps,
  IHideableState
> {
  private contentHeight: number = 0;

  constructor(props: IHideableProps) {
    super(props);
    this.state = {
      animatedHeight: null,
    };
  }

  componentDidUpdate(prevProps: Readonly<IHideableProps>): void {
    let justShow = prevProps.hidden && !this.props.hidden;
    let justHide = !prevProps.hidden && this.props.hidden;
    if (!justHide && !justShow) {
      return;
    }
    this.show(justShow);
  }

  private show(isVisible: boolean) {
    if (this.state.animatedHeight !== null) {
      let targetValue = isVisible ? this.contentHeight : 0;
      Animated.timing(this.state.animatedHeight, {
        toValue: targetValue,
        duration: 200,
      }).start(() => {
        if (this.props.onStateChange) {
          this.props.onStateChange(isVisible);
        }
      });
    }
  }

  render(): ReactNode {
    const {children} = this.props;
    let style = this.state.animatedHeight
      ? {height: this.state.animatedHeight}
      : {};
    console.log(this.state.animatedHeight);
    return (
      <Animated.View style={style}>
        <View
          onLayout={event => {
            if (!this.contentHeight) {
              this.contentHeight = event.nativeEvent.layout.height;
              this.setState({
                animatedHeight: new Animated.Value(this.contentHeight),
              });
            }
          }}>
          {children}
        </View>
      </Animated.View>
    );
  }
}
