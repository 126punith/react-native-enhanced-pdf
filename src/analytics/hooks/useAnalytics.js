/**
 * useAnalytics Hook
 * React hook for reading analytics and insights
 * 
 * LICENSE: Commercial License (Pro feature)
 * 
 * @author Punith M
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import analyticsManager from '../AnalyticsManager';

/**
 * useAnalytics Hook
 * @param {string} pdfId - PDF identifier
 * @param {Object} options - Hook options
 * @returns {Object} Analytics state and methods
 */
export const useAnalytics = (pdfId, options = {}) => {
    const {
        autoLoad = true,
        refreshInterval = null // Auto-refresh interval in ms (null = no auto-refresh)
    } = options;

    // State
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    /**
     * Load analytics
     */
    const loadAnalytics = useCallback(async () => {
        if (!pdfId) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await analyticsManager.getAnalytics(pdfId);
            setAnalytics(data);
            setLastUpdated(new Date());
            console.log('📊 useAnalytics: Analytics loaded');
        } catch (err) {
            console.error('📊 useAnalytics: Error loading analytics:', err);
            setError(err);
            setAnalytics(null);
        } finally {
            setIsLoading(false);
        }
    }, [pdfId]);

    /**
     * Refresh analytics
     */
    const refresh = useCallback(async () => {
        await loadAnalytics();
    }, [loadAnalytics]);

    /**
     * Get specific metric
     */
    const getMetric = useCallback((metricPath) => {
        if (!analytics) return null;

        // Support dot notation: "readingMetrics.pagesPerHour"
        const parts = metricPath.split('.');
        let value = analytics;

        for (const part of parts) {
            value = value?.[part];
            if (value === undefined) return null;
        }

        return value;
    }, [analytics]);

    /**
     * Get insights by type
     */
    const getInsightsByType = useCallback((type) => {
        if (!analytics?.insights) return [];
        return analytics.insights.filter(i => i.type === type);
    }, [analytics]);

    /**
     * Get recommendations
     */
    const getRecommendations = useCallback(() => {
        if (!analytics || !analytics.insights) return [];
        
        const progress = analytics;
        const bookmarks = []; // Would need to fetch separately
        
        return analyticsManager.generateRecommendations(progress, bookmarks);
    }, [analytics]);

    /**
     * Export analytics
     */
    const exportAnalytics = useCallback(async () => {
        if (!pdfId) return null;

        try {
            const data = await analyticsManager.exportAnalytics(pdfId);
            console.log('📊 useAnalytics: Analytics exported');
            return data;
        } catch (err) {
            console.error('📊 useAnalytics: Export error:', err);
            return null;
        }
    }, [pdfId]);

    /**
     * Get reading streak
     */
    const getStreak = useCallback(async () => {
        if (!pdfId) return null;

        try {
            const streak = await analyticsManager.getReadingStreak(pdfId);
            return streak;
        } catch (err) {
            console.error('📊 useAnalytics: Streak error:', err);
            return null;
        }
    }, [pdfId]);

    /**
     * Get comparison with average
     */
    const getComparison = useCallback(() => {
        if (!analytics) return null;

        const progress = {
            pagesRead: analytics.pagesRead || [],
            totalPages: analytics.totalPages || 0,
            timeSpent: analytics.timeSpent || 0,
            sessions: analytics.sessions || 0
        };

        return analyticsManager.getComparison(progress);
    }, [analytics]);

    // ============================================
    // EFFECTS
    // ============================================

    /**
     * Auto-load on mount
     */
    useEffect(() => {
        if (autoLoad && pdfId) {
            loadAnalytics();
        }
    }, [autoLoad, pdfId, loadAnalytics]);

    /**
     * Auto-refresh interval
     */
    useEffect(() => {
        if (!refreshInterval || !pdfId) return;

        const interval = setInterval(() => {
            loadAnalytics();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [refreshInterval, pdfId, loadAnalytics]);

    return {
        // State
        analytics,
        isLoading,
        error,
        lastUpdated,

        // Methods
        refresh,
        loadAnalytics,
        getMetric,
        getInsightsByType,
        getRecommendations,
        exportAnalytics,
        getStreak,
        getComparison,

        // Convenience accessors
        readingMetrics: analytics?.readingMetrics || null,
        engagementMetrics: analytics?.engagementMetrics || null,
        pageAnalytics: analytics?.pageAnalytics || null,
        timeAnalytics: analytics?.timeAnalytics || null,
        predictions: analytics?.predictions || null,
        insights: analytics?.insights || []
    };
};

export default useAnalytics;

