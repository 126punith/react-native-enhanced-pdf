/**
 * Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
 * All rights reserved.
 * 
 * React Hook for easy JSI integration in functional components
 * Provides automatic JSI availability detection and fallback handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import PDFJSI from '../PDFJSI';

/**
 * Hook for PDF JSI functionality
 * @param {Object} options - Configuration options
 * @returns {Object} JSI utilities and state
 */
export const usePDFJSI = (options = {}) => {
    const {
        autoInitialize = true,
        enablePerformanceTracking = true,
        enableCaching = true,
        maxCacheSize = 100
    } = options;
    
    // State management
    const [isJSIAvailable, setIsJSIAvailable] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [performanceMetrics, setPerformanceMetrics] = useState(null);
    const [jsiStats, setJsiStats] = useState(null);
    
    // Refs for tracking
    const pdfInstancesRef = useRef(new Map());
    const performanceHistoryRef = useRef([]);
    
    /**
     * Initialize JSI availability check
     */
    const initializeJSI = useCallback(async () => {
        try {
            if (Platform.OS !== 'android') {
                setIsJSIAvailable(false);
                setIsInitialized(true);
                return false;
            }
            
            const isAvailable = await PDFJSI.checkJSIAvailability();
            setIsJSIAvailable(isAvailable);
            setIsInitialized(true);
            
            if (isAvailable && enablePerformanceTracking) {
                const stats = await PDFJSI.getJSIStats();
                setJsiStats(stats);
            }
            
            return isAvailable;
        } catch (error) {
            console.error('📱 usePDFJSI: Error initializing JSI:', error);
            setIsJSIAvailable(false);
            setIsInitialized(true);
            return false;
        }
    }, [enablePerformanceTracking]);
    
    /**
     * Render page with JSI or fallback
     */
    const renderPage = useCallback(async (pdfId, pageNumber, scale, base64Data) => {
        const startTime = performance.now();
        
        try {
            if (isJSIAvailable) {
                const result = await PDFJSI.renderPageDirect(pdfId, pageNumber, scale, base64Data);
                
                const endTime = performance.now();
                const renderTime = endTime - startTime;
                
                // Track performance
                if (enablePerformanceTracking) {
                    performanceHistoryRef.current.push({
                        operation: 'renderPage',
                        duration: renderTime,
                        timestamp: Date.now(),
                        pdfId,
                        pageNumber,
                        scale,
                        mode: 'JSI'
                    });
                }
                
                return result;
            } else {
                // Fallback to bridge mode (would need to implement)
                throw new Error('JSI not available and bridge fallback not implemented');
            }
        } catch (error) {
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            if (enablePerformanceTracking) {
                performanceHistoryRef.current.push({
                    operation: 'renderPage',
                    duration: renderTime,
                    timestamp: Date.now(),
                    pdfId,
                    pageNumber,
                    scale,
                    mode: 'JSI_ERROR',
                    error: error.message
                });
            }
            
            throw error;
        }
    }, [isJSIAvailable, enablePerformanceTracking]);
    
    /**
     * Get page metrics
     */
    const getPageMetrics = useCallback(async (pdfId, pageNumber) => {
        try {
            if (isJSIAvailable) {
                return await PDFJSI.getPageMetrics(pdfId, pageNumber);
            } else {
                throw new Error('JSI not available');
            }
        } catch (error) {
            console.error('📱 usePDFJSI: Error getting page metrics:', error);
            throw error;
        }
    }, [isJSIAvailable]);
    
    /**
     * Preload pages
     */
    const preloadPages = useCallback(async (pdfId, startPage, endPage) => {
        try {
            if (isJSIAvailable) {
                return await PDFJSI.preloadPagesDirect(pdfId, startPage, endPage);
            } else {
                throw new Error('JSI not available');
            }
        } catch (error) {
            console.error('📱 usePDFJSI: Error preloading pages:', error);
            throw error;
        }
    }, [isJSIAvailable]);
    
    /**
     * Search text
     */
    const searchText = useCallback(async (pdfId, searchTerm, startPage, endPage) => {
        try {
            if (isJSIAvailable) {
                return await PDFJSI.searchTextDirect(pdfId, searchTerm, startPage, endPage);
            } else {
                throw new Error('JSI not available');
            }
        } catch (error) {
            console.error('📱 usePDFJSI: Error searching text:', error);
            throw error;
        }
    }, [isJSIAvailable]);
    
    /**
     * Get cache metrics
     */
    const getCacheMetrics = useCallback(async (pdfId) => {
        try {
            if (isJSIAvailable) {
                return await PDFJSI.getCacheMetrics(pdfId);
            } else {
                throw new Error('JSI not available');
            }
        } catch (error) {
            console.error('📱 usePDFJSI: Error getting cache metrics:', error);
            throw error;
        }
    }, [isJSIAvailable]);
    
    /**
     * Clear cache
     */
    const clearCache = useCallback(async (pdfId, cacheType = 'all') => {
        try {
            if (isJSIAvailable) {
                return await PDFJSI.clearCacheDirect(pdfId, cacheType);
            } else {
                throw new Error('JSI not available');
            }
        } catch (error) {
            console.error('📱 usePDFJSI: Error clearing cache:', error);
            throw error;
        }
    }, [isJSIAvailable]);
    
    /**
     * Optimize memory
     */
    const optimizeMemory = useCallback(async (pdfId) => {
        try {
            if (isJSIAvailable) {
                return await PDFJSI.optimizeMemory(pdfId);
            } else {
                throw new Error('JSI not available');
            }
        } catch (error) {
            console.error('📱 usePDFJSI: Error optimizing memory:', error);
            throw error;
        }
    }, [isJSIAvailable]);
    
    /**
     * Set render quality
     */
    const setRenderQuality = useCallback(async (pdfId, quality) => {
        try {
            if (isJSIAvailable) {
                return await PDFJSI.setRenderQuality(pdfId, quality);
            } else {
                throw new Error('JSI not available');
            }
        } catch (error) {
            console.error('📱 usePDFJSI: Error setting render quality:', error);
            throw error;
        }
    }, [isJSIAvailable]);
    
    /**
     * Update performance metrics
     */
    const updatePerformanceMetrics = useCallback(async (pdfId) => {
        try {
            if (isJSIAvailable) {
                const metrics = await PDFJSI.getPerformanceMetrics(pdfId);
                setPerformanceMetrics(metrics);
                return metrics;
            }
        } catch (error) {
            console.error('📱 usePDFJSI: Error updating performance metrics:', error);
        }
        return null;
    }, [isJSIAvailable]);
    
    /**
     * Get performance history
     */
    const getPerformanceHistory = useCallback(() => {
        return [...performanceHistoryRef.current];
    }, []);
    
    /**
     * Clear performance history
     */
    const clearPerformanceHistory = useCallback(() => {
        performanceHistoryRef.current = [];
    }, []);
    
    /**
     * Create PDF instance with tracking
     */
    const createPDFInstance = useCallback((pdfId, options = {}) => {
        const instance = {
            id: pdfId,
            created: Date.now(),
            options,
            metrics: null,
            cacheMetrics: null
        };
        
        pdfInstancesRef.current.set(pdfId, instance);
        return instance;
    }, []);
    
    /**
     * Remove PDF instance
     */
    const removePDFInstance = useCallback((pdfId) => {
        pdfInstancesRef.current.delete(pdfId);
    }, []);
    
    /**
     * Get all PDF instances
     */
    const getPDFInstances = useCallback(() => {
        return Array.from(pdfInstancesRef.current.values());
    }, []);
    
    // Initialize JSI on mount if autoInitialize is enabled
    useEffect(() => {
        if (autoInitialize && !isInitialized) {
            initializeJSI();
        }
    }, [autoInitialize, isInitialized, initializeJSI]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Cleanup PDF instances
            pdfInstancesRef.current.clear();
            
            // Clear performance history if needed
            if (!enablePerformanceTracking) {
                performanceHistoryRef.current = [];
            }
        };
    }, [enablePerformanceTracking]);
    
    return {
        // State
        isJSIAvailable,
        isInitialized,
        performanceMetrics,
        jsiStats,
        
        // Core functions
        renderPage,
        getPageMetrics,
        preloadPages,
        searchText,
        getCacheMetrics,
        clearCache,
        optimizeMemory,
        setRenderQuality,
        
        // Performance tracking
        updatePerformanceMetrics,
        getPerformanceHistory,
        clearPerformanceHistory,
        
        // Instance management
        createPDFInstance,
        removePDFInstance,
        getPDFInstances,
        
        // Utilities
        initializeJSI
    };
};

export default usePDFJSI;
