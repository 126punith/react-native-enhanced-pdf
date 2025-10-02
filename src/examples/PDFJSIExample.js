/**
 * Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
 * Enhanced PDF JSI Example Usage
 * All rights reserved.
 * 
 * Example demonstrating how to use the enhanced PDF JSI components
 */

import React, { useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { usePDFJSI, EnhancedPdfView, EnhancedPdfUtils } from '../index';

const PDFJSIExample = () => {
    const pdfRef = useRef(null);
    const [jsiStats, setJsiStats] = useState(null);
    const [performanceHistory, setPerformanceHistory] = useState([]);
    
    // Initialize JSI hook
    const {
        isJSIAvailable,
        isInitialized,
        renderPage,
        getPageMetrics,
        preloadPages,
        searchText,
        getCacheMetrics,
        clearCache,
        optimizeMemory,
        setRenderQuality,
        updatePerformanceMetrics,
        getPerformanceHistory,
        createPDFInstance
    } = usePDFJSI({
        autoInitialize: true,
        enablePerformanceTracking: true,
        enableCaching: true
    });

    const handleCheckJSI = async () => {
        try {
            const stats = await EnhancedPdfUtils.getPerformanceBenchmark();
            setJsiStats(stats);
            Alert.alert('JSI Status', `Available: ${stats.jsiAvailable}\nLevel: ${stats.performanceLevel}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to get JSI stats');
        }
    };

    const handleRenderPage = async () => {
        try {
            const pdfId = 'example_pdf';
            const result = await renderPage(pdfId, 1, 1.5, 'base64data');
            Alert.alert('Success', `Page rendered: ${JSON.stringify(result)}`);
        } catch (error) {
            Alert.alert('Error', `Render failed: ${error.message}`);
        }
    };

    const handleGetMetrics = async () => {
        try {
            const pdfId = 'example_pdf';
            const metrics = await getPageMetrics(pdfId, 1);
            Alert.alert('Page Metrics', JSON.stringify(metrics, null, 2));
        } catch (error) {
            Alert.alert('Error', `Failed to get metrics: ${error.message}`);
        }
    };

    const handlePreloadPages = async () => {
        try {
            const pdfId = 'example_pdf';
            const success = await preloadPages(pdfId, 1, 5);
            Alert.alert('Preload', `Success: ${success}`);
        } catch (error) {
            Alert.alert('Error', `Preload failed: ${error.message}`);
        }
    };

    const handleSearchText = async () => {
        try {
            const pdfId = 'example_pdf';
            const results = await searchText(pdfId, 'example', 1, 10);
            Alert.alert('Search Results', `Found ${results.length} matches`);
        } catch (error) {
            Alert.alert('Error', `Search failed: ${error.message}`);
        }
    };

    const handleClearCache = async () => {
        try {
            const pdfId = 'example_pdf';
            const success = await clearCache(pdfId, 'all');
            Alert.alert('Cache', `Cleared: ${success}`);
        } catch (error) {
            Alert.alert('Error', `Clear cache failed: ${error.message}`);
        }
    };

    const handleOptimizeMemory = async () => {
        try {
            const pdfId = 'example_pdf';
            const success = await optimizeMemory(pdfId);
            Alert.alert('Memory', `Optimized: ${success}`);
        } catch (error) {
            Alert.alert('Error', `Memory optimization failed: ${error.message}`);
        }
    };

    const handleSetQuality = async () => {
        try {
            const pdfId = 'example_pdf';
            const success = await setRenderQuality(pdfId, 3);
            Alert.alert('Quality', `Set to high: ${success}`);
        } catch (error) {
            Alert.alert('Error', `Set quality failed: ${error.message}`);
        }
    };

    const handleGetPerformanceHistory = () => {
        const history = getPerformanceHistory();
        setPerformanceHistory(history);
        Alert.alert('Performance History', `${history.length} operations recorded`);
    };

    const handleCreateInstance = () => {
        const instance = createPDFInstance('example_pdf', { quality: 2 });
        Alert.alert('Instance Created', `ID: ${instance.id}`);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Enhanced PDF JSI Example</Text>
            
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    JSI Available: {isJSIAvailable ? '✅ Yes' : '❌ No'}
                </Text>
                <Text style={styles.statusText}>
                    Initialized: {isInitialized ? '✅ Yes' : '⏳ No'}
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Check JSI Status" onPress={handleCheckJSI} />
                <Button title="Render Page" onPress={handleRenderPage} />
                <Button title="Get Page Metrics" onPress={handleGetMetrics} />
                <Button title="Preload Pages" onPress={handlePreloadPages} />
                <Button title="Search Text" onPress={handleSearchText} />
                <Button title="Clear Cache" onPress={handleClearCache} />
                <Button title="Optimize Memory" onPress={handleOptimizeMemory} />
                <Button title="Set High Quality" onPress={handleSetQuality} />
                <Button title="Get Performance History" onPress={handleGetPerformanceHistory} />
                <Button title="Create PDF Instance" onPress={handleCreateInstance} />
            </View>

            {jsiStats && (
                <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>JSI Statistics:</Text>
                    <Text>Available: {jsiStats.jsiAvailable ? 'Yes' : 'No'}</Text>
                    <Text>Performance Level: {jsiStats.performanceLevel}</Text>
                    <Text>Direct Memory Access: {jsiStats.directMemoryAccess ? 'Yes' : 'No'}</Text>
                    <Text>Bridge Optimized: {jsiStats.bridgeOptimized ? 'Yes' : 'No'}</Text>
                    <Text>Operations: {jsiStats.operationHistory.length}</Text>
                </View>
            )}

            {performanceHistory.length > 0 && (
                <View style={styles.historyContainer}>
                    <Text style={styles.historyTitle}>Performance History:</Text>
                    {performanceHistory.slice(-5).map((entry, index) => (
                        <Text key={index} style={styles.historyEntry}>
                            {entry.operation}: {entry.duration.toFixed(2)}ms ({entry.mode})
                        </Text>
                    ))}
                </View>
            )}

            <View style={styles.enhancedViewContainer}>
                <Text style={styles.enhancedTitle}>Enhanced PDF View:</Text>
                <EnhancedPdfView
                    ref={pdfRef}
                    source={{ uri: 'https://example.com/sample.pdf' }}
                    style={styles.pdfView}
                    onLoadComplete={(numberOfPages) => {
                        console.log(`PDF loaded with ${numberOfPages} pages`);
                    }}
                    onPageChanged={(page, numberOfPages) => {
                        console.log(`Page changed to ${page} of ${numberOfPages}`);
                    }}
                    onError={(error) => {
                        console.error('PDF error:', error);
                    }}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    statusContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statusText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#666',
    },
    buttonContainer: {
        gap: 10,
        marginBottom: 20,
    },
    statsContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    historyContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    historyEntry: {
        fontSize: 14,
        marginBottom: 5,
        color: '#666',
        fontFamily: 'monospace',
    },
    enhancedViewContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    enhancedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    pdfView: {
        height: 400,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    },
});

export default PDFJSIExample;