/**
 * AnalyticsDashboard - Complete reading analytics dashboard
 * Beautiful visualization of reading statistics and insights
 * 
 * LICENSE: Commercial License (Pro feature)
 * 
 * @author Punith M
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { useAnalytics } from '../hooks/useAnalytics';
import { ProgressBar, StatCard, CircularProgress, MetricRow } from './SimpleCharts';
import { InsightsList, RecommendationCard } from './InsightsCard';

/**
 * AnalyticsDashboard Component
 */
export const AnalyticsDashboard = ({
    pdfId,
    onNavigateToPage,
    style
}) => {
    const {
        analytics,
        isLoading,
        error,
        refresh,
        readingMetrics,
        engagementMetrics,
        pageAnalytics,
        timeAnalytics,
        predictions,
        insights,
        getComparison
    } = useAnalytics(pdfId, { autoLoad: true });

    const [activeTab, setActiveTab] = useState('overview');

    /**
     * Handle insight action
     */
    const handleInsightAction = (action) => {
        if (action.type === 'navigate' && onNavigateToPage) {
            onNavigateToPage(action.page);
        } else if (action.type === 'show_bookmarks') {
            // Handle show bookmarks
            console.log('Show bookmarks');
        }
    };

    /**
     * Render loading state
     */
    if (isLoading && !analytics) {
        return (
            <View style={[styles.container, styles.centerContent, style]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
        );
    }

    /**
     * Render error state
     */
    if (error) {
        return (
            <View style={[styles.container, styles.centerContent, style]}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error.message}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    /**
     * Render empty state
     */
    if (!analytics || !analytics.pagesRead || analytics.pagesRead === 0) {
        return (
            <View style={[styles.container, styles.centerContent, style]}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyText}>Start reading to see analytics</Text>
                <Text style={styles.emptySubtext}>
                    Your reading statistics will appear here
                </Text>
            </View>
        );
    }

    /**
     * Render tabs
     */
    const renderTabs = () => (
        <View style={styles.tabs}>
            {['overview', 'insights', 'details'].map(tab => (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tab,
                        activeTab === tab && styles.tabActive
                    ]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === tab && styles.tabTextActive
                    ]}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    /**
     * Render overview tab
     */
    const renderOverview = () => (
        <View>
            {/* Progress Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reading Progress</Text>
                
                <View style={styles.progressSection}>
                    <CircularProgress
                        progress={analytics.percentage / 100}
                        size={100}
                        strokeWidth={8}
                        color="#4CAF50"
                    >
                        <View style={styles.progressContent}>
                            <Text style={styles.progressPercentage}>
                                {analytics.percentage}%
                            </Text>
                            <Text style={styles.progressLabel}>Complete</Text>
                        </View>
                    </CircularProgress>

                    <View style={styles.progressStats}>
                        <Text style={styles.progressStat}>
                            {analytics.pagesRead}/{analytics.totalPages} pages
                        </Text>
                        <Text style={styles.progressStat}>
                            {analytics.sessions} sessions
                        </Text>
                        {timeAnalytics && (
                            <Text style={styles.progressStat}>
                                {timeAnalytics.formattedTotalTime} spent
                            </Text>
                        )}
                    </View>
                </View>

                <ProgressBar
                    progress={analytics.percentage / 100}
                    color="#4CAF50"
                    style={styles.progressBar}
                />
            </View>

            {/* Key Metrics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Metrics</Text>
                
                <View style={styles.statsGrid}>
                    {readingMetrics && (
                        <>
                            <StatCard
                                icon="📖"
                                value={readingMetrics.pagesPerHour}
                                label="Pages/Hour"
                                color="#2196F3"
                            />
                            <StatCard
                                icon="⏱️"
                                value={readingMetrics.minutesPerPage}
                                label="Min/Page"
                                color="#FF9800"
                            />
                            <StatCard
                                icon="📝"
                                value={readingMetrics.wordsPerMinute}
                                label="Words/Min"
                                color="#9C27B0"
                            />
                        </>
                    )}
                    
                    {engagementMetrics && (
                        <StatCard
                            icon="🔖"
                            value={engagementMetrics.totalBookmarks}
                            label="Bookmarks"
                            color="#FF5722"
                        />
                    )}
                </View>
            </View>

            {/* Time Estimate */}
            {predictions && predictions.completionDateFormatted && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Predictions</Text>
                    
                    <View style={styles.predictionCard}>
                        <Text style={styles.predictionIcon}>🎯</Text>
                        <View style={styles.predictionContent}>
                            <Text style={styles.predictionTitle}>
                                Estimated Completion
                            </Text>
                            <Text style={styles.predictionDate}>
                                {predictions.completionDateFormatted}
                            </Text>
                            <Text style={styles.predictionSubtext}>
                                ~{predictions.sessionsRemaining} more sessions
                            </Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );

    /**
     * Render insights tab
     */
    const renderInsights = () => (
        <View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Insights ({insights?.length || 0})
                </Text>
                
                <InsightsList
                    insights={insights}
                    onAction={handleInsightAction}
                />
            </View>

            {/* Reading Pattern */}
            {pageAnalytics?.readingPattern && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reading Pattern</Text>
                    
                    <View style={styles.patternCard}>
                        <Text style={styles.patternType}>
                            {pageAnalytics.readingPattern === 'linear' && '📖 Linear Reader'}
                            {pageAnalytics.readingPattern === 'selective' && '🎯 Selective Reader'}
                            {pageAnalytics.readingPattern === 'mixed' && '🔀 Mixed Approach'}
                        </Text>
                        <Text style={styles.patternDescription}>
                            {pageAnalytics.readingPattern === 'linear' && 'You read sequentially from start to finish'}
                            {pageAnalytics.readingPattern === 'selective' && 'You jump to specific sections of interest'}
                            {pageAnalytics.readingPattern === 'mixed' && 'You mix sequential and selective reading'}
                        </Text>
                    </View>
                </View>
            )}

            {/* Engagement Score */}
            {engagementMetrics && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Engagement Score</Text>
                    
                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreValue}>
                            {engagementMetrics.engagementScore}/100
                        </Text>
                        <ProgressBar
                            progress={engagementMetrics.engagementScore / 100}
                            color="#4CAF50"
                            height={12}
                        />
                        <Text style={styles.scoreDescription}>
                            {engagementMetrics.engagementScore >= 75 && 'Highly Engaged! 🌟'}
                            {engagementMetrics.engagementScore >= 50 && engagementMetrics.engagementScore < 75 && 'Good Engagement 👍'}
                            {engagementMetrics.engagementScore < 50 && 'Building Engagement 📈'}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );

    /**
     * Render details tab
     */
    const renderDetails = () => (
        <View>
            {/* Time Analytics */}
            {timeAnalytics && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Time Statistics</Text>
                    
                    <MetricRow
                        icon="⏱️"
                        label="Total Time"
                        value={timeAnalytics.formattedTotalTime}
                    />
                    <MetricRow
                        icon="📅"
                        label="Total Sessions"
                        value={timeAnalytics.totalSessions}
                    />
                    <MetricRow
                        icon="⌛"
                        label="Avg Session"
                        value={timeAnalytics.formattedAverageSession}
                    />
                    <MetricRow
                        icon="⚡"
                        label="Efficiency"
                        value={timeAnalytics.efficiency}
                        suffix=" pages/min"
                    />
                </View>
            )}

            {/* Reading Metrics */}
            {readingMetrics && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reading Metrics</Text>
                    
                    <MetricRow
                        icon="📖"
                        label="Pages per Hour"
                        value={readingMetrics.pagesPerHour}
                    />
                    <MetricRow
                        icon="📄"
                        label="Minutes per Page"
                        value={readingMetrics.minutesPerPage}
                    />
                    <MetricRow
                        icon="📝"
                        label="Words per Minute"
                        value={readingMetrics.wordsPerMinute}
                    />
                    <MetricRow
                        icon="✅"
                        label="Completion Rate"
                        value={readingMetrics.completionRate}
                        suffix="%"
                    />
                </View>
            )}

            {/* Bookmark Statistics */}
            {engagementMetrics && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bookmark Statistics</Text>
                    
                    <MetricRow
                        icon="🔖"
                        label="Total Bookmarks"
                        value={engagementMetrics.totalBookmarks}
                    />
                    <MetricRow
                        icon="📍"
                        label="Unique Pages"
                        value={engagementMetrics.uniqueBookmarkedPages}
                    />
                    <MetricRow
                        icon="📊"
                        label="Bookmark Rate"
                        value={engagementMetrics.bookmarkRate}
                        suffix="%"
                    />
                </View>
            )}

            {/* Page Gaps */}
            {pageAnalytics?.readingGaps && pageAnalytics.readingGaps.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reading Gaps</Text>
                    
                    {pageAnalytics.readingGaps.map((gap, index) => (
                        <View key={index} style={styles.gapCard}>
                            <Text style={styles.gapText}>
                                Pages {gap.start}-{gap.end} ({gap.size} pages)
                            </Text>
                            {onNavigateToPage && (
                                <TouchableOpacity
                                    style={styles.gapButton}
                                    onPress={() => onNavigateToPage(gap.start)}
                                >
                                    <Text style={styles.gapButtonText}>Go →</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <ScrollView
            style={[styles.container, style]}
            refreshControl={
                <RefreshControl
                    refreshing={isLoading}
                    onRefresh={refresh}
                    colors={['#007AFF']}
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Reading Analytics</Text>
                <Text style={styles.headerSubtitle}>
                    Track your reading progress and insights
                </Text>
            </View>

            {/* Tabs */}
            {renderTabs()}

            {/* Content */}
            <View style={styles.content}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'insights' && renderInsights()}
                {activeTab === 'details' && renderDetails()}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Last updated: {analytics?.generatedAt 
                        ? new Date(analytics.generatedAt).toLocaleString()
                        : 'Never'}
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#666',
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
    },
    tabTextActive: {
        color: '#007AFF',
    },
    content: {
        padding: 16,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    progressContent: {
        alignItems: 'center',
    },
    progressPercentage: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
    },
    progressLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    progressStats: {
        flex: 1,
        marginLeft: 24,
    },
    progressStat: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    predictionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        padding: 16,
    },
    predictionIcon: {
        fontSize: 40,
        marginRight: 16,
    },
    predictionContent: {
        flex: 1,
    },
    predictionTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    predictionDate: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    predictionSubtext: {
        fontSize: 13,
        color: '#999',
    },
    patternCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
    },
    patternType: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    patternDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    scoreCard: {
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: '700',
        color: '#4CAF50',
        marginBottom: 16,
    },
    scoreDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
        textAlign: 'center',
    },
    gapCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff3cd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    gapText: {
        flex: 1,
        fontSize: 14,
        color: '#856404',
    },
    gapButton: {
        backgroundColor: '#ffc107',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    gapButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#999',
    },
});

export default AnalyticsDashboard;

