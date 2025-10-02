/**
 * Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
 * Enhanced PDF JSI Integration with high-performance operations
 * All rights reserved.
 * 
 * JSI (JavaScript Interface) header for high-performance PDF operations
 * Provides zero-bridge overhead for direct native PDF rendering and operations
 */

#ifndef PDFJSI_H
#define PDFJSI_H

#include <jni.h>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include <mutex>
#include <thread>
#include <future>
#include <android/log.h>

// Logging macros
#define LOG_TAG "PDFJSI"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// PDF JSI Implementation
class PDFJSI {
public:
    static PDFJSI& getInstance();
    
    // Initialization
    void initialize();
    void cleanup();
    bool isInitialized() const;
    
    // JSI Stats
    std::string getJSIStats();

private:
    PDFJSI() = default;
    ~PDFJSI() = default;
    PDFJSI(const PDFJSI&) = delete;
    PDFJSI& operator=(const PDFJSI&) = delete;
    
    bool m_initialized = false;
    std::mutex m_mutex;
};

// JNI Functions
extern "C" {
    JNIEXPORT void JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeInitializeJSI(JNIEnv *env, jobject thiz, jobject callInvokerHolder);
    
    JNIEXPORT jboolean JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeIsJSIAvailable(JNIEnv *env, jobject thiz);
    
    JNIEXPORT jobject JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeRenderPageDirect(JNIEnv *env, jobject thiz, jstring pdfId, jint pageNumber, jfloat scale, jstring base64Data);
    
    JNIEXPORT jobject JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeGetPageMetrics(JNIEnv *env, jobject thiz, jstring pdfId, jint pageNumber);
    
    JNIEXPORT jboolean JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativePreloadPagesDirect(JNIEnv *env, jobject thiz, jstring pdfId, jint startPage, jint endPage);
    
    JNIEXPORT jobject JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeSearchTextDirect(JNIEnv *env, jobject thiz, jstring pdfId, jstring searchTerm, jint startPage, jint endPage);
    
    JNIEXPORT jobject JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeGetCacheMetrics(JNIEnv *env, jobject thiz, jstring pdfId);
    
    JNIEXPORT jboolean JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeClearCacheDirect(JNIEnv *env, jobject thiz, jstring pdfId, jstring cacheType);
    
    JNIEXPORT jboolean JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeOptimizeMemory(JNIEnv *env, jobject thiz, jstring pdfId);
    
    JNIEXPORT jobject JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeGetPerformanceMetrics(JNIEnv *env, jobject thiz, jstring pdfId);
    
    JNIEXPORT jboolean JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeSetRenderQuality(JNIEnv *env, jobject thiz, jstring pdfId, jint quality);
    
    JNIEXPORT void JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeCleanupJSI(JNIEnv *env, jobject thiz);
    
    JNIEXPORT jstring JNICALL
    Java_org_wonday_pdf_PDFJSIManager_nativeGetJSIStats(JNIEnv *env, jobject thiz);
}

#endif // PDFJSI_H