# Copyright (c) 2025-present, Punith M (punithm300@gmail.com)
# Enhanced PDF JSI CMakeLists with high-performance operations
# All rights reserved.
# 
# CMake configuration for PDF JSI native module

cmake_minimum_required(VERSION 3.13)

# Set project name
project(pdfjsi)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set React Native directory from environment variable
if(NOT DEFINED REACT_ANDROID_DIR)
    set(REACT_ANDROID_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native/ReactAndroid")
endif()

# Include directories
include_directories(
    ${REACT_ANDROID_DIR}/ReactCommon
    ${REACT_ANDROID_DIR}/ReactCommon/jsi
    ${REACT_ANDROID_DIR}/ReactCommon/callinvoker
    ${REACT_ANDROID_DIR}/ReactAndroid/src/main/jni/react/jni
    ${REACT_ANDROID_DIR}/ReactAndroid/src/main/jni/first-party/fbjni/headers
    ${CMAKE_CURRENT_SOURCE_DIR}
)

# Source files
set(SOURCES
    PDFJSI.cpp
    PDFJSIBridge.cpp
)

# Create shared library
add_library(
    pdfjsi
    SHARED
    ${SOURCES}
)

# Link libraries - simplified for compatibility
target_link_libraries(
    pdfjsi
    log
    android
)

# Compiler flags
target_compile_definitions(
    pdfjsi
    PRIVATE
    -DANDROID
    -DREACT_NATIVE_VERSION="0.72.0"
    -DPDFJSI_VERSION="1.0.0"
)

# Optimization flags
target_compile_options(
    pdfjsi
    PRIVATE
    -O3
    -ffast-math
    -funroll-loops
    -fomit-frame-pointer
    -fvisibility=hidden
)

# Set output directory
set_target_properties(
    pdfjsi
    PROPERTIES
    LIBRARY_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/../jniLibs/${ANDROID_ABI}
)