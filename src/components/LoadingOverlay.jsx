/**
 * LoadingOverlay Component - Full-screen loading indicator
 */

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';

const LoadingOverlay = ({
  visible,
  message = 'Loading...',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 150,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
});

export default LoadingOverlay;
