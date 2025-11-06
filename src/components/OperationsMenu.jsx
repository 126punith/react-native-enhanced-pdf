/**
 * OperationsMenu - PDF operations (split, merge, extract)
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  NativeModules,
} from 'react-native';
import BottomSheet from './BottomSheet';

const {FileManager} = NativeModules;

const OperationsMenu = ({
  visible,
  onClose,
  pdfPath,
  totalPages,
  onOperation,
}) => {
  const [processing, setProcessing] = useState(false);
  const [operationStatus, setOperationStatus] = useState('');

  const handleOperation = async (operation, params) => {
    try {
      setProcessing(true);
      setOperationStatus(`Processing ${operation}...`);

      const result = await onOperation(operation, params);

      setProcessing(false);
      setOperationStatus('');

      Alert.alert(
        'Operation Complete ✅',
        result.message || `${operation} completed successfully!`,
        [
          {text: 'Done', style: 'cancel', onPress: onClose},
          {
            text: 'Open Folder',
            onPress: async () => {
              try {
                await FileManager.openDownloadsFolder();
              } catch (e) {
                Alert.alert('Info', 'Please check Downloads/PDFDemoApp folder in your file manager');
              }
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      setProcessing(false);
      setOperationStatus('');
      Alert.alert('Operation Failed', error.message);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height={500}>
      <View style={styles.container}>
        <Text style={styles.title}>PDF Operations</Text>

        {processing ? (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.progressText}>{operationStatus}</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.operationCard}
              onPress={() =>
                handleOperation('split', {
                  ranges: [
                    1, Math.floor(totalPages / 2),
                    Math.floor(totalPages / 2) + 1, totalPages,
                  ],
                })
              }>
              <View style={[styles.iconContainer, {backgroundColor: '#DBEAFE'}]}>
                <Text style={styles.operationIcon}>✂️</Text>
              </View>
              <View style={styles.operationContent}>
                <Text style={styles.operationTitle}>Split PDF</Text>
                <Text style={styles.operationDescription}>
                  Split into 2 parts ({Math.floor(totalPages / 2)} pages each)
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.operationCard}
              onPress={() =>
                handleOperation('extract', {
                  pages: [1, Math.floor(totalPages / 2), totalPages].filter(
                    p => p <= totalPages
                  ),
                })
              }>
              <View style={[styles.iconContainer, {backgroundColor: '#D1FAE5'}]}>
                <Text style={styles.operationIcon}>📄</Text>
              </View>
              <View style={styles.operationContent}>
                <Text style={styles.operationTitle}>Extract Pages</Text>
                <Text style={styles.operationDescription}>
                  Extract pages 1, {Math.floor(totalPages / 2)}, {totalPages}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.operationCard}
              onPress={() =>
                Alert.alert(
                  'Merge PDFs',
                  'This feature requires multiple PDF files.\n\nWould work with file picker in production.',
                  [{text: 'OK'}]
                )
              }>
              <View style={[styles.iconContainer, {backgroundColor: '#FEF3C7'}]}>
                <Text style={styles.operationIcon}>📑</Text>
              </View>
              <View style={styles.operationContent}>
                <Text style={styles.operationTitle}>Merge PDFs</Text>
                <Text style={styles.operationDescription}>
                  Combine multiple PDF files (requires file picker)
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>
                All operations create new files without modifying the original
              </Text>
            </View>
          </>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  operationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  operationIcon: {
    fontSize: 24,
  },
  operationContent: {
    flex: 1,
  },
  operationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  operationDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  arrow: {
    fontSize: 24,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
  },
});

export default OperationsMenu;
