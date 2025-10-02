/**
 * Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
 * Enhanced PDF JSI Manager with high-performance operations
 * All rights reserved.
 * 
 * JSI Manager for high-performance PDF operations
 * Provides React Native bridge integration for JSI PDF functions
 */

package org.wonday.pdf;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

// import com.facebook.react.turbomodule.core.CallInvokerHolder; // Not available in this RN version
import com.facebook.soloader.SoLoader;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class PDFJSIManager extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "PDFJSIManager";
    private static final String TAG = "PDFJSI";
    
    private ExecutorService backgroundExecutor;
    private boolean isJSIInitialized = false;
    
    // Load native library
    static {
        try {
            SoLoader.loadLibrary("pdfjsi");
            Log.d(TAG, "PDF JSI native library loaded successfully");
        } catch (UnsatisfiedLinkError e) {
            Log.e(TAG, "Failed to load PDF JSI native library", e);
        }
    }
    
    public PDFJSIManager(ReactApplicationContext reactContext) {
        super(reactContext);
        this.backgroundExecutor = Executors.newFixedThreadPool(2);
        
        Log.d(TAG, "PDFJSIManager: Initializing high-performance PDF JSI manager");
        initializeJSI(reactContext);
    }
    
    @Override
    public String getName() {
        return MODULE_NAME;
    }
    
    /**
     * Initialize JSI integration
     */
    private void initializeJSI(ReactApplicationContext reactContext) {
        try {
            // Initialize JSI on background thread
            backgroundExecutor.execute(() -> {
                try {
                    // Initialize JSI module without CallInvokerHolder (fallback mode)
                    nativeInitializeJSI(null);
                    isJSIInitialized = true;
                    Log.d(TAG, "PDF JSI initialized successfully (fallback mode)");
                } catch (Exception e) {
                    Log.e(TAG, "Failed to initialize PDF JSI", e);
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error initializing PDF JSI", e);
        }
    }
    
    /**
     * Check if JSI is available and initialized
     */
    @ReactMethod
    public void isJSIAvailable(Promise promise) {
        try {
            boolean available = isJSIInitialized && nativeIsJSIAvailable();
            Log.d(TAG, "JSI Availability check: " + available);
            promise.resolve(available);
        } catch (Exception e) {
            Log.e(TAG, "Error checking JSI availability", e);
            promise.reject("JSI_CHECK_ERROR", e.getMessage());
        }
    }
    
    /**
     * Render page directly via JSI (high-performance)
     */
    @ReactMethod
    public void renderPageDirect(String pdfId, int pageNumber, double scale, String base64Data, Promise promise) {
        if (!isJSIInitialized) {
            promise.reject("JSI_NOT_INITIALIZED", "JSI is not initialized");
            return;
        }
        
        backgroundExecutor.execute(() -> {
            try {
                Log.d(TAG, "Rendering page " + pageNumber + " via JSI for PDF " + pdfId);
                WritableMap result = nativeRenderPageDirect(pdfId, pageNumber, (float) scale, base64Data);
                promise.resolve(result);
            } catch (Exception e) {
                Log.e(TAG, "Error rendering page via JSI", e);
                promise.reject("RENDER_ERROR", e.getMessage());
            }
        });
    }
    
    /**
     * Get page metrics via JSI
     */
    @ReactMethod
    public void getPageMetrics(String pdfId, int pageNumber, Promise promise) {
        if (!isJSIInitialized) {
            promise.reject("JSI_NOT_INITIALIZED", "JSI is not initialized");
            return;
        }
        
        try {
            Log.d(TAG, "Getting page metrics via JSI for page " + pageNumber);
            WritableMap metrics = nativeGetPageMetrics(pdfId, pageNumber);
            promise.resolve(metrics);
        } catch (Exception e) {
            Log.e(TAG, "Error getting page metrics via JSI", e);
            promise.reject("METRICS_ERROR", e.getMessage());
        }
    }
    
    /**
     * Preload pages directly via JSI
     */
    @ReactMethod
    public void preloadPagesDirect(String pdfId, int startPage, int endPage, Promise promise) {
        if (!isJSIInitialized) {
            promise.reject("JSI_NOT_INITIALIZED", "JSI is not initialized");
            return;
        }
        
        backgroundExecutor.execute(() -> {
            try {
                Log.d(TAG, "Preloading pages " + startPage + "-" + endPage + " via JSI");
                boolean success = nativePreloadPagesDirect(pdfId, startPage, endPage);
                promise.resolve(success);
            } catch (Exception e) {
                Log.e(TAG, "Error preloading pages via JSI", e);
                promise.reject("PRELOAD_ERROR", e.getMessage());
            }
        });
    }
    
    /**
     * Get cache metrics via JSI
     */
    @ReactMethod
    public void getCacheMetrics(String pdfId, Promise promise) {
        if (!isJSIInitialized) {
            promise.reject("JSI_NOT_INITIALIZED", "JSI is not initialized");
            return;
        }
        
        try {
            Log.d(TAG, "Getting cache metrics via JSI for PDF " + pdfId);
            WritableMap metrics = nativeGetCacheMetrics(pdfId);
            promise.resolve(metrics);
        } catch (Exception e) {
            Log.e(TAG, "Error getting cache metrics via JSI", e);
            promise.reject("CACHE_METRICS_ERROR", e.getMessage());
        }
    }
    
    /**
     * Clear cache directly via JSI
     */
    @ReactMethod
    public void clearCacheDirect(String pdfId, String cacheType, Promise promise) {
        if (!isJSIInitialized) {
            promise.reject("JSI_NOT_INITIALIZED", "JSI is not initialized");
            return;
        }
        
        backgroundExecutor.execute(() -> {
            try {
                Log.d(TAG, "Clearing cache via JSI for PDF " + pdfId + ", type: " + cacheType);
                boolean success = nativeClearCacheDirect(pdfId, cacheType);
                promise.resolve(success);
            } catch (Exception e) {
                Log.e(TAG, "Error clearing cache via JSI", e);
                promise.reject("CLEAR_CACHE_ERROR", e.getMessage());
            }
        });
    }
    
    /**
     * Optimize memory via JSI
     */
    @ReactMethod
    public void optimizeMemory(String pdfId, Promise promise) {
        if (!isJSIInitialized) {
            promise.reject("JSI_NOT_INITIALIZED", "JSI is not initialized");
            return;
        }
        
        backgroundExecutor.execute(() -> {
            try {
                Log.d(TAG, "Optimizing memory via JSI for PDF " + pdfId);
                boolean success = nativeOptimizeMemory(pdfId);
                promise.resolve(success);
            } catch (Exception e) {
                Log.e(TAG, "Error optimizing memory via JSI", e);
                promise.reject("OPTIMIZE_MEMORY_ERROR", e.getMessage());
            }
        });
    }
    
    /**
     * Search text directly via JSI
     */
    @ReactMethod
    public void searchTextDirect(String pdfId, String searchTerm, int startPage, int endPage, Promise promise) {
        if (!isJSIInitialized) {
            promise.reject("JSI_NOT_INITIALIZED", "JSI is not initialized");
            return;
        }
        
        backgroundExecutor.execute(() -> {
            try {
                Log.d(TAG, "Searching text via JSI: '" + searchTerm + "' in pages " + startPage + "-" + endPage);
                ReadableArray results = nativeSearchTextDirect(pdfId, searchTerm, startPage, endPage);
                promise.resolve(results);
            } catch (Exception e) {
                Log.e(TAG, "Error searching text via JSI", e);
                promise.reject("SEARCH_ERROR", e.getMessage());
            }
        });
    }
    
    /**
     * Get performance metrics via JSI
     */
    @ReactMethod
    public void getPerformanceMetrics(String pdfId, Promise promise) {
        if (!isJSIInitialized) {
            promise.reject("JSI_NOT_INITIALIZED", "JSI is not initialized");
            return;
        }
        
        try {
            Log.d(TAG, "Getting performance metrics via JSI for PDF " + pdfId);
            WritableMap metrics = nativeGetPerformanceMetrics(pdfId);
            promise.resolve(metrics);
        } catch (Exception e) {
            Log.e(TAG, "Error getting performance metrics via JSI", e);
            promise.reject("PERFORMANCE_METRICS_ERROR", e.getMessage());
        }
    }
    
    /**
     * Set render quality via JSI
     */
    @ReactMethod
    public void setRenderQuality(String pdfId, int quality, Promise promise) {
        if (!isJSIInitialized) {
            promise.reject("JSI_NOT_INITIALIZED", "JSI is not initialized");
            return;
        }
        
        try {
            Log.d(TAG, "Setting render quality via JSI to " + quality + " for PDF " + pdfId);
            boolean success = nativeSetRenderQuality(pdfId, quality);
            promise.resolve(success);
        } catch (Exception e) {
            Log.e(TAG, "Error setting render quality via JSI", e);
            promise.reject("SET_RENDER_QUALITY_ERROR", e.getMessage());
        }
    }
    
    /**
     * Cleanup resources
     */
    // Note: onCatalystInstanceDestroy is deprecated, using onCatalystInstanceDestroy for compatibility
    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        
        if (backgroundExecutor != null && !backgroundExecutor.isShutdown()) {
            backgroundExecutor.shutdown();
        }
        
        if (isJSIInitialized) {
            nativeCleanupJSI();
        }
        
        Log.d(TAG, "PDFJSIManager: Cleaned up resources");
    }
    
    // Native method declarations
    private native void nativeInitializeJSI(Object callInvokerHolder);
    private native boolean nativeIsJSIAvailable();
    private native WritableMap nativeRenderPageDirect(String pdfId, int pageNumber, float scale, String base64Data);
    private native WritableMap nativeGetPageMetrics(String pdfId, int pageNumber);
    private native boolean nativePreloadPagesDirect(String pdfId, int startPage, int endPage);
    private native WritableMap nativeGetCacheMetrics(String pdfId);
    private native boolean nativeClearCacheDirect(String pdfId, String cacheType);
    private native boolean nativeOptimizeMemory(String pdfId);
    private native ReadableArray nativeSearchTextDirect(String pdfId, String searchTerm, int startPage, int endPage);
    private native WritableMap nativeGetPerformanceMetrics(String pdfId);
    private native boolean nativeSetRenderQuality(String pdfId, int quality);
    private native void nativeCleanupJSI();
}
