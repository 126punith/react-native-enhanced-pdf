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

// ============================================
// ENHANCED FEATURES (Free & Pro)
// ============================================

// Advanced Search (FREE)
export { default as searchEngine, SearchEngine } from './search/SearchEngine';
export { useSearch } from './search/hooks/useSearch';
export { SearchBar } from './search/components/SearchBar';

// Smart Bookmarks (FREE for basic, PRO for colors/analytics)
export { default as bookmarkManager, BookmarkManager } from './bookmarks/BookmarkManager';
export { useBookmarks } from './bookmarks/hooks/useBookmarks';
export { BookmarksList } from './bookmarks/components/BookmarksList';

// Export & Conversion (FREE for text, PRO for images/operations)
export { default as exportManager, ExportManager } from './export/ExportManager';
export { useExport } from './export/hooks/useExport';
export { ExportMenu } from './export/components/ExportMenu';

// Reading Analytics (PRO feature)
export { default as analyticsManager, AnalyticsManager } from './analytics/AnalyticsManager';
export { useAnalytics } from './analytics/hooks/useAnalytics';
export { AnalyticsDashboard } from './analytics/components/AnalyticsDashboard';

// License Management
export { default as licenseManager, LicenseManager } from './license/LicenseManager';
export { activateLicense, isProActive, getLicenseInfo } from './license';
export { LicensePrompt, ProBadge, FeatureGate } from './license/components/LicensePrompt';