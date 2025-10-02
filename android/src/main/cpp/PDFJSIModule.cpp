/**
 * Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
 * All rights reserved.
 * 
 * JSI Module registration and initialization
 * Integrates JSI PDF operations with React Native
 */

#include <jni.h>
#include <android/log.h>
#include "PDFJSI.h"

#define PDF_JSI_MODULE_LOG_TAG "PDFJSIModule"
#define PDF_JSI_MODULE_LOG(...) __android_log_print(ANDROID_LOG_DEBUG, PDF_JSI_MODULE_LOG_TAG, __VA_ARGS__)
#define PDF_JSI_MODULE_LOG_ERROR(...) __android_log_print(ANDROID_LOG_ERROR, PDF_JSI_MODULE_LOG_TAG, __VA_ARGS__)

// Simplified module implementation
// This file is kept for compatibility but most functionality is in PDFJSI.cpp

extern "C" {
    JNIEXPORT void JNICALL
    Java_org_wonday_pdf_PDFJSIModule_nativeInitialize(JNIEnv *env, jobject thiz) {
        PDF_JSI_MODULE_LOG("PDF JSI Module initialized");
    }
    
    JNIEXPORT jstring JNICALL
    Java_org_wonday_pdf_PDFJSIModule_nativeGetModuleInfo(JNIEnv *env, jobject thiz) {
        PDF_JSI_MODULE_LOG("Getting module info");
        return env->NewStringUTF("{\"module\":\"PDFJSI\",\"version\":\"1.0.0\"}");
    }
}