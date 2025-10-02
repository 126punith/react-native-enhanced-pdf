/**
 * Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
 * Enhanced PDF View with JSI integration
 * All rights reserved.
 * 
 * Enhanced PDF View component that automatically uses JSI when available
 * Falls back to traditional bridge-based operations when JSI is not available
 */

import React, { Component } from 'react';
import { Platform, Alert } from 'react-native';
import Pdf from '../index';
import PDFJSI from './PDFJSI';

export default class EnhancedPdfView extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            isJSIAvailable: false,
            jsiInitialized: false,
            pdfData: null,
            renderMode: 'bridge' // 'bridge' or 'jsi'
        };
        
        this.initializeJSI();
    }
    
    /**
     * Initialize JSI availability check
     */
    async initializeJSI() {
        try {
            if (Platform.OS === 'android') {
                const isAvailable = await PDFJSI.checkJSIAvailability();
                this.setState({ 
                    isJSIAvailable: isAvailable,
                    jsiInitialized: true,
                    renderMode: isAvailable ? 'jsi' : 'bridge'
                });
                
                if (isAvailable) {
                    console.log('📱 EnhancedPdfView: JSI mode enabled - High performance mode active');
                } else {
                    console.log('📱 EnhancedPdfView: Bridge mode - Standard performance mode');
                }
            } else {
                this.setState({ 
                    isJSIAvailable: false,
                    jsiInitialized: true,
                    renderMode: 'bridge'
                });
                console.log('📱 EnhancedPdfView: iOS detected - Using bridge mode');
            }
        } catch (error) {
            console.error('📱 EnhancedPdfView: Error initializing JSI:', error);
            this.setState({ 
                isJSIAvailable: false,
                jsiInitialized: true,
                renderMode: 'bridge'
            });
        }
    }
    
    /**
     * Render PDF page using JSI (high-performance)
     */
    async renderPageWithJSI(pageNumber, scale = 1.0) {
        if (!this.state.isJSIAvailable) {
            throw new Error('JSI not available');
        }
        
        try {
            const { source } = this.props;
            let base64Data = '';
            
            // Handle different source types
            if (typeof source === 'string') {
                // Assume it's a URL or file path
                base64Data = source;
            } else if (source && source.uri) {
                base64Data = source.uri;
            } else {
                throw new Error('Invalid PDF source');
            }
            
            const pdfId = `pdf_${Date.now()}`;
            const result = await PDFJSI.renderPageDirect(pdfId, pageNumber, scale, base64Data);
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'Failed to render page');
            }
            
        } catch (error) {
            console.error('📱 EnhancedPdfView: JSI render error:', error);
            throw error;
        }
    }
    
    /**
     * Get page metrics using JSI
     */
    async getPageMetricsWithJSI(pageNumber) {
        if (!this.state.isJSIAvailable) {
            throw new Error('JSI not available');
        }
        
        try {
            const pdfId = `pdf_${Date.now()}`;
            const result = await PDFJSI.getPageMetrics(pdfId, pageNumber);
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'Failed to get page metrics');
            }
            
        } catch (error) {
            console.error('📱 EnhancedPdfView: JSI metrics error:', error);
            throw error;
        }
    }
    
    /**
     * Preload pages using JSI
     */
    async preloadPagesWithJSI(startPage, endPage) {
        if (!this.state.isJSIAvailable) {
            throw new Error('JSI not available');
        }
        
        try {
            const pdfId = `pdf_${Date.now()}`;
            const success = await PDFJSI.preloadPagesDirect(pdfId, startPage, endPage);
            
            if (success) {
                console.log(`📱 EnhancedPdfView: Preloaded pages ${startPage}-${endPage} via JSI`);
            } else {
                throw new Error('Failed to preload pages');
            }
            
            return success;
            
        } catch (error) {
            console.error('📱 EnhancedPdfView: JSI preload error:', error);
            throw error;
        }
    }
    
    /**
     * Search text using JSI
     */
    async searchTextWithJSI(searchTerm, startPage = 1, endPage = 10) {
        if (!this.state.isJSIAvailable) {
            throw new Error('JSI not available');
        }
        
        try {
            const pdfId = `pdf_${Date.now()}`;
            const results = await PDFJSI.searchTextDirect(pdfId, searchTerm, startPage, endPage);
            
            console.log(`📱 EnhancedPdfView: Found ${results.length} matches for '${searchTerm}' via JSI`);
            return results;
            
        } catch (error) {
            console.error('📱 EnhancedPdfView: JSI search error:', error);
            throw error;
        }
    }
    
    /**
     * Get performance metrics
     */
    async getPerformanceMetrics() {
        try {
            const pdfId = `pdf_${Date.now()}`;
            const metrics = await PDFJSI.getPerformanceMetrics(pdfId);
            return metrics;
        } catch (error) {
            console.error('📱 EnhancedPdfView: Error getting performance metrics:', error);
            return null;
        }
    }
    
    /**
     * Get JSI statistics
     */
    async getJSIStats() {
        try {
            const stats = await PDFJSI.getJSIStats();
            return stats;
        } catch (error) {
            console.error('📱 EnhancedPdfView: Error getting JSI stats:', error);
            return null;
        }
    }
    
    /**
     * Clear cache
     */
    async clearCache(cacheType = 'all') {
        try {
            const pdfId = `pdf_${Date.now()}`;
            const success = await PDFJSI.clearCacheDirect(pdfId, cacheType);
            
            if (success) {
                console.log(`📱 EnhancedPdfView: Cache cleared successfully (${cacheType})`);
            }
            
            return success;
        } catch (error) {
            console.error('📱 EnhancedPdfView: Error clearing cache:', error);
            return false;
        }
    }
    
    /**
     * Optimize memory
     */
    async optimizeMemory() {
        try {
            const pdfId = `pdf_${Date.now()}`;
            const success = await PDFJSI.optimizeMemory(pdfId);
            
            if (success) {
                console.log('📱 EnhancedPdfView: Memory optimized successfully');
            }
            
            return success;
        } catch (error) {
            console.error('📱 EnhancedPdfView: Error optimizing memory:', error);
            return false;
        }
    }
    
    /**
     * Set render quality
     */
    async setRenderQuality(quality) {
        try {
            const pdfId = `pdf_${Date.now()}`;
            const success = await PDFJSI.setRenderQuality(pdfId, quality);
            
            if (success) {
                console.log(`📱 EnhancedPdfView: Render quality set to ${quality}`);
            }
            
            return success;
        } catch (error) {
            console.error('📱 EnhancedPdfView: Error setting render quality:', error);
            return false;
        }
    }
    
    /**
     * Show performance information
     */
    showPerformanceInfo = async () => {
        try {
            const stats = await this.getJSIStats();
            const metrics = await this.getPerformanceMetrics();
            
            const message = `Render Mode: ${this.state.renderMode.toUpperCase()}\n` +
                          `JSI Available: ${this.state.isJSIAvailable ? 'Yes' : 'No'}\n` +
                          `Performance Level: ${stats?.performanceLevel || 'Standard'}\n` +
                          `Direct Memory Access: ${stats?.directMemoryAccess ? 'Yes' : 'No'}`;
            
            Alert.alert('Enhanced PDF Performance', message);
        } catch (error) {
            Alert.alert('Performance Info', `Render Mode: ${this.state.renderMode.toUpperCase()}\nJSI Available: ${this.state.isJSIAvailable ? 'Yes' : 'No'}`);
        }
    };
    
    render() {
        const { isJSIAvailable, jsiInitialized, renderMode } = this.state;
        
        // Add JSI-specific props to the PDF component
        const enhancedProps = {
            ...this.props,
            // Add JSI-specific props that can be used by the native component
            jsiEnabled: isJSIAvailable,
            renderMode: renderMode,
            // Add performance tracking props
            enablePerformanceTracking: true,
            // Add cache optimization props
            enableSmartCaching: isJSIAvailable,
        };
        
        return (
            <Pdf 
                {...enhancedProps}
                ref={this.props.pdfRef}
            />
        );
    }
}

// Export additional utilities
export const EnhancedPdfUtils = {
    /**
     * Check if JSI is available
     */
    async isJSIAvailable() {
        try {
            return await PDFJSI.checkJSIAvailability();
        } catch (error) {
            return false;
        }
    },
    
    /**
     * Get performance benchmark
     */
    async getPerformanceBenchmark() {
        try {
            const stats = await PDFJSI.getJSIStats();
            const history = PDFJSI.getPerformanceHistory();
            
            return {
                jsiAvailable: stats?.jsiEnabled || false,
                performanceLevel: stats?.performanceLevel || 'Standard',
                directMemoryAccess: stats?.directMemoryAccess || false,
                bridgeOptimized: stats?.bridgeOptimized || false,
                operationHistory: history
            };
        } catch (error) {
            return {
                jsiAvailable: false,
                performanceLevel: 'Standard',
                directMemoryAccess: false,
                bridgeOptimized: false,
                operationHistory: []
            };
        }
    },
    
    /**
     * Clear all caches
     */
    async clearAllCaches() {
        try {
            const pdfId = `pdf_${Date.now()}`;
            return await PDFJSI.clearCacheDirect(pdfId, 'all');
        } catch (error) {
            return false;
        }
    },
    
    /**
     * Optimize all memory
     */
    async optimizeAllMemory() {
        try {
            const pdfId = `pdf_${Date.now()}`;
            return await PDFJSI.optimizeMemory(pdfId);
        } catch (error) {
            return false;
        }
    }
};