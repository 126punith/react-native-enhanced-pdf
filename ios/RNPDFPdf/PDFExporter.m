#import "PDFExporter.h"
#import <PDFKit/PDFKit.h>
#import <UIKit/UIKit.h>

@implementation PDFExporter {
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
RCT_EXPORT_METHOD(exportToImages:(NSString *)filePath
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    
    if (![_licenseVerifier isProActive]) {
        reject(@"LICENSE_REQUIRED", @"Export to Images requires a Pro license", nil);
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
    
    
    NSArray *pages = options[@"pages"];
    NSNumber *dpi = options[@"dpi"] ?: @150;
    NSString *format = options[@"format"] ?: @"png";
    NSString *outputDir = options[@"outputDir"];
    
    
    NSArray *exportedFiles = [self exportPagesToImages:pdfURL pages:pages dpi:dpi.intValue format:format outputDir:outputDir];
    
    resolve(exportedFiles);
}

/**
 * Export specific pages to images
 */
- (NSArray *)exportPagesToImages:(NSURL *)pdfURL pages:(NSArray *)pages dpi:(int)dpi format:(NSString *)format outputDir:(NSString *)outputDir {
    NSMutableArray *exportedFiles = [NSMutableArray array];
    
    PDFDocument *pdfDocument = [[PDFDocument alloc] initWithURL:pdfURL];
    if (!pdfDocument) {
        NSLog(@"❌ Failed to load PDF document");
        return exportedFiles;
    }
    
    NSUInteger pageCount = pdfDocument.pageCount;
    NSLog(@"📄 PDF has %lu pages", (unsigned long)pageCount);
    
    // Determine which pages to export
    NSMutableArray *pagesToExport = [NSMutableArray array];
    if (pages && pages.count > 0) {
        for (NSNumber *pageNum in pages) {
            int pageIndex = pageNum.intValue;
            if (pageIndex >= 0 && pageIndex < pageCount) {
                [pagesToExport addObject:@(pageIndex)];
            }
        }
    } else {
        // Export all pages
        for (int i = 0; i < pageCount; i++) {
            [pagesToExport addObject:@(i)];
        }
    }
    
    // Export each page
    for (NSNumber *pageNum in pagesToExport) {
        int pageIndex = pageNum.intValue;
        PDFPage *page = [pdfDocument pageAtIndex:pageIndex];
        
        if (page) {
            // Calculate dimensions
            CGRect pageRect = [page boundsForBox:kPDFDisplayBoxMediaBox];
            float scale = dpi / 72.0f; // 72 DPI is default
            CGSize imageSize = CGSizeMake(pageRect.size.width * scale, pageRect.size.height * scale);
            
            // Create image context
            UIGraphicsBeginImageContextWithOptions(imageSize, NO, 0.0);
            CGContextRef context = UIGraphicsGetCurrentContext();
            
            // Fill background with white
            CGContextSetFillColorWithColor(context, [UIColor whiteColor].CGColor);
            CGContextFillRect(context, CGRectMake(0, 0, imageSize.width, imageSize.height));
            
            // Scale context
            CGContextScaleCTM(context, scale, scale);
            
            // Render page
            [page drawWithBox:kPDFDisplayBoxMediaBox toContext:context];
            
            // Get image
            UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
            UIGraphicsEndImageContext();
            
            // Save image
            NSString *fileName = [NSString stringWithFormat:@"page_%d.%@", pageIndex + 1, format];
            NSString *outputPath = [self saveImage:image fileName:fileName outputDir:outputDir];
            if (outputPath) {
                [exportedFiles addObject:outputPath];
                NSLog(@"✅ Exported page %d to %@", pageIndex + 1, outputPath);
            }
        }
    }
    
    return exportedFiles;
}

/**
 * Save image to file
 */
- (NSString *)saveImage:(UIImage *)image fileName:(NSString *)fileName outputDir:(NSString *)outputDir {
    NSURL *outputURL;
    
    if (outputDir && outputDir.length > 0) {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        if (![fileManager fileExistsAtPath:outputDir]) {
            [fileManager createDirectoryAtPath:outputDir withIntermediateDirectories:YES attributes:nil error:nil];
        }
        outputURL = [NSURL fileURLWithPath:[outputDir stringByAppendingPathComponent:fileName]];
    } else {
        // Save to app's documents directory
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        NSString *documentsDirectory = [paths objectAtIndex:0];
        outputURL = [NSURL fileURLWithPath:[documentsDirectory stringByAppendingPathComponent:fileName]];
    }
    
    // Convert image to data
    NSData *imageData;
    if ([fileName.lowercaseString hasSuffix:@".png"]) {
        imageData = UIImagePNGRepresentation(image);
    } else if ([fileName.lowercaseString hasSuffix:@".jpg"] || [fileName.lowercaseString hasSuffix:@".jpeg"]) {
        imageData = UIImageJPEGRepresentation(image, 0.9);
    } else {
        imageData = UIImagePNGRepresentation(image);
    }
    
    // Save to file
    NSError *error;
    BOOL success = [imageData writeToURL:outputURL options:NSDataWritingAtomic error:&error];
    
    if (success) {
        return outputURL.path;
    } else {
        NSLog(@"❌ Error saving image: %@", error.localizedDescription);
        return nil;
    }
}

/**
 * Merge multiple PDFs
 * PRO FEATURE: Requires Pro license
 */
RCT_EXPORT_METHOD(mergePDFs:(NSArray *)filePaths
                  outputPath:(NSString *)outputPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    // Check Pro license
    if (![_licenseVerifier isProActive]) {
        reject(@"LICENSE_REQUIRED", @"PDF Operations requires a Pro license", nil);
        return;
    }
    
    if (!filePaths || filePaths.count < 2) {
        reject(@"INVALID_INPUT", @"At least 2 PDF files are required for merging", nil);
        return;
    }
    
    // Create merged PDF
    PDFDocument *mergedPDF = [[PDFDocument alloc] init];
    
    for (NSString *filePath in filePaths) {
        NSURL *pdfURL = [NSURL fileURLWithPath:filePath];
        PDFDocument *pdfDoc = [[PDFDocument alloc] initWithURL:pdfURL];
        
        if (pdfDoc) {
            NSUInteger pageCount = pdfDoc.pageCount;
            for (int i = 0; i < pageCount; i++) {
                PDFPage *page = [pdfDoc pageAtIndex:i];
                if (page) {
                    [mergedPDF insertPage:page atIndex:mergedPDF.pageCount];
                }
            }
        }
    }
    
    // Save merged PDF
    NSURL *outputURL = [NSURL fileURLWithPath:outputPath];
    BOOL success = [mergedPDF writeToURL:outputURL];
    
    if (success) {
        resolve(outputPath);
    } else {
        reject(@"MERGE_ERROR", @"Failed to save merged PDF", nil);
    }
}

/**
 * Split PDF into multiple files
 * PRO FEATURE: Requires Pro license
 */
RCT_EXPORT_METHOD(splitPDF:(NSString *)filePath
                  pageRanges:(NSArray *)pageRanges
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    // Check Pro license
    if (![_licenseVerifier isProActive]) {
        reject(@"LICENSE_REQUIRED", @"PDF Operations requires a Pro license", nil);
        return;
    }
    
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
    
    NSMutableArray *splitFiles = [NSMutableArray array];
    NSUInteger pageCount = pdfDocument.pageCount;
    
    for (NSDictionary *range in pageRanges) {
        NSNumber *startPage = range[@"start"];
        NSNumber *endPage = range[@"end"];
        
        if (startPage && endPage) {
            int start = startPage.intValue;
            int end = endPage.intValue;
            
            if (start >= 0 && end < pageCount && start <= end) {
                PDFDocument *splitPDF = [[PDFDocument alloc] init];
                
                for (int i = start; i <= end; i++) {
                    PDFPage *page = [pdfDocument pageAtIndex:i];
                    if (page) {
                        [splitPDF insertPage:page atIndex:splitPDF.pageCount];
                    }
                }
                
                // Save split PDF
                NSString *fileName = [NSString stringWithFormat:@"split_%d_%d.pdf", start + 1, end + 1];
                NSString *outputPath = [NSTemporaryDirectory() stringByAppendingPathComponent:fileName];
                NSURL *outputURL = [NSURL fileURLWithPath:outputPath];
                
                BOOL success = [splitPDF writeToURL:outputURL];
                if (success) {
                    [splitFiles addObject:outputPath];
                }
            }
        }
    }
    
    resolve(splitFiles);
}

/**
 * Extract specific pages from PDF
 * PRO FEATURE: Requires Pro license
 */
RCT_EXPORT_METHOD(extractPages:(NSString *)filePath
                  pageNumbers:(NSArray *)pageNumbers
                  outputPath:(NSString *)outputPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    // Check Pro license
    if (![_licenseVerifier isProActive]) {
        reject(@"LICENSE_REQUIRED", @"PDF Operations requires a Pro license", nil);
        return;
    }
    
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
    
    // Create extracted PDF
    PDFDocument *extractedPDF = [[PDFDocument alloc] init];
    
    for (NSNumber *pageNum in pageNumbers) {
        int pageIndex = pageNum.intValue;
        if (pageIndex >= 0 && pageIndex < pdfDocument.pageCount) {
            PDFPage *page = [pdfDocument pageAtIndex:pageIndex];
            if (page) {
                [extractedPDF insertPage:page atIndex:extractedPDF.pageCount];
            }
        }
    }
    
    // Save extracted PDF
    NSURL *outputURL = [NSURL fileURLWithPath:outputPath];
    BOOL success = [extractedPDF writeToURL:outputURL];
    
    if (success) {
        resolve(outputPath);
    } else {
        reject(@"EXTRACT_ERROR", @"Failed to save extracted PDF", nil);
    }
}

/**
 * Rotate a page in PDF
 * PRO FEATURE: Requires Pro license
 */
RCT_EXPORT_METHOD(rotatePage:(NSString *)filePath
                  pageNumber:(int)pageNumber
                  degrees:(int)degrees
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    // Check Pro license
    if (![_licenseVerifier isProActive]) {
        reject(@"LICENSE_REQUIRED", @"PDF Operations requires a Pro license", nil);
        return;
    }
    
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
    
    if (pageNumber < 0 || pageNumber >= pdfDocument.pageCount) {
        reject(@"INVALID_PAGE", @"Invalid page number", nil);
        return;
    }
    
    PDFPage *page = [pdfDocument pageAtIndex:pageNumber];
    if (page) {
        // Rotate page
        int currentRotation = page.rotation;
        int newRotation = (currentRotation + degrees) % 360;
        page.rotation = newRotation;
        
        // Save PDF
        BOOL success = [pdfDocument writeToURL:pdfURL];
        
        if (success) {
            resolve(@YES);
        } else {
            reject(@"ROTATE_ERROR", @"Failed to save rotated PDF", nil);
        }
    } else {
        reject(@"PAGE_NOT_FOUND", @"Page not found", nil);
    }
}

/**
 * Delete a page from PDF
 * PRO FEATURE: Requires Pro license
 */
RCT_EXPORT_METHOD(deletePage:(NSString *)filePath
                  pageNumber:(int)pageNumber
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    // Check Pro license
    if (![_licenseVerifier isProActive]) {
        reject(@"LICENSE_REQUIRED", @"PDF Operations requires a Pro license", nil);
        return;
    }
    
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
    
    if (pageNumber < 0 || pageNumber >= pdfDocument.pageCount) {
        reject(@"INVALID_PAGE", @"Invalid page number", nil);
        return;
    }
    
    // Delete page
    [pdfDocument removePageAtIndex:pageNumber];
    
    // Save PDF
    BOOL success = [pdfDocument writeToURL:pdfURL];
    
    if (success) {
        resolve(@YES);
    } else {
        reject(@"DELETE_ERROR", @"Failed to save PDF after page deletion", nil);
    }
}

/**
 * Get PDF page count
 */
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
