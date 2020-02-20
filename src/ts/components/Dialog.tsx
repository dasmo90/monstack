import React, {ReactNode} from 'react';
import {StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import IDialog from '../model/IDialog';
import select from '../utils/Selector';

interface IDialogProps {
  dialog: IDialog;
  onClose: () => void;
}

export default class Dialog extends React.Component<IDialogProps, {}> {
  constructor(props: IDialogProps) {
    super(props);
    this.state = {
      query: '',
      closed: true,
    };
  }

  render(): ReactNode {
    const {dialog} = this.props;
    return (
      <View style={styles.dialogContainer}>
        <View style={styles.dialog}>
          <View style={styles.dialogHeader}>
            <TouchableHighlight onPress={this.props.onClose}>
              <Text style={styles.dialogCross}>X</Text>
            </TouchableHighlight>
          </View>
          <View style={styles.dialogContent}>
            <Text>{dialog.content}</Text>
          </View>
          <View style={styles.dialogBottomSpace} />
          <View style={styles.dialogBottom}>
            {dialog.options.map((option, index) =>
              select([
                {
                  condition: () => index !== 0,
                  data: (
                    <View
                      key={'dialogOptionSpace-' + index}
                      style={styles.dialogBottomTextSpace}
                    />
                  ),
                },
                {
                  condition: () => true,
                  data: (
                    <TouchableHighlight
                      key={'dialogOption-' + index}
                      style={styles.dialogBottomTouchable}
                      onPress={option.action}>
                      <Text style={styles.dialogBottomText}>{option.text}</Text>
                    </TouchableHighlight>
                  ),
                },
              ]),
            )}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dialogContainer: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.5)',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  dialog: {
    zIndex: 100,
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 5,
    overflow: 'hidden',
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  dialogContent: {
    paddingHorizontal: 25,
    paddingBottom: 25,
  },
  dialogCross: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    color: 'lightgray',
    backgroundColor: 'white',
    transform: [{scaleX: 1.3}],
  },
  dialogBottom: {
    display: 'flex',
    flexDirection: 'row',
  },
  dialogBottomSpace: {
    height: 1,
    backgroundColor: 'lightgray',
  },
  dialogBottomTouchable: {
    flex: 1,
  },
  dialogBottomText: {
    padding: 20,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  dialogBottomTextSpace: {
    flex: 0,
    width: 1,
    backgroundColor: 'lightgray',
  },
});
