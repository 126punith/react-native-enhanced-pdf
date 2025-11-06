/**
 * ErrorHandler - Comprehensive error handling utilities
 */

import {Alert} from 'react-native';

export class PDFError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'PDFError';
  }
}

export const ErrorCodes = {
  // License errors
  LICENSE_INVALID: 'LICENSE_INVALID',
  LICENSE_EXPIRED: 'LICENSE_EXPIRED',
  LICENSE_REQUIRED: 'LICENSE_REQUIRED',

  // PDF loading errors
  PDF_NOT_FOUND: 'PDF_NOT_FOUND',
  PDF_CORRUPTED: 'PDF_CORRUPTED',
  PDF_PASSWORD_REQUIRED: 'PDF_PASSWORD_REQUIRED',
  PDF_LOAD_TIMEOUT: 'PDF_LOAD_TIMEOUT',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',

  // Storage errors
  STORAGE_FULL: 'STORAGE_FULL',
  STORAGE_PERMISSION: 'STORAGE_PERMISSION',

  // Feature errors
  EXPORT_FAILED: 'EXPORT_FAILED',
  OPERATION_FAILED: 'OPERATION_FAILED',
  BOOKMARK_FAILED: 'BOOKMARK_FAILED',

  // JSI errors
  JSI_NOT_AVAILABLE: 'JSI_NOT_AVAILABLE',
  NATIVE_MODULE_MISSING: 'NATIVE_MODULE_MISSING',

  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export const getUserFriendlyMessage = (error) => {
  if (error instanceof PDFError) {
    switch (error.code) {
      case ErrorCodes.LICENSE_INVALID:
        return 'Your license key is invalid. Please check and try again.';
      case ErrorCodes.LICENSE_EXPIRED:
        return 'Your license has expired. Please renew to continue using Pro features.';
      case ErrorCodes.LICENSE_REQUIRED:
        return 'This feature requires a Pro license. Upgrade to unlock!';
      case ErrorCodes.PDF_NOT_FOUND:
        return 'PDF file not found. Please check the file path.';
      case ErrorCodes.PDF_CORRUPTED:
        return 'This PDF file appears to be corrupted or invalid.';
      case ErrorCodes.PDF_PASSWORD_REQUIRED:
        return 'This PDF is password protected. Password support coming soon.';
      case ErrorCodes.NETWORK_ERROR:
        return 'Network error. Please check your internet connection.';
      case ErrorCodes.NETWORK_TIMEOUT:
        return 'Request timed out. Please try again.';
      case ErrorCodes.STORAGE_FULL:
        return 'Not enough storage space. Please free up some space and try again.';
      case ErrorCodes.STORAGE_PERMISSION:
        return 'Storage permission denied. Please grant permission in settings.';
      case ErrorCodes.EXPORT_FAILED:
        return 'Failed to export PDF. Please try again.';
      case ErrorCodes.JSI_NOT_AVAILABLE:
        return 'High-performance mode not available. Using standard mode.';
      default:
        return error.message;
    }
  }

  // Handle standard errors
  if (error.message) {
    // Password errors
    if (error.message.includes('Password') || error.message.includes('password')) {
      return 'This PDF requires a password. Password support coming soon.';
    }
    // Network errors
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    // File errors
    if (error.message.includes('not found') || error.message.includes('ENOENT')) {
      return 'File not found. Please try again.';
    }
    // Permission errors
    if (error.message.includes('permission') || error.message.includes('denied')) {
      return 'Permission denied. Please grant necessary permissions.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const handleError = (
  error,
  context,
  showAlert = true,
  onRetry
) => {
  const message = getUserFriendlyMessage(error);
  console.error(`❌ Error in ${context}:`, error);

  if (showAlert) {
    const buttons = onRetry
      ? [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Retry', onPress: onRetry},
        ]
      : [{text: 'OK'}];

    Alert.alert(`Error: ${context}`, message, buttons);
  }
};

export const withErrorHandling = async (
  fn,
  context,
  onError
) => {
  try {
    return await fn();
  } catch (error) {
    console.error(`❌ Error in ${context}:`, error);
    if (onError) {
      onError(error);
    } else {
      handleError(error, context);
    }
    return null;
  }
};

export const validatePDFPath = (path) => {
  if (!path || path.trim() === '') {
    throw new PDFError('PDF path is empty', ErrorCodes.PDF_NOT_FOUND);
  }
};

export const validatePageNumber = (page, totalPages) => {
  if (page < 1 || page > totalPages) {
    throw new PDFError(
      `Page number ${page} is out of range (1-${totalPages})`,
      ErrorCodes.UNKNOWN_ERROR
    );
  }
};

export const validateLicense = (licenseManager, featureName) => {
  if (!licenseManager.isProActive()) {
    throw new PDFError(
      `${featureName} requires a Pro license`,
      ErrorCodes.LICENSE_REQUIRED,
      {feature: featureName}
    );
  }
};

export default {
  PDFError,
  ErrorCodes,
  getUserFriendlyMessage,
  handleError,
  withErrorHandling,
  validatePDFPath,
  validatePageNumber,
  validateLicense,
};
