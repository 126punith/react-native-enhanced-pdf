/**
 * Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
 * Enhanced PDF JSI Integration - Main Export
 * All rights reserved.
 * 
 * Main export file for enhanced PDF JSI components and utilities
 */

// Core JSI functionality
export { default as PDFJSI } from './PDFJSI';

// Enhanced PDF View component
export { default as EnhancedPdfView, EnhancedPdfUtils } from './EnhancedPdfView';

// React hooks
export { default as usePDFJSI } from './hooks/usePDFJSI';

// Re-export individual JSI methods for convenience
export {
    renderPageDirect,
    getPageMetrics,
    preloadPagesDirect,
    getCacheMetrics,
    clearCacheDirect,
    optimizeMemory,
    searchTextDirect,
    getPerformanceMetrics,
    setRenderQuality,
    getJSIStats,
    getPerformanceHistory,
    clearPerformanceHistory
} from './PDFJSI';