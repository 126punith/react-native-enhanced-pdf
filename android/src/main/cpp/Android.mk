# Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
# All rights reserved.
# 
# Android.mk configuration for PDF JSI native module

LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

# Module name
LOCAL_MODULE := pdfjsi

# Source files
LOCAL_SRC_FILES := \
    PDFJSI.cpp \
    PDFJSIBridge.cpp \
    PDFJSIModule.cpp

# C++ standard
LOCAL_CPP_STANDARD := c++17

# Compiler flags
LOCAL_CPPFLAGS := \
    -std=c++17 \
    -fexceptions \
    -frtti \
    -O3 \
    -ffast-math \
    -funroll-loops \
    -fomit-frame-pointer \
    -fno-stack-protector \
    -fvisibility=hidden \
    -DANDROID \
    -DREACT_NATIVE_VERSION=\"0.72.0\"

# Include directories
LOCAL_C_INCLUDES := \
    $(REACT_NATIVE)/ReactCommon \
    $(REACT_NATIVE)/ReactCommon/jsi \
    $(REACT_NATIVE)/ReactCommon/callinvoker \
    $(REACT_NATIVE)/ReactCommon/turbomodule/core \
    $(REACT_NATIVE)/ReactAndroid/src/main/jni/react/jni \
    $(REACT_NATIVE)/ReactAndroid/src/main/jni/first-party/fbjni/headers \
    $(LOCAL_PATH)

# Libraries to link
LOCAL_LDLIBS := -llog

# Build shared library
include $(BUILD_SHARED_LIBRARY)