/**
 * Copyright (c) 2017-present, Wonday (@wonday.org)
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

package org.wonday.pdf;

import java.util.Collections;
import java.util.List;
import java.util.ArrayList;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

public class RNPDFPackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        // Add JSI modules for enhanced PDF performance
        modules.add(new PDFJSIManager(reactContext));
        modules.add(new EnhancedPdfJSIBridge(reactContext));
        // Add license verification and Pro feature modules
        modules.add(new LicenseVerifier(reactContext));
        modules.add(new PDFTextExtractor(reactContext));
        modules.add(new PDFExporter(reactContext));
        return modules;
    }

    // Deprecated as of RN 0.47.0
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        List<ViewManager> modules = new ArrayList<>();
        modules.add(new PdfManager(reactContext));
        return modules;
    }
}
