/**
 * SidePanel Component - Slide-in panel from side
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Modal,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const SidePanel = ({
  visible,
  onClose,
  children,
  side = 'right',
  width = SCREEN_WIDTH * 0.85,
}) => {
  const translateX = useRef(
    new Animated.Value(side === 'right' ? width : -width)
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: side === 'right' ? width : -width,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, side, width]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.container,
            {
              width,
              [side]: 0,
              transform: [{translateX}],
            },
          ]}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: -2, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default SidePanel;
