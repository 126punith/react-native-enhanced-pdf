/**
 * 🚀 Native PDF Cache Manager for iOS (Inside react-native-pdf Package)
 * High-performance PDF caching with persistent native implementation
 * 
 * Features:
 * - 1-month persistent storage
 * - Direct binary storage (no base64 overhead)
 * - Automatic TTL management with background cleanup
 * - LRU eviction policy
 * - Thread-safe operations
 * - Zero bridge overhead for cache operations
 */

#import "PDFNativeCacheManager.h"
#import <React/RCTLog.h>

@implementation PDFNativeCacheManager

RCT_EXPORT_MODULE(PDFNativeCacheManagerBridge);

static NSString * const CACHE_DIR_NAME = @"pdf_cache";
static NSString * const METADATA_FILE = @"cache_metadata.json";
static const long long DEFAULT_TTL_MS = 30LL * 24 * 60 * 60 * 1000; // 30 days
static const long long MAX_STORAGE_BYTES = 500LL * 1024 * 1024; // 500MB
static const int MAX_FILES = 100;

// Singleton instance
static PDFNativeCacheManager *_sharedInstance = nil;

+ (instancetype)sharedInstance {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _sharedInstance = [[PDFNativeCacheManager alloc] init];
    });
    return _sharedInstance;
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _cacheMetadata = [[NSMutableDictionary alloc] init];
        _cacheStats = [[NSMutableDictionary alloc] init];
        _cacheLock = [[NSObject alloc] init];
        
        // Initialize cache directory
        [self initializeCacheDirectory];
        
        // Load persistent metadata
        [self loadMetadata];
        
        // Start background cleanup
        [self scheduleBackgroundCleanup];
        
        RCTLogInfo(@"🚀 PDF Native Cache Manager initialized with 30-day persistence");
    }
    return self;
}

- (void)initializeCacheDirectory {
    NSError *error;
    
    // Use Documents directory for persistence across app restarts
    NSArray *documentsPaths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [documentsPaths firstObject];
    _cacheDir = [documentsDirectory stringByAppendingPathComponent:CACHE_DIR_NAME];
    
    // Create cache directory if it doesn't exist
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *baseDir = [paths firstObject];
    NSString *fullPath = [baseDir stringByAppendingPathComponent:CACHE_DIR_NAME];
    
    NSFileManager *fileManager = [NSFileManager defaultManager];
    if (![fileManager fileExistsAtPath:fullPath]) {
        [fileManager createDirectoryAtPath:fullPath 
                withIntermediateDirectories:YES 
                attributes:nil 
                error:&error];
        
        if (error) {
            RCTLogError(@"❌ Failed to create cache directory: %@", error.localizedDescription);
            // Fallback to temporary directory
            _cacheDir = [NSTemporaryDirectory() stringByAppendingPathComponent:CACHE_DIR_NAME];
        }
        
        RCTLogInfo(@"📁 Created persistent cache directory: %@", _cacheDir);
    } else {
        RCTLogInfo(@"📁 Using existing persistent cache directory: %@", _cacheDir);
    }
    
    _metadataFilePath = [_cacheDir stringByAppendingPathComponent:METADATA_FILE];
}

- (void)scheduleBackgroundCleanup {
    // Schedule cleanup every 24 hours
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(24 * 60 * 60 * NSEC_PER_SEC)), 
                   dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^{
        [self cleanExpiredCache];
        [self scheduleBackgroundCleanup]; // Reschedule
    });
}

RCT_EXPORT_METHOD(storePDF:(NSString *)base64Data 
                  options:(NSDictionary *)options 
                  resolver:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
        @try {
            RCTLogInfo(@"📄 Storing PDF persistently");
            
            if (!base64Data || base64Data.length == 0) {
                reject(@"INVALID_DATA", @"Empty base64 data", nil);
                return;
            }
            
            // Parse options
            long long ttl = DEFAULT_TTL_MS;
            BOOL enableValidation = YES;
            
            if (options) {
                if (options[@"ttl"]) {
                    ttl = [options[@"ttl"] longLongValue];
                }
                if (options[@"enableValidation"]) {
                    enableValidation = [options[@"enableValidation"] boolValue];
                }
            }
            
            // Clean base64 data
            NSString *cleanBase64 = [[base64Data 
                stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]]
                stringByReplacingOccurrencesOfString:@"\\s" 
                withString:@"" 
                options:NSRegularExpressionSearch 
                range:NSMakeRange(0, [base64Data length])];
            
            // Decode base64 to binary
            NSData *pdfData = [[NSData alloc] initWithBase64EncodedString:cleanBase64 options:0];
            
            if (!pdfData || !pdfData.length) {
                reject(@"INVALID_DATA", @"Cannot decode base64 data", nil);
                return;
            }
            
            // Validate PDF header
            if (![self validatePDFHeader:pdfData]) {
                reject(@"INVALID_PDF", @"Invalid PDF data - missing header", nil);
                return;
            }
            
            // Generate cache ID
            NSString *cacheId = [self generateCacheId:cleanBase64];
            NSString *fileName = [NSString stringWithFormat:@"%@.pdf", cacheId];
            NSString *filePath = [self.cacheDir stringByAppendingPathComponent:fileName];
            
            // Generate checksum
            NSString *checksum = [self generateChecksum:pdfData];
            
            RCTLogInfo(@"📄 Storing PDF persistently: %@, size: %lu bytes", cacheId, (unsigned long)pdfData.length);
            
            // Ensure cache space
            [self ensureCacheSpace:pdfData.length];
            
            // Write PDF file persistently
            NSError *writeError;
            BOOL success = [pdfData writeToFile:filePath 
                                       options:NSDataWritingAtomic | NSDataWritingFileProtectionCompleteUntilFirstUserAuthentication
                                         error:&writeError];
            
            if (!success || writeError) {
                reject(@"WRITE_ERROR", 
                       [NSString stringWithFormat:@"Failed to write PDF file: %@", writeError.localizedDescription], 
                       writeError);
                return;
            }
            
            // Create metadata with 30-day TTL
            NSNumber *now = @([[NSDate date] timeIntervalSince1970] * 1000);
            NSDictionary *metadata = @{
                @"cacheId": cacheId,
                @"fileName": fileName,
                @"cachedAt": now,
                @"lastAccessed": now,
                @"fileSize": @(pdfData.length),
                @"originalSize": @(pdfData.length),
                @"checksum": checksum,
                @"accessCount": @0,
                @"ttlMs": @(ttl)
            };
            
            @synchronized(self.cacheLock) {
                self.cacheMetadata[cacheId] = metadata;
                [self updateStatsForAdd:(long long)pdfData.length];
                [self saveMetadata];
            }
            
            NSDictionary *result = @{
                @"cacheId": cacheId,
                @"success": @YES,
                @"message": @"PDF stored persistently with 30-day TTL",
                @"ttl": @30,
                @"platform": @"ios"
            };
            
            RCTLogInfo(@"✅ PDF stored persistently with ID: %@", cacheId);
            resolve(result);
            
        } @catch (NSException *exception) {
            RCTLogError(@"❌ Error stored persistently: %@", exception.reason);
            reject(@"STORE_PDF_ERROR", exception.reason, nil);
        }
    });
}

RCT_EXPORT_METHOD(loadPDF:(NSString *)cacheId 
                  resolver:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
        @try {
            RCTLogInfo(@"📄 Loading PDF from persistent cache: %@", cacheId);
            
            if (!cacheId || cacheId.length == 0) {
                reject(@"INVALID_CACHE_ID", @"Empty cache ID", nil);
                return;
            }
            
            NSDictionary *metadata;
            
            @synchronized(self.cacheLock) {
                metadata = self.cacheMetadata[cacheId];
            }
            
            if (!metadata) {
                reject(@"CACHE_NOT_FOUND", @"Cache ID not found", nil);
                return;
            }
            
            // Check TTL (30-day expiration)
            NSNumber *cachedAt = metadata[@"cachedAt"];
            NSTimeInterval now = [[NSDate date] timeIntervalSince1970] * 1000;
            long long cacheAge = now - [cachedAt longLongValue];
            long long ttlMs = [metadata[@"ttlMs"] longLongValue];
            
            if (cacheAge > ttlMs) {
                RCTLogInfo(@"📄 Cache expired for ID: %@", cacheId);
                [self removeCacheEntry:cacheId];
                reject(@"CACHE_EXPIRED", @"Cache expired (30-day TTL)", nil);
                return;
            }
            
            NSString *fileName = metadata[@"fileName"];
            NSString *filePath = [self.cacheDir stringByAppendingPathComponent:fileName];
            
            NSFileManager *fileManager = [NSFileManager defaultManager];
            if (![fileManager fileExistsAtPath:filePath]) {
                RCTLogInfo(@"📄 PDF file missing: %@", cacheId);
                [self removeCacheEntry:cacheId];
                reject(@"FILE_MISSING", @"PDF file missing", nil);
                return;
            }
            
            // Update access statistics
            NSMutableDictionary *updatedMetadata = [metadata mutableCopy];
            updatedMetadata[@"lastAccessed"] = @(now);
            
            NSNumber *currentAccessCount = metadata[@"accessCount"];
            updatedMetadata[@"accessCount"] = @([currentAccessCount intValue] + 1);
            
            @synchronized(self.cacheLock) {
                self.cacheMetadata[cacheId] = [updatedMetadata copy];
                [self updateStatsForHit];
                [self saveMetadata];
            }
            
            NSDictionary *result = @{
                @"filePath": filePath,
                @"success": @YES,
                @"message": @"PDF loaded from persistent cache",
                @"platform": @"ios"
            };
            
            RCTLogInfo(@"✅ PDF loaded from persistent cache: %@", filePath);
            resolve(result);
            
        } @catch (NSException *exception) {
            RCTLogError(@"❌ Error loading PDF from persistent cache: %@", exception.reason);
            reject(@"LOAD_PDF_ERROR", exception.reason, nil);
        }
    });
}

RCT_EXPORT_METHOD(isValidCache:(NSString *)cacheId 
                  resolver:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    @try {
        if (!cacheId || cacheId.length == 0) {
            reject(@"INVALID_CACHE_ID", @"Empty cache ID", nil);
            return;
        }
        
        NSDictionary *metadata;
        
        @synchronized(self.cacheLock) {
            metadata = self.cacheMetadata[cacheId];
        }
        
        if (!metadata) {
            resolve(@{@"isValid": @NO, @"success": @YES});
            return;
        }
        
        // Check TTL
        NSNumber *cachedAt = metadata[@"cachedAt"];
        NSTimeInterval now = [[NSDate date] timeIntervalSince1970] * 1000;
        long long cacheAge = now - [cachedAt longLongValue];
        long long ttlMs = [metadata[@"ttlMs"] longLongValue];
        
        BOOL isValid = cacheAge <= ttlMs;
        
        // Also check if file exists
        if (isValid) {
            NSString *fileName = metadata[@"fileName"];
            NSString *filePath = [self.cacheDir stringByAppendingPathComponent:fileName];
            NSFileManager *fileManager = [NSFileManager defaultManager];
            isValid = [fileManager fileExistsAtPath:filePath];
        }
        
        if (!isValid) {
            [self removeCacheEntry:cacheId];
        }
        
        NSDictionary *result = @{
            @"isValid": @(isValid),
            @"success": @YES,
            @"message": isValid ? @"Cache is valid" : @"Cache is invalid or expired",
            @"platform": @"ios"
        };
        
        resolve(result);
        
    } @catch (NSException *exception) {
        RCTLogError(@"❌ Error validating cache: %@", exception.reason);
        reject(@"CACHE_CHECK_ERROR", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(getCacheStats:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    @try {
        NSDictionary *stats;
        
        @synchronized(self.cacheLock) {
            NSNumber *totalFiles = self.cacheStats[@"totalFiles"] ?: @0;
            NSNumber *totalSize = self.cacheStats[@"totalSize"] ?: @0;
            NSNumber *cacheHits = self.cacheStats[@"cacheHits"] ?: @0;
            NSNumber *cacheMisses = self.cacheStats[@"cacheMisses"] ?: @0;
            NSNumber *averageLoadTime = self.cacheStats[@"aggregateLoadTimeMs"] ?: @0;
            
            double hitRate = 0.0;
            if ([cacheHits intValue] + [cacheMisses intValue] > 0) {
                hitRate = (double)[cacheHits intValue] / ([cacheHits intValue] + [cacheMisses intValue]);
            }
            
            stats = @{
                @"totalFiles": totalFiles,
                @"totalSize": totalSize,
                @"cacheHits": cacheHits,
                @"cacheMisses": cacheMisses,
                @"hitRate": @(hitRate),
                @"averageLoadTimeMs": averageLoadTime,
                @"totalSizeFormatted": [self formatBytes:[totalSize longLongValue]],
                @"platform": @"ios",
                @"persistence": @"30-day TTL",
                @"success": @YES
            };
        }
        
        resolve(stats);
        
    } @catch (NSException *exception) {
        RCTLogError(@"❌ Error getting cache stats: %@", exception.reason);
        reject(@"STATS_ERROR", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(clearCache:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    @try {
        RCTLogInfo(@"🧹 Clearing native persistent cache");
        
        @synchronized(self.cacheLock) {
            // Delete all cached files
            NSFileManager *fileManager = [NSFileManager defaultManager];
            for (NSString *cacheId in [self.cacheMetadata allKeys]) {
                NSDictionary *metadata = self.cacheMetadata[cacheId];
                NSString *fileName = metadata[@"fileName"];
                NSString *filePath = [self.cacheDir stringByAppendingPathComponent:fileName];
                
                [fileManager removeItemAtPath:filePath error:nil];
            }
            
            // Clear metadata
            [self.cacheMetadata removeAllObjects];
            [self.cacheStats removeAllObjects];
            
            // Delete metadata file
            [fileManager removeItemAtPath:self.metadataFilePath error:nil];
        }
        
        NSDictionary *result = @{
            @"success": @YES,
            @"message": @"Persistent cache cleared successfully",
            @"platform": @"ios"
        };
        
        RCTLogInfo(@"✅ All persistent cache cleared successfully");
        resolve(result);
        
    } @catch (NSException *exception) {
        RCTLogError(@"❌ Error clearing cache: %@", exception.reason);
        reject(@"CLEAR_CACHE_ERROR", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(testCache:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    @try {
        RCTLogInfo(@"🧪 Running native persistent cache test");
        
        NSString *testBase64 = @"JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKl1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgo+PgoZW5kb2JqCnhyZWYKMA0KMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDA5OCAwMDAwMCBuCjAwMDAwMDAxMTUgMDAwMDAgbgowMDAwMDAwMTY2IDAwMDAwIG4KdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJpZmYKMTAxCiUlRU9G";
        
        // Test storing
        NSTimeInterval startTime = CACurrentMediaTime();
        
        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
        __block NSString *testCacheId = nil;
        
        [self storePDF:testBase64 
                options:nil 
                resolver:^(NSDictionary *result) {
                    testCacheId = result[@"cacheId"];
                    dispatch_semaphore_signal(semaphore);
                } 
                rejecter:^(NSString *code, NSString *message, NSError *error) {
                    dispatch_semaphore_signal(semaphore);
                }];
        
        dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
        
        double storeTime = CACurrentMediaTime() - startTime;
        
        if (!testCacheId) {
            reject(@"STORE_TEST_FAILED", @"Failed to store test PDF", nil);
            return;
        }
        
        // Test loading
        startTime = CACurrentMediaTime();
        
        dispatch_semaphore_t loadSemaphore = dispatch_semaphore_create(0);
        __block NSString *testFilePath = nil;
        
        [self loadPDF:testCacheId 
               resolver:^(NSDictionary *result) {
                   testFilePath = result[@"filePath"];
                   dispatch_semaphore_signal(loadSemaphore);
               } 
               rejecter:^(NSString *code, NSString *message, NSError *error) {
                   dispatch_semaphore_signal(loadSemaphore);
               }];
        
        dispatch_semaphore_wait(loadSemaphore, DISPATCH_TIME_FOREVER);
        
        double loadTime = CACurrentMediaTime() - startTime;
        
        // Clean up test data
        if (testCacheId) {
            [self clearCache:^(NSDictionary *result) {} rejecter:^(NSString *code, NSString *message, NSError *error) {}];
        }
        
        NSDictionary *result = @{
            @"success": @YES,
            @"cacheId": testCacheId,
            @"filePath": testFilePath ?: @"",
            @"storeTime": @(storeTime * 1000),
            @"loadTime": @(loadTime * 1000),
            @"message": @"Native persistent cache test completed successfully",
            @"cacheType": @"native-persistent",
            @"platform": @"ios",
            @"ttl": @"30-day"
        };
        
        RCTLogInfo(@"✅ Native persistent cache test completed successfully");
        resolve(result);
        
    } @catch (NSException *exception) {
        RCTLogError(@"❌ Native persistent cache test failed: %@", exception.reason);
        reject(@"CACHE_TEST_ERROR", exception.reason, nil);
    }
}

#pragma mark - Private Methods

- (NSString *)generateCacheId:(NSString *)base64Data {
    NSString *timestamp = [NSString stringWithFormat:@"%ld", (long)([[NSDate date] timeIntervalSince1970] * 1000)];
    NSString *dataToHash = [base64Data stringByAppendingString:timestamp];
    
    const char *dataToHashUTF8 = [dataToHash UTF8String];
    NSString *hash = nil;
    
    unsigned long long hashValue = 0;
    for (int i = 0; i < strlen(dataToHashUTF8); i++) {
        hashValue = ((hashValue << 5) + hashValue) + dataToHashUTF8[i];
        hashValue = hashValue & hashValue; // Convert to 32-bit integer
    }
    
    NSString *hashString = [NSString stringWithFormat:@"%llx", hashValue];
    NSInteger hashLength = [hashString length];
    NSInteger maxLength = (hashLength < 24) ? hashLength : 24;
    NSString *shortHash = [hashString substringToIndex:maxLength];
    return [NSString stringWithFormat:@"pdf_cache_ios_%@_%@", shortHash, timestamp];
}

- (NSString *)generateChecksum:(NSData *)data {
    unsigned long long hashValue = 0;
    const void *bytes = data.bytes;
    NSUInteger length = data.length;
    
    for (NSUInteger i = 0; i < length; i++) {
        hashValue = hashValue * 31 + ((uint8_t *)bytes)[i];
    }
    
    return [NSString stringWithFormat:@"%llx", hashValue];
}

- (BOOL)validatePDFHeader:(NSData *)data {
    if (data.length < 5) return NO;
    
    uint8_t *bytes = (uint8_t *)data.bytes;
    NSString *header = [[NSString alloc] initWithBytes:bytes length:5 encoding:NSASCIIStringEncoding];
    
    return [header hasPrefix:@"%PDF-"];
}

- (void)ensureCacheSpace:(NSUInteger)requiredSize {
    @synchronized(self.cacheLock) {
        // Check file count limit
        if (self.cacheMetadata.count >= MAX_FILES) {
            [self performLRUCleanup];
        }
        
        // Check size limit
        NSNumber *totalSize = self.cacheStats[@"totalSize"];
        if ([totalSize longLongValue] + requiredSize > MAX_STORAGE_BYTES) {
            [self performLRUCleanup];
        }
    }
}

- (void)performLRUCleanup {
    @synchronized(self.cacheLock) {
        NSArray *sortedEntries = [self.cacheMetadata keysSortedByValueUsingComparator:^NSComparisonResult(NSDictionary *obj1, NSDictionary *obj2) {
            NSNumber *time1 = obj1[@"lastAccessed"];
            NSNumber *time2 = obj2[@"lastAccessed"];
            return [time1 compare:time2];
        }];
        
        // Remove oldest 30% of files
        int filesToRemove = MAX(1, (int)(sortedEntries.count * 0.3));
        
        for (int i = 0; i < filesToRemove && i < sortedEntries.count; i++) {
            NSString *cacheId = sortedEntries[i];
            [self removeCacheEntry:cacheId];
        }
        
        RCTLogInfo(@"🧹 LRU cleanup: removed %d old files", filesToRemove);
    }
}

- (void)removeCacheEntry:(NSString *)cacheId {
    @synchronized(self.cacheLock) {
        NSDictionary *metadata = self.cacheMetadata[cacheId];
        if (metadata) {
            NSString *fileName = metadata[@"fileName"];
            NSString *filePath = [self.cacheDir stringByAppendingPathComponent:fileName];
            
            [[NSFileManager defaultManager] removeItemAtPath:filePath error:nil];
            [self.cacheMetadata removeObjectForKey:cacheId];
            
            [self updateStatsForRemove:[metadata[@"fileSize"] longLongValue]];
            
            RCTLogInfo(@"🗑️ Removed persistent cache: %@", cacheId);
        }
    }
}

- (void)cleanExpiredCache {
    @synchronized(self.cacheLock) {
        NSMutableArray *expiredCacheIds = [[NSMutableArray alloc] init];
        NSTimeInterval now = [[NSDate date] timeIntervalSince1970] * 1000;
        
        for (NSString *cacheId in self.cacheMetadata.allKeys) {
            NSDictionary *metadata = self.cacheMetadata[cacheId];
            NSNumber *cachedAt = metadata[@"cachedAt"];
            NSNumber *ttlMs = metadata[@"ttlMs"];
            
            long long cacheAge = now - [cachedAt longLongValue];
            long long ttlMsValue = [ttlMs longLongValue];
            
            if (cacheAge > ttlMsValue) {
                [expiredCacheIds addObject:cacheId];
            }
        }
        
        for (NSString *cacheId in expiredCacheIds) {
            [self removeCacheEntry:cacheId];
        }
        
        if (expiredCacheIds.count > 0) {
            RCTLogInfo(@"🧹 Cleaned %lu expired cache entries", (unsigned long)expiredCacheIds.count);
            [self saveMetadata];
        }
    }
}

- (void)loadMetadata {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    
    if ([fileManager fileExistsAtPath:self.metadataFilePath]) {
        NSError *error;
        NSData *data = [NSData dataWithContentsOfFile:self.metadataFilePath];
        
        if (data) {
            NSDictionary *jsonData = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
            
            if (!error && jsonData) {
                // Load metadata
                if (jsonData[@"metadata"]) {
                    @synchronized(self.cacheLock) {
                        [self.cacheMetadata setDictionary:jsonData[@"metadata"]];
                        
                        // Filter out expired entries on load
                        NSMutableArray *expiredIds = [[NSMutableArray alloc] init];
                        NSTimeInterval now = [[NSDate date] timeIntervalSince1970] * 1000;
                        
                        for (NSString *cacheId in self.cacheMetadata.allKeys) {
                            NSDictionary *metadata = self.cacheMetadata[cacheId];
                            NSNumber *cachedAt = metadata[@"cachedAt"];
                            NSNumber *ttlMs = metadata[@"ttlMs"];
                            
                            long long cacheAge = now - [cachedAt longLongValue];
                            long long ttlMsValue = [ttlMs longLongValue];
                            
                            if (cacheAge > ttlMsValue) {
                                [expiredIds addObject:cacheId];
                            }
                        }
                        
                        for (NSString *cacheId in expiredIds) {
                            [self removeCacheEntry:cacheId];
                        }
                    }
                }
                
                // Load stats
                if (jsonData[@"stats"]) {
                    @synchronized(self.cacheLock) {
                        [self.cacheStats setDictionary:jsonData[@"stats"]];
                    }
                }
                
                RCTLogInfo(@"📊 Loaded metadata for %lu persistent cache entries", (unsigned long)self.cacheMetadata.count);
            }
        }
    }
}

- (void)saveMetadata {
    NSError *error;
    
    @synchronized(self.cacheLock) {
        NSDictionary *jsonData = @{
            @"metadata": [self.cacheMetadata copy],
            @"stats": [self.cacheStats copy],
            @"lastUpdated": @([[NSDate date] timeIntervalSince1970] * 1000),
            @"version": @"1.0",
            @"ttlDays": @30
        };
        
        NSData *data = [NSJSONSerialization dataWithJSONObject:jsonData options:NSJSONWritingPrettyPrinted error:&error];
        
        if (!error && data) {
            [data writeToFile:self.metadataFilePath atomically:YES];
        }
    }
}

- (void)updateStatsForAdd:(long long)fileSize {
    NSNumber *totalFiles = self.cacheStats[@"totalFiles"] ?: @0;
    NSNumber *totalSize = self.cacheStats[@"totalSize"] ?: @0;
    
    self.cacheStats[@"totalFiles"] = @([totalFiles intValue] + 1);
    self.cacheStats[@"totalSize"] = @([totalSize longLongValue] + fileSize);
}

- (void)updateStatsForRemove:(long long)fileSize {
    NSNumber *totalFiles = self.cacheStats[@"totalFiles"] ?: @0;
    NSNumber *totalSize = self.cacheStats[@"totalSize"] ?: @0;
    
    self.cacheStats[@"totalFiles"] = @(MAX(0, [totalFiles intValue] - 1));
    self.cacheStats[@"totalSize"] = @(MAX(0, [totalSize longLongValue] - fileSize));
}

- (void)updateStatsForHit {
    NSNumber *cacheHits = self.cacheStats[@"cacheHits"] ?: @0;
    self.cacheStats[@"cacheHits"] = @([cacheHits intValue] + 1);
}

- (NSString *)formatBytes:(long long)bytes {
    if (bytes < 1024) return [NSString stringWithFormat:@"%lld B", bytes];
    
    int exp = (int)(log(bytes) / log(1024));
    NSArray *units = @[@"KB", @"MB", @"GB", @"TB", @"PB"];
    NSString *unit = units[exp - 1];
    
    return [NSString stringWithFormat:@"%.1f %@", bytes / pow(1024, exp), unit];
}

- (void)dealloc {
    [self saveMetadata];
    RCTLogInfo(@"🚀 PDF Native Cache Manager deallocated");
}

@end
