#import "PDFTextExtractor.h"
#import <PDFKit/PDFKit.h>

@implementation PDFTextExtractor {
    LicenseVerifier *_licenseVerifier;
}

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        _licenseVerifier = [[LicenseVerifier alloc] init];
    }
    return self;
}

//
RCT_EXPORT_METHOD(isTextExtractionAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL available = [PDFDocument class] != nil;
    resolve(@(available));
}

//
RCT_EXPORT_METHOD(extractAllText:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    
    if (![_licenseVerifier isProActive]) {
        reject(@"LICENSE_REQUIRED", @"Native Text Extraction requires a Pro license", nil);
        return;
    }
    
    if (!filePath || filePath.length == 0) {
        reject(@"INVALID_PATH", @"File path is required", nil);
        return;
    }
    
    NSURL *pdfURL = [NSURL fileURLWithPath:filePath];
    if (![[NSFileManager defaultManager] fileExistsAtPath:filePath]) {
        reject(@"FILE_NOT_FOUND", [NSString stringWithFormat:@"PDF file not found: %@", filePath], nil);
        return;
    }
    
    
    NSDictionary *textMap = [self extractTextFromPages:pdfURL pageNumbers:nil];
    resolve(textMap);
}

//
RCT_EXPORT_METHOD(extractTextFromPages:(NSString *)filePath
                  pageNumbers:(NSArray *)pageNumbers
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    
    if (![_licenseVerifier isProActive]) {
        reject(@"LICENSE_REQUIRED", @"Native Text Extraction requires a Pro license", nil);
        return;
    }
    
    if (!filePath || filePath.length == 0) {
        reject(@"INVALID_PATH", @"File path is required", nil);
        return;
    }
    
    NSURL *pdfURL = [NSURL fileURLWithPath:filePath];
    if (![[NSFileManager defaultManager] fileExistsAtPath:filePath]) {
        reject(@"FILE_NOT_FOUND", [NSString stringWithFormat:@"PDF file not found: %@", filePath], nil);
        return;
    }
    
    
    NSDictionary *textMap = [self extractTextFromPages:pdfURL pageNumbers:pageNumbers];
    resolve(textMap);
}

//
- (NSDictionary *)extractTextFromPages:(NSURL *)pdfURL pageNumbers:(NSArray *)pageNumbers {
    NSMutableDictionary *textMap = [NSMutableDictionary dictionary];
    
    PDFDocument *pdfDocument = [[PDFDocument alloc] initWithURL:pdfURL];
    if (!pdfDocument) {
        NSLog(@"❌ Failed to load PDF document");
        return textMap;
    }
    
    NSUInteger pageCount = pdfDocument.pageCount;
    NSLog(@"📄 PDF has %lu pages", (unsigned long)pageCount);
    
    
    if (pageNumbers && pageNumbers.count > 0) {
        
        for (NSNumber *pageNum in pageNumbers) {
            int pageIndex = pageNum.intValue;
            if (pageIndex >= 0 && pageIndex < pageCount) {
                NSString *text = [self extractTextFromPage:pdfDocument pageIndex:pageIndex];
                textMap[[NSString stringWithFormat:@"%d", pageIndex]] = text;
            }
        }
    } else {
        
        for (int i = 0; i < pageCount; i++) {
            NSString *text = [self extractTextFromPage:pdfDocument pageIndex:i];
            textMap[[NSString stringWithFormat:@"%d", i]] = text;
        }
    }
    
    return textMap;
}

//
- (NSString *)extractTextFromPage:(PDFDocument *)pdfDocument pageIndex:(int)pageIndex {
    PDFPage *page = [pdfDocument pageAtIndex:pageIndex];
    if (!page) {
        return @"";
    }
    
    
    NSString *text = [page string];
    
    if (text) {
        
        text = [text stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
        NSLog(@"📝 Extracted text from page %d: %lu characters", pageIndex + 1, (unsigned long)text.length);
    } else {
        text = @"";
        NSLog(@"⚠️ No text found on page %d", pageIndex + 1);
    }
    
    return text;
}

//
RCT_EXPORT_METHOD(getPageCount:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (!filePath || filePath.length == 0) {
        reject(@"INVALID_PATH", @"File path is required", nil);
        return;
    }
    
    NSURL *pdfURL = [NSURL fileURLWithPath:filePath];
    PDFDocument *pdfDocument = [[PDFDocument alloc] initWithURL:pdfURL];
    
    if (!pdfDocument) {
        reject(@"FILE_NOT_FOUND", @"PDF file not found", nil);
        return;
    }
    
    NSUInteger pageCount = pdfDocument.pageCount;
    resolve(@(pageCount));
}

@end