/**
 * Reading Analytics Module
 * Track reading progress, generate insights, and visualize statistics
 * 
 * LICENSE: Commercial License (Pro feature)
 * 
 * @author Punith M
 * @version 1.0.0
 */

// Core
export { default as analyticsManager, AnalyticsManager } from './AnalyticsManager';

// Hooks
export { useAnalytics } from './hooks/useAnalytics';

// Components
export { AnalyticsDashboard } from './components/AnalyticsDashboard';
export { InsightCard, InsightsList, RecommendationCard } from './components/InsightsCard';
export {
    ProgressBar,
    StatCard,
    BarChart,
    CircularProgress,
    Heatmap,
    MetricRow
} from './components/SimpleCharts';

// Convenience functions
export const getAnalytics = async (pdfId) => {
    const { default: manager } = await import('./AnalyticsManager');
    return manager.getAnalytics(pdfId);
};

export const exportAnalytics = async (pdfId) => {
    const { default: manager } = await import('./AnalyticsManager');
    return manager.exportAnalytics(pdfId);
};

export default {
    analyticsManager,
    useAnalytics,
    AnalyticsDashboard,
    getAnalytics,
    exportAnalytics
};

