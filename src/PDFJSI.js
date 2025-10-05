/**
 * Copyright (c) 2025-present, Enhanced PDF JSI JavaScript Bridge
 * All rights reserved.
 * 
 * JavaScript interface for high-performance PDF operations via JSI
 * Provides direct access to native PDF functions without bridge overhead
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { PDFJSIManager: PDFJSIManagerNative, EnhancedPdfJSIBridge, RNPDFPdfViewManager } = NativeModules;

/**
 * Enhanced PDF JSI Manager
 * Provides high-performance PDF operations via JSI
 */
class PDFJSIManager {
    constructor() {
        this.isJSIAvailable = false;
        this.performanceMetrics = new Map();
        this.cacheMetrics = new Map();
        this.initializationPromise = null;
        
        this.initializeJSI();
    }
    
    /**
     * Initialize JSI availability check
     */
    async initializeJSI() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        this.initializationPromise = this.checkJSIAvailability();
        return this.initializationPromise;
    }
    
    /**
     * Check if JSI is available
     */
    async checkJSIAvailability() {
        try {
            let isAvailable = false;
            
            if (Platform.OS === 'android') {
                isAvailable = await PDFJSIManagerNative.isJSIAvailable();
            } else if (Platform.OS === 'ios') {
                // For iOS, we use the native module methods directly
                isAvailable = await RNPDFPdfViewManager.checkJSIAvailability();
            } else {
                console.log('📱 PDFJSI: Platform not supported:', Platform.OS);
                return false;
            }
            
            this.isJSIAvailable = isAvailable;
            
            console.log(`📱 PDFJSI: JSI availability on ${Platform.OS}: ${isAvailable ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
            return isAvailable;
            
        } catch (error) {
            console.error('📱 PDFJSI: Error checking JSI availability:', error);
            this.isJSIAvailable = false;
            return false;
        }
    }
    
    /**
     * Render page directly via JSI (high-performance)
     * @param {string} pdfId - PDF identifier
     * @param {number} pageNumber - Page number to render
     * @param {number} scale - Render scale factor
     * @param {string} base64Data - Base64 encoded PDF data
     * @returns {Promise<Object>} Render result
     */
    async renderPageDirect(pdfId, pageNumber, scale, base64Data) {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        const startTime = performance.now();
        
        try {
            console.log(`📱 PDFJSI: Rendering page ${pageNumber} at scale ${scale} for PDF ${pdfId}`);
            
            let result;
            if (Platform.OS === 'android') {
                result = await PDFJSIManagerNative.renderPageDirect(pdfId, pageNumber, scale, base64Data);
            } else if (Platform.OS === 'ios') {
                result = await RNPDFPdfViewManager.renderPageDirect(pdfId, pageNumber, scale, base64Data);
            } else {
                throw new Error(`Platform ${Platform.OS} not supported`);
            }
            
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            // Track performance
            this.trackPerformance('renderPageDirect', renderTime, {
                pdfId,
                pageNumber,
                scale,
                success: result.success
            });
            
            console.log(`📱 PDFJSI: Page rendered in ${renderTime.toFixed(2)}ms`);
            
            return result;
            
        } catch (error) {
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            console.error(`📱 PDFJSI: Error rendering page in ${renderTime.toFixed(2)}ms:`, error);
            
            this.trackPerformance('renderPageDirect', renderTime, {
                pdfId,
                pageNumber,
                scale,
                success: false,
                error: error.message
            });
            
            throw error;
        }
    }
    
    /**
     * Get page metrics via JSI
     * @param {string} pdfId - PDF identifier
     * @param {number} pageNumber - Page number
     * @returns {Promise<Object>} Page metrics
     */
    async getPageMetrics(pdfId, pageNumber) {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        try {
            console.log(`📱 PDFJSI: Getting metrics for page ${pageNumber} of PDF ${pdfId}`);
            
            let metrics;
            if (Platform.OS === 'android') {
                metrics = await PDFJSIManagerNative.getPageMetrics(pdfId, pageNumber);
            } else if (Platform.OS === 'ios') {
                metrics = await RNPDFPdfViewManager.getPageMetrics(pdfId, pageNumber);
            } else {
                throw new Error(`Platform ${Platform.OS} not supported`);
            }
            
            console.log(`📱 PDFJSI: Page metrics retrieved:`, metrics);
            
            return metrics;
            
        } catch (error) {
            console.error(`📱 PDFJSI: Error getting page metrics:`, error);
            throw error;
        }
    }
    
    /**
     * Preload pages directly via JSI
     * @param {string} pdfId - PDF identifier
     * @param {number} startPage - Start page number
     * @param {number} endPage - End page number
     * @returns {Promise<boolean>} Success status
     */
    async preloadPagesDirect(pdfId, startPage, endPage) {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        const startTime = performance.now();
        
        try {
            console.log(`📱 PDFJSI: Preloading pages ${startPage}-${endPage} for PDF ${pdfId}`);
            
            let success;
            if (Platform.OS === 'android') {
                success = await PDFJSIManagerNative.preloadPagesDirect(pdfId, startPage, endPage);
            } else if (Platform.OS === 'ios') {
                success = await RNPDFPdfViewManager.preloadPagesDirect(pdfId, startPage, endPage);
            } else {
                throw new Error(`Platform ${Platform.OS} not supported`);
            }
            
            const endTime = performance.now();
            const preloadTime = endTime - startTime;
            
            console.log(`📱 PDFJSI: Pages preloaded in ${preloadTime.toFixed(2)}ms, Success: ${success}`);
            
            this.trackPerformance('preloadPagesDirect', preloadTime, {
                pdfId,
                startPage,
                endPage,
                success
            });
            
            return success;
            
        } catch (error) {
            const endTime = performance.now();
            const preloadTime = endTime - startTime;
            
            console.error(`📱 PDFJSI: Error preloading pages in ${preloadTime.toFixed(2)}ms:`, error);
            throw error;
        }
    }
    
    /**
     * Get cache metrics via JSI
     * @param {string} pdfId - PDF identifier
     * @returns {Promise<Object>} Cache metrics
     */
    async getCacheMetrics(pdfId) {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        try {
            console.log(`📱 PDFJSI: Getting cache metrics for PDF ${pdfId}`);
            
            let metrics;
            if (Platform.OS === 'android') {
                metrics = await PDFJSIManagerNative.getCacheMetrics(pdfId);
            } else if (Platform.OS === 'ios') {
                metrics = await RNPDFPdfViewManager.getCacheMetrics();
            } else {
                throw new Error(`Platform ${Platform.OS} not supported`);
            }
            
            // Cache the metrics
            this.cacheMetrics.set(pdfId, metrics);
            
            console.log(`📱 PDFJSI: Cache metrics retrieved:`, metrics);
            
            return metrics;
            
        } catch (error) {
            console.error(`📱 PDFJSI: Error getting cache metrics:`, error);
            throw error;
        }
    }
    
    /**
     * Clear cache directly via JSI
     * @param {string} pdfId - PDF identifier
     * @param {string} cacheType - Cache type to clear ('all', 'base64', 'bytes')
     * @returns {Promise<boolean>} Success status
     */
    async clearCacheDirect(pdfId, cacheType = 'all') {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        try {
            console.log(`📱 PDFJSI: Clearing cache type '${cacheType}' for PDF ${pdfId}`);
            
            let success;
            if (Platform.OS === 'android') {
                success = await PDFJSIManagerNative.clearCacheDirect(pdfId, cacheType);
            } else if (Platform.OS === 'ios') {
                success = await RNPDFPdfViewManager.clearCacheDirect(pdfId, cacheType);
            } else {
                throw new Error(`Platform ${Platform.OS} not supported`);
            }
            
            // Clear local cache metrics
            if (success) {
                this.cacheMetrics.delete(pdfId);
            }
            
            console.log(`📱 PDFJSI: Cache cleared, Success: ${success}`);
            
            return success;
            
        } catch (error) {
            console.error(`📱 PDFJSI: Error clearing cache:`, error);
            throw error;
        }
    }
    
    /**
     * Optimize memory via JSI
     * @param {string} pdfId - PDF identifier
     * @returns {Promise<boolean>} Success status
     */
    async optimizeMemory(pdfId) {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        try {
            console.log(`📱 PDFJSI: Optimizing memory for PDF ${pdfId}`);
            
            let success;
            if (Platform.OS === 'android') {
                success = await PDFJSIManagerNative.optimizeMemory(pdfId);
            } else if (Platform.OS === 'ios') {
                success = await RNPDFPdfViewManager.optimizeMemory(pdfId);
            } else {
                throw new Error(`Platform ${Platform.OS} not supported`);
            }
            
            console.log(`📱 PDFJSI: Memory optimization completed, Success: ${success}`);
            
            return success;
            
        } catch (error) {
            console.error(`📱 PDFJSI: Error optimizing memory:`, error);
            throw error;
        }
    }
    
    /**
     * Search text directly via JSI
     * @param {string} pdfId - PDF identifier
     * @param {string} searchTerm - Search term
     * @param {number} startPage - Start page number
     * @param {number} endPage - End page number
     * @returns {Promise<Array>} Search results
     */
    async searchTextDirect(pdfId, searchTerm, startPage, endPage) {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        const startTime = performance.now();
        
        try {
            console.log(`📱 PDFJSI: Searching for '${searchTerm}' in pages ${startPage}-${endPage}`);
            
            let results;
            if (Platform.OS === 'android') {
                results = await PDFJSIManagerNative.searchTextDirect(pdfId, searchTerm, startPage, endPage);
            } else if (Platform.OS === 'ios') {
                results = await RNPDFPdfViewManager.searchTextDirect(pdfId, searchTerm);
            } else {
                throw new Error(`Platform ${Platform.OS} not supported`);
            }
            
            const endTime = performance.now();
            const searchTime = endTime - startTime;
            
            console.log(`📱 PDFJSI: Search completed in ${searchTime.toFixed(2)}ms, Results: ${results.length}`);
            
            this.trackPerformance('searchTextDirect', searchTime, {
                pdfId,
                searchTerm,
                startPage,
                endPage,
                resultCount: results.length
            });
            
            return results;
            
        } catch (error) {
            const endTime = performance.now();
            const searchTime = endTime - startTime;
            
            console.error(`📱 PDFJSI: Error searching text in ${searchTime.toFixed(2)}ms:`, error);
            throw error;
        }
    }
    
    /**
     * Get performance metrics via JSI
     * @param {string} pdfId - PDF identifier
     * @returns {Promise<Object>} Performance metrics
     */
    async getPerformanceMetrics(pdfId) {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        try {
            console.log(`📱 PDFJSI: Getting performance metrics for PDF ${pdfId}`);
            
            let metrics;
            if (Platform.OS === 'android') {
                metrics = await PDFJSIManagerNative.getPerformanceMetrics(pdfId);
            } else if (Platform.OS === 'ios') {
                metrics = await RNPDFPdfViewManager.getPerformanceMetricsDirect(pdfId);
            } else {
                throw new Error(`Platform ${Platform.OS} not supported`);
            }
            
            console.log(`📱 PDFJSI: Performance metrics retrieved:`, metrics);
            
            return metrics;
            
        } catch (error) {
            console.error(`📱 PDFJSI: Error getting performance metrics:`, error);
            throw error;
        }
    }
    
    /**
     * Set render quality via JSI
     * @param {string} pdfId - PDF identifier
     * @param {number} quality - Render quality (1-3)
     * @returns {Promise<boolean>} Success status
     */
    async setRenderQuality(pdfId, quality) {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        if (quality < 1 || quality > 3) {
            throw new Error('Render quality must be between 1 and 3');
        }
        
        try {
            console.log(`📱 PDFJSI: Setting render quality to ${quality} for PDF ${pdfId}`);
            
            let success;
            if (Platform.OS === 'android') {
                success = await PDFJSIManagerNative.setRenderQuality(pdfId, quality);
            } else if (Platform.OS === 'ios') {
                success = await RNPDFPdfViewManager.setRenderQuality(pdfId, quality);
            } else {
                throw new Error(`Platform ${Platform.OS} not supported`);
            }
            
            console.log(`📱 PDFJSI: Render quality set, Success: ${success}`);
            
            return success;
            
        } catch (error) {
            console.error(`📱 PDFJSI: Error setting render quality:`, error);
            throw error;
        }
    }
    
    /**
     * Get JSI performance statistics
     * @returns {Promise<Object>} JSI stats
     */
    async getJSIStats() {
        try {
            console.log(`📱 PDFJSI: Getting JSI stats`);
            
            let stats;
            if (Platform.OS === 'android') {
                stats = await EnhancedPdfJSIBridge.getJSIStats();
            } else if (Platform.OS === 'ios') {
                stats = await RNPDFPdfViewManager.getJSIStats();
            } else {
                throw new Error(`Platform ${Platform.OS} not supported`);
            }
            
            console.log(`📱 PDFJSI: JSI stats retrieved:`, stats);
            
            return stats;
            
        } catch (error) {
            console.error(`📱 PDFJSI: Error getting JSI stats:`, error);
            throw error;
        }
    }
    
    /**
     * Track performance metrics
     * @private
     */
    trackPerformance(operation, duration, metadata = {}) {
        const key = `${operation}_${Date.now()}`;
        this.performanceMetrics.set(key, {
            operation,
            duration,
            timestamp: Date.now(),
            metadata
        });
        
        // Keep only last 100 performance entries
        if (this.performanceMetrics.size > 100) {
            const firstKey = this.performanceMetrics.keys().next().value;
            this.performanceMetrics.delete(firstKey);
        }
    }
    
    /**
     * Get all performance metrics
     * @returns {Array} Performance metrics array
     */
    getPerformanceHistory() {
        return Array.from(this.performanceMetrics.values());
    }
    
    /**
     * Clear performance history
     */
    clearPerformanceHistory() {
        this.performanceMetrics.clear();
        console.log('📱 PDFJSI: Performance history cleared');
    }
    
    /**
     * Lazy load PDF pages for large files
     * @param {string} pdfId - PDF identifier
     * @param {number} currentPage - Current page number
     * @param {number} preloadRadius - Number of pages to preload around current page
     * @param {number} totalPages - Total number of pages in PDF
     * @returns {Promise<Object>} Lazy load result
     */
    async lazyLoadPages(pdfId, currentPage, preloadRadius = 3, totalPages = null) {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        const startTime = performance.now();
        
        try {
            console.log(`📱 PDFJSI: Lazy loading pages around page ${currentPage} for PDF ${pdfId}`);
            
            // Calculate pages to preload
            const startPage = Math.max(1, currentPage - preloadRadius);
            const endPage = totalPages ? Math.min(totalPages, currentPage + preloadRadius) : currentPage + preloadRadius;
            
            // Preload pages in background
            const preloadResult = await this.preloadPagesDirect(pdfId, startPage, endPage);
            
            const endTime = performance.now();
            const lazyLoadTime = endTime - startTime;
            
            // Track performance
            this.trackPerformance('lazyLoadPages', lazyLoadTime, {
                pdfId,
                currentPage,
                startPage,
                endPage,
                preloadRadius,
                success: preloadResult
            });
            
            console.log(`📱 PDFJSI: Lazy loaded pages ${startPage}-${endPage} in ${lazyLoadTime.toFixed(2)}ms`);
            
            return {
                success: preloadResult,
                currentPage,
                preloadedRange: { startPage, endPage },
                lazyLoadTime,
                preloadRadius
            };
            
        } catch (error) {
            const endTime = performance.now();
            const lazyLoadTime = endTime - startTime;
            
            console.error(`📱 PDFJSI: Error lazy loading pages in ${lazyLoadTime.toFixed(2)}ms:`, error);
            
            this.trackPerformance('lazyLoadPages', lazyLoadTime, {
                pdfId,
                currentPage,
                preloadRadius,
                success: false,
                error: error.message
            });
            
            throw error;
        }
    }
    
    /**
     * Progressive loading for large PDF files
     * @param {string} pdfId - PDF identifier
     * @param {number} startPage - Starting page number
     * @param {number} batchSize - Number of pages to load in each batch
     * @param {Function} onProgress - Progress callback function
     * @returns {Promise<Object>} Progressive load result
     */
    async progressiveLoadPages(pdfId, startPage = 1, batchSize = 5, onProgress = null) {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        const startTime = performance.now();
        
        try {
            console.log(`📱 PDFJSI: Progressive loading starting from page ${startPage} for PDF ${pdfId}`);
            
            let currentPage = startPage;
            let totalLoaded = 0;
            const loadResults = [];
            
            // Load pages in batches
            while (true) {
                const batchStartPage = currentPage;
                const batchEndPage = currentPage + batchSize - 1;
                
                console.log(`📱 PDFJSI: Loading batch ${batchStartPage}-${batchEndPage}`);
                
                const batchResult = await this.preloadPagesDirect(pdfId, batchStartPage, batchEndPage);
                
                if (!batchResult) {
                    console.log(`📱 PDFJSI: Batch loading failed at page ${currentPage}`);
                    break;
                }
                
                loadResults.push({
                    startPage: batchStartPage,
                    endPage: batchEndPage,
                    success: batchResult
                });
                
                totalLoaded += batchSize;
                currentPage += batchSize;
                
                // Call progress callback if provided
                if (onProgress && typeof onProgress === 'function') {
                    onProgress({
                        currentPage,
                        totalLoaded,
                        batchStartPage,
                        batchEndPage,
                        success: batchResult
                    });
                }
                
                // Small delay between batches to prevent blocking
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const endTime = performance.now();
            const progressiveLoadTime = endTime - startTime;
            
            // Track performance
            this.trackPerformance('progressiveLoadPages', progressiveLoadTime, {
                pdfId,
                startPage,
                batchSize,
                totalLoaded,
                batchesLoaded: loadResults.length
            });
            
            console.log(`📱 PDFJSI: Progressive loading completed: ${totalLoaded} pages in ${progressiveLoadTime.toFixed(2)}ms`);
            
            return {
                success: true,
                totalLoaded,
                batchesLoaded: loadResults.length,
                loadResults,
                progressiveLoadTime
            };
            
        } catch (error) {
            const endTime = performance.now();
            const progressiveLoadTime = endTime - startTime;
            
            console.error(`📱 PDFJSI: Error in progressive loading in ${progressiveLoadTime.toFixed(2)}ms:`, error);
            
            this.trackPerformance('progressiveLoadPages', progressiveLoadTime, {
                pdfId,
                startPage,
                batchSize,
                success: false,
                error: error.message
            });
            
            throw error;
        }
    }
    
    /**
     * Smart caching for frequently accessed pages
     * @param {string} pdfId - PDF identifier
     * @param {Array<number>} frequentPages - Array of frequently accessed page numbers
     * @returns {Promise<Object>} Smart cache result
     */
    async smartCacheFrequentPages(pdfId, frequentPages = []) {
        if (!this.isJSIAvailable) {
            throw new Error('JSI not available - falling back to bridge mode');
        }
        
        const startTime = performance.now();
        
        try {
            console.log(`📱 PDFJSI: Smart caching ${frequentPages.length} frequent pages for PDF ${pdfId}`);
            
            const cacheResults = [];
            
            // Cache each frequent page
            for (const pageNumber of frequentPages) {
                try {
                    const cacheResult = await this.preloadPagesDirect(pdfId, pageNumber, pageNumber);
                    cacheResults.push({
                        pageNumber,
                        success: cacheResult
                    });
                } catch (error) {
                    console.warn(`📱 PDFJSI: Failed to cache page ${pageNumber}:`, error);
                    cacheResults.push({
                        pageNumber,
                        success: false,
                        error: error.message
                    });
                }
            }
            
            const endTime = performance.now();
            const smartCacheTime = endTime - startTime;
            
            const successfulCaches = cacheResults.filter(result => result.success).length;
            
            // Track performance
            this.trackPerformance('smartCacheFrequentPages', smartCacheTime, {
                pdfId,
                totalPages: frequentPages.length,
                successfulCaches,
                cacheResults
            });
            
            console.log(`📱 PDFJSI: Smart caching completed: ${successfulCaches}/${frequentPages.length} pages cached in ${smartCacheTime.toFixed(2)}ms`);
            
            return {
                success: true,
                totalPages: frequentPages.length,
                successfulCaches,
                cacheResults,
                smartCacheTime
            };
            
        } catch (error) {
            const endTime = performance.now();
            const smartCacheTime = endTime - startTime;
            
            console.error(`📱 PDFJSI: Error in smart caching in ${smartCacheTime.toFixed(2)}ms:`, error);
            
            this.trackPerformance('smartCacheFrequentPages', smartCacheTime, {
                pdfId,
                totalPages: frequentPages.length,
                success: false,
                error: error.message
            });
            
            throw error;
        }
    }

    /**
     * Check 16KB page size support (Google Play requirement)
     * @returns {Promise<Object>} 16KB page size support status
     */
    async check16KBSupport() {
        try {
            let result;
            if (Platform.OS === 'android') {
                result = await PDFJSIManagerNative.check16KBSupport();
            } else if (Platform.OS === 'ios') {
                result = await RNPDFPdfViewManager.check16KBSupport();
            } else {
                throw new Error(`Platform ${Platform.OS} not supported`);
            }

            return {
                supported: result && result.supported,
                platform: result?.platform || Platform.OS,
                message: result?.message || '16KB page size support check completed',
                googlePlayCompliant: result?.googlePlayCompliant || false,
                ndkVersion: result?.ndkVersion || '27.0.12077973',
                buildFlags: result?.buildFlags || 'ANDROID_PAGE_SIZE_AGNOSTIC=ON'
            };
        } catch (error) {
            console.warn('📱 PDFJSI: 16KB support check failed:', error);
            return {
                supported: false,
                platform: Platform.OS,
                message: '16KB page size support check failed',
                googlePlayCompliant: false,
                error: error.message
            };
        }
    }
}

// Create singleton instance
const pdfJSIManager = new PDFJSIManager();

export default pdfJSIManager;

// Export individual methods for convenience
export const {
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
    clearPerformanceHistory,
    lazyLoadPages,
    progressiveLoadPages,
    smartCacheFrequentPages,
    check16KBSupport
} = pdfJSIManager;