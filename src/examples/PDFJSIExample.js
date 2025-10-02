/**
 * Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
 * All rights reserved.
 * 
 * Comprehensive example showing how to use the Enhanced PDF JSI functionality
 * Demonstrates both basic usage and advanced performance features
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    TextInput,
    Platform
} from 'react-native';

// Import JSI functionality
import {
    PDFJSI,
    EnhancedPdfView,
    usePDFJSI,
    EnhancedPdfUtils
} from '../index';

/**
 * Basic JSI Usage Example
 */
export const BasicJSIExample = () => {
    const [isJSIAvailable, setIsJSIAvailable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    
    useEffect(() => {
        checkJSIAvailability();
    }, []);
    
    const checkJSIAvailability = async () => {
        try {
            const available = await PDFJSI.checkJSIAvailability();
            setIsJSIAvailable(available);
        } catch (error) {
            console.error('Error checking JSI availability:', error);
        }
    };
    
    const testJSI = async () => {
        setLoading(true);
        try {
            const pdfId = 'test_pdf_123';
            const pageNumber = 1;
            const scale = 2.0;
            const base64Data = 'dGVzdF9wZGY='; // Mock base64 data
            
            const renderResult = await PDFJSI.renderPageDirect(pdfId, pageNumber, scale, base64Data);
            setResult(renderResult);
            
            Alert.alert('JSI Test', `Render result: ${renderResult.success ? 'Success' : 'Failed'}`);
        } catch (error) {
            Alert.alert('JSI Test Error', error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const getStats = async () => {
        try {
            const stats = await PDFJSI.getJSIStats();
            Alert.alert('JSI Stats', JSON.stringify(stats, null, 2));
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Basic JSI Example</Text>
            
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    JSI Status: {isJSIAvailable ? '✅ Available' : '❌ Not Available'}
                </Text>
                <Text style={styles.statusText}>
                    Platform: {Platform.OS}
                </Text>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={testJSI} disabled={loading}>
                <Text style={styles.buttonText}>
                    {loading ? 'Testing...' : 'Test JSI Render'}
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={getStats}>
                <Text style={styles.buttonText}>Get JSI Stats</Text>
            </TouchableOpacity>
            
            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>
                        Result: {JSON.stringify(result, null, 2)}
                    </Text>
                </View>
            )}
        </View>
    );
};

/**
 * Hook-based JSI Usage Example
 */
export const HookJSIExample = () => {
    const {
        isJSIAvailable,
        isInitialized,
        renderPage,
        getPageMetrics,
        preloadPages,
        searchText,
        getPerformanceHistory,
        clearPerformanceHistory,
        createPDFInstance,
        getPDFInstances
    } = usePDFJSI({
        autoInitialize: true,
        enablePerformanceTracking: true
    });
    
    const [pdfId, setPdfId] = useState('hook_test_pdf');
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(2.0);
    const [searchTerm, setSearchTerm] = useState('');
    const [performanceData, setPerformanceData] = useState([]);
    
    useEffect(() => {
        if (isInitialized && isJSIAvailable) {
            createPDFInstance(pdfId);
        }
    }, [isInitialized, isJSIAvailable, pdfId, createPDFInstance]);
    
    const handleRenderPage = useCallback(async () => {
        try {
            const base64Data = 'dGVzdF9wZGY='; // Mock data
            const result = await renderPage(pdfId, pageNumber, scale, base64Data);
            
            Alert.alert('Hook JSI', `Page rendered: ${result.success ? 'Success' : 'Failed'}`);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }, [pdfId, pageNumber, scale, renderPage]);
    
    const handleGetMetrics = useCallback(async () => {
        try {
            const metrics = await getPageMetrics(pdfId, pageNumber);
            Alert.alert('Page Metrics', JSON.stringify(metrics, null, 2));
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }, [pdfId, pageNumber, getPageMetrics]);
    
    const handlePreloadPages = useCallback(async () => {
        try {
            const success = await preloadPages(pdfId, 1, 5);
            Alert.alert('Preload', `Preloaded pages: ${success ? 'Success' : 'Failed'}`);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }, [pdfId, preloadPages]);
    
    const handleSearch = useCallback(async () => {
        if (!searchTerm.trim()) {
            Alert.alert('Error', 'Please enter a search term');
            return;
        }
        
        try {
            const results = await searchText(pdfId, searchTerm, 1, 10);
            Alert.alert('Search Results', `Found ${results.length} matches`);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }, [pdfId, searchTerm, searchText]);
    
    const updatePerformanceData = useCallback(() => {
        const history = getPerformanceHistory();
        setPerformanceData(history);
    }, [getPerformanceHistory]);
    
    const clearPerformance = useCallback(() => {
        clearPerformanceHistory();
        setPerformanceData([]);
        Alert.alert('Performance', 'Performance history cleared');
    }, [clearPerformanceHistory]);
    
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Hook-based JSI Example</Text>
            
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    JSI Status: {isJSIAvailable ? '✅ Available' : '❌ Not Available'}
                </Text>
                <Text style={styles.statusText}>
                    Initialized: {isInitialized ? '✅ Yes' : '⏳ No'}
                </Text>
            </View>
            
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="PDF ID"
                    value={pdfId}
                    onChangeText={setPdfId}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Page Number"
                    value={pageNumber.toString()}
                    onChangeText={(text) => setPageNumber(parseInt(text) || 1)}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Scale"
                    value={scale.toString()}
                    onChangeText={(text) => setScale(parseFloat(text) || 1.0)}
                    keyboardType="numeric"
                />
            </View>
            
            <TouchableOpacity style={styles.button} onPress={handleRenderPage}>
                <Text style={styles.buttonText}>Render Page</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={handleGetMetrics}>
                <Text style={styles.buttonText}>Get Page Metrics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={handlePreloadPages}>
                <Text style={styles.buttonText}>Preload Pages 1-5</Text>
            </TouchableOpacity>
            
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Search term"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                <TouchableOpacity style={styles.button} onPress={handleSearch}>
                    <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={updatePerformanceData}>
                <Text style={styles.buttonText}>Update Performance Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={clearPerformance}>
                <Text style={styles.buttonText}>Clear Performance History</Text>
            </TouchableOpacity>
            
            {performanceData.length > 0 && (
                <View style={styles.performanceContainer}>
                    <Text style={styles.performanceTitle}>Performance History:</Text>
                    {performanceData.slice(-5).map((item, index) => (
                        <Text key={index} style={styles.performanceText}>
                            {item.operation}: {item.duration.toFixed(2)}ms ({item.mode})
                        </Text>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

/**
 * Enhanced PDF View Example
 */
export const EnhancedPdfViewExample = () => {
    const [showPerformance, setShowPerformance] = useState(false);
    
    const handleShowPerformance = async () => {
        try {
            const benchmark = await EnhancedPdfUtils.getPerformanceBenchmark();
            Alert.alert(
                'Performance Benchmark',
                `JSI Available: ${benchmark.jsiAvailable}\n` +
                `Performance Level: ${benchmark.performanceLevel}\n` +
                `Direct Memory Access: ${benchmark.directMemoryAccess}\n` +
                `Operations: ${benchmark.operationHistory.length}`
            );
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };
    
    const handleClearCaches = async () => {
        try {
            const success = await EnhancedPdfUtils.clearAllCaches();
            Alert.alert('Cache', `Caches cleared: ${success ? 'Success' : 'Failed'}`);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };
    
    const handleOptimizeMemory = async () => {
        try {
            const success = await EnhancedPdfUtils.optimizeAllMemory();
            Alert.alert('Memory', `Memory optimized: ${success ? 'Success' : 'Failed'}`);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enhanced PDF View Example</Text>
            
            <EnhancedPdfView
                source={{ uri: 'https://example.com/sample.pdf' }}
                style={styles.pdfView}
                onLoadComplete={(numberOfPages) => {
                    console.log(`PDF loaded with ${numberOfPages} pages`);
                }}
                onPageChanged={(page) => {
                    console.log(`Current page: ${page}`);
                }}
                onError={(error) => {
                    console.error('PDF error:', error);
                }}
                // JSI-specific props
                jsiEnabled={true}
                enablePerformanceTracking={true}
                enableSmartCaching={true}
            />
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleShowPerformance}>
                    <Text style={styles.buttonText}>Show Performance</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.button} onPress={handleClearCaches}>
                    <Text style={styles.buttonText}>Clear Caches</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.button} onPress={handleOptimizeMemory}>
                    <Text style={styles.buttonText}>Optimize Memory</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

/**
 * Main Example App
 */
export const PDFJSIExampleApp = () => {
    const [currentExample, setCurrentExample] = useState('basic');
    
    const renderExample = () => {
        switch (currentExample) {
            case 'basic':
                return <BasicJSIExample />;
            case 'hook':
                return <HookJSIExample />;
            case 'enhanced':
                return <EnhancedPdfViewExample />;
            default:
                return <BasicJSIExample />;
        }
    };
    
    return (
        <View style={styles.appContainer}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, currentExample === 'basic' && styles.activeTab]}
                    onPress={() => setCurrentExample('basic')}
                >
                    <Text style={styles.tabText}>Basic</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.tab, currentExample === 'hook' && styles.activeTab]}
                    onPress={() => setCurrentExample('hook')}
                >
                    <Text style={styles.tabText}>Hook</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.tab, currentExample === 'enhanced' && styles.activeTab]}
                    onPress={() => setCurrentExample('enhanced')}
                >
                    <Text style={styles.tabText}>Enhanced</Text>
                </TouchableOpacity>
            </View>
            
            {renderExample()}
        </View>
    );
};

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    tab: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent'
    },
    activeTab: {
        borderBottomColor: '#007AFF'
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333'
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333'
    },
    statusContainer: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20
    },
    statusText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333'
    },
    inputContainer: {
        marginBottom: 20
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        fontSize: 16
    },
    searchContainer: {
        marginBottom: 20
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    resultContainer: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
        marginTop: 20
    },
    resultText: {
        fontSize: 14,
        color: '#333'
    },
    performanceContainer: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginTop: 20
    },
    performanceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    performanceText: {
        fontSize: 14,
        marginBottom: 5,
        color: '#666'
    },
    pdfView: {
        flex: 1,
        backgroundColor: '#f0f0f0'
    }
});

export default PDFJSIExampleApp;
