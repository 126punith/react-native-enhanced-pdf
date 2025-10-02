/**
 * Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
 * Enhanced PDF JSI Bridge with high-performance operations
 * All rights reserved.
 * 
 * JNI Bridge between Java and C++ JSI implementation
 * Provides high-performance PDF operations via JSI
 */

#include <jni.h>
#include <android/log.h>
#include "PDFJSI.h"

#define PDF_JSI_BRIDGE_LOG_TAG "PDFJSIBridge"
#define PDF_JSI_BRIDGE_LOG(...) __android_log_print(ANDROID_LOG_DEBUG, PDF_JSI_BRIDGE_LOG_TAG, __VA_ARGS__)
#define PDF_JSI_BRIDGE_LOG_ERROR(...) __android_log_print(ANDROID_LOG_ERROR, PDF_JSI_BRIDGE_LOG_TAG, __VA_ARGS__)

// Simplified bridge implementation
// This file is kept for compatibility but most functionality is in PDFJSI.cpp

extern "C" {
    JNIEXPORT void JNICALL
    Java_org_wonday_pdf_EnhancedPdfJSIBridge_nativeInitialize(JNIEnv *env, jobject thiz) {
        PDF_JSI_BRIDGE_LOG("Enhanced PDF JSI Bridge initialized");
    }
    
    JNIEXPORT jstring JNICALL
    Java_org_wonday_pdf_EnhancedPdfJSIBridge_nativeGetStats(JNIEnv *env, jobject thiz) {
        PDF_JSI_BRIDGE_LOG("Getting bridge stats");
        return env->NewStringUTF("{\"status\":\"active\",\"version\":\"1.0.0\"}");
    }
}