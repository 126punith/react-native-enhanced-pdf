/**
 * Copyright (c) 2017-present, Wonday (@wonday.org)
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <Foundation/Foundation.h>

#import "RNPDFPdfViewManager.h"
#import "RNPDFPdfView.h"
#import "PDFJSIManager.h"

#if __has_include(<React/RCTLog.h>)
#import <React/RCTLog.h>
#else
#import "RCTLog.h"
#endif

@implementation RNPDFPdfViewManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
    if([[[UIDevice currentDevice] systemVersion] compare:@"11.0" options:NSNumericSearch] == NSOrderedDescending
       || [[[UIDevice currentDevice] systemVersion] compare:@"11.0" options:NSNumericSearch] == NSOrderedSame) {
        return [[RNPDFPdfView alloc] initWithBridge:self.bridge];
    } else {
        return NULL;
    }
  
}

RCT_EXPORT_VIEW_PROPERTY(path, NSString);
RCT_EXPORT_VIEW_PROPERTY(page, int);
RCT_EXPORT_VIEW_PROPERTY(scale, float);
RCT_EXPORT_VIEW_PROPERTY(minScale, float);
RCT_EXPORT_VIEW_PROPERTY(maxScale, float);
RCT_EXPORT_VIEW_PROPERTY(horizontal, BOOL);
RCT_EXPORT_VIEW_PROPERTY(showsHorizontalScrollIndicator, BOOL);
RCT_EXPORT_VIEW_PROPERTY(showsVerticalScrollIndicator, BOOL);
RCT_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(enablePaging, BOOL);
RCT_EXPORT_VIEW_PROPERTY(enableRTL, BOOL);
RCT_EXPORT_VIEW_PROPERTY(enableAnnotationRendering, BOOL);
RCT_EXPORT_VIEW_PROPERTY(enableDoubleTapZoom, BOOL);
RCT_EXPORT_VIEW_PROPERTY(fitPolicy, int);
RCT_EXPORT_VIEW_PROPERTY(spacing, int);
RCT_EXPORT_VIEW_PROPERTY(password, NSString);
RCT_EXPORT_VIEW_PROPERTY(onChange, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(singlePage, BOOL);

RCT_EXPORT_METHOD(supportPDFKit:(RCTResponseSenderBlock)callback)
{
    if([[[UIDevice currentDevice] systemVersion] compare:@"11.0" options:NSNumericSearch] == NSOrderedDescending
       || [[[UIDevice currentDevice] systemVersion] compare:@"11.0" options:NSNumericSearch] == NSOrderedSame) {
        callback(@[@YES]);
    } else {
        callback(@[@NO]);
    }
    
}

// CRITICAL: Export JSI availability check method
RCT_EXPORT_METHOD(checkJSIAvailability:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        RCTLogInfo(@"📱 RNPDFPdfViewManager: Checking JSI availability");
        
        // Check if PDFJSIManager is available
        PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
        
        if (jsiManager) {
            RCTLogInfo(@"✅ RNPDFPdfViewManager: JSI Manager found - JSI is AVAILABLE");
            resolve(@{
                @"available": @YES,
                @"message": @"JSI is available via PDFJSIManager",
                @"platform": @"ios"
            });
        } else {
            RCTLogWarn(@"⚠️ RNPDFPdfViewManager: JSI Manager not found - falling back to bridge mode");
            resolve(@{
                @"available": @NO,
                @"message": @"JSI not available, using bridge mode",
                @"platform": @"ios"
            });
        }
        
    } @catch (NSException *exception) {
        RCTLogError(@"❌ RNPDFPdfViewManager: Error checking JSI availability: %@", exception.reason);
        reject(@"JSI_CHECK_ERROR", exception.reason, nil);
    }
}

// Forward JSI methods to PDFJSIManager
RCT_EXPORT_METHOD(renderPageDirect:(NSString *)pdfId
                  pageNumber:(NSInteger)pageNumber
                  scale:(double)scale
                  base64Data:(NSString *)base64Data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
    if (jsiManager) {
        [jsiManager renderPageDirect:pdfId pageNumber:pageNumber scale:scale base64Data:base64Data resolver:resolve rejecter:reject];
    } else {
        reject(@"JSI_NOT_AVAILABLE", @"PDFJSIManager not available", nil);
    }
}

RCT_EXPORT_METHOD(getPageMetrics:(NSString *)pdfId
                  pageNumber:(NSInteger)pageNumber
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
    if (jsiManager) {
        [jsiManager getPageMetrics:pdfId pageNumber:pageNumber resolver:resolve rejecter:reject];
    } else {
        reject(@"JSI_NOT_AVAILABLE", @"PDFJSIManager not available", nil);
    }
}

RCT_EXPORT_METHOD(preloadPagesDirect:(NSString *)pdfId
                  startPage:(NSInteger)startPage
                  endPage:(NSInteger)endPage
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
    if (jsiManager) {
        [jsiManager preloadPagesDirect:pdfId startPage:startPage endPage:endPage resolver:resolve rejecter:reject];
    } else {
        reject(@"JSI_NOT_AVAILABLE", @"PDFJSIManager not available", nil);
    }
}

RCT_EXPORT_METHOD(getCacheMetrics:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
    if (jsiManager) {
        [jsiManager getCacheMetrics:@"default" resolver:resolve rejecter:reject];
    } else {
        reject(@"JSI_NOT_AVAILABLE", @"PDFJSIManager not available", nil);
    }
}

RCT_EXPORT_METHOD(clearCacheDirect:(NSString *)pdfId
                  cacheType:(NSString *)cacheType
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
    if (jsiManager) {
        [jsiManager clearCacheDirect:pdfId cacheType:cacheType resolver:resolve rejecter:reject];
    } else {
        reject(@"JSI_NOT_AVAILABLE", @"PDFJSIManager not available", nil);
    }
}

RCT_EXPORT_METHOD(optimizeMemory:(NSString *)pdfId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
    if (jsiManager) {
        [jsiManager optimizeMemory:pdfId resolver:resolve rejecter:reject];
    } else {
        reject(@"JSI_NOT_AVAILABLE", @"PDFJSIManager not available", nil);
    }
}

RCT_EXPORT_METHOD(searchTextDirect:(NSString *)pdfId
                  searchTerm:(NSString *)searchTerm
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
    if (jsiManager) {
        [jsiManager searchTextDirect:pdfId searchTerm:searchTerm startPage:1 endPage:999 resolver:resolve rejecter:reject];
    } else {
        reject(@"JSI_NOT_AVAILABLE", @"PDFJSIManager not available", nil);
    }
}

RCT_EXPORT_METHOD(getPerformanceMetricsDirect:(NSString *)pdfId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
    if (jsiManager) {
        [jsiManager getPerformanceMetrics:pdfId resolver:resolve rejecter:reject];
    } else {
        reject(@"JSI_NOT_AVAILABLE", @"PDFJSIManager not available", nil);
    }
}

RCT_EXPORT_METHOD(setRenderQuality:(NSString *)pdfId
                  quality:(NSInteger)quality
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
    if (jsiManager) {
        [jsiManager setRenderQuality:pdfId quality:quality resolver:resolve rejecter:reject];
    } else {
        reject(@"JSI_NOT_AVAILABLE", @"PDFJSIManager not available", nil);
    }
}

RCT_EXPORT_METHOD(getJSIStats:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
        
        NSDictionary *stats = @{
            @"jsiAvailable": jsiManager ? @YES : @NO,
            @"platform": @"ios",
            @"version": @"2.2.5",
            @"message": jsiManager ? @"JSI stats available" : @"JSI not available"
        };
        
        resolve(stats);
        
    } @catch (NSException *exception) {
        reject(@"JSI_STATS_ERROR", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(check16KBSupport:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    PDFJSIManager *jsiManager = [self.bridge moduleForClass:[PDFJSIManager class]];
    if (jsiManager) {
        [jsiManager check16KBSupport:resolve rejecter:reject];
    } else {
        // Fallback response for iOS
        resolve(@{
            @"supported": @YES,
            @"platform": @"ios",
            @"message": @"iOS is compatible with 16KB page size requirements",
            @"googlePlayCompliant": @YES,
            @"iosCompatible": @YES
        });
    }
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}


- (void)dealloc{
}

@end
