/**
 * Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
 * All rights reserved.
 * 
 * Main entry point for Enhanced PDF JSI functionality
 * Provides both traditional PDF viewing and high-performance JSI operations
 */

// Export the main PDF component (existing functionality)
export { default as Pdf } from '../PdfView';

// Export JSI functionality
export { default as PDFJSI } from './PDFJSI';
export { default as EnhancedPdfView } from './EnhancedPdfView';
export { default as PDFJSIComponent } from './EnhancedPdfView';
export { default as usePDFJSI } from './hooks/usePDFJSI';

// Export individual JSI methods for convenience
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

// Export JSI availability checker
export { default as checkJSIAvailability } from './PDFJSI';
