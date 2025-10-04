/**
 * 🚀 Native PDF Cache Manager for iOS (Inside react-native-pdf Package)
 * High-performance PDF caching with persistent native implementation
 */

#import <React/RCTBridgeModule.h>
#import <Foundation/Foundation.h>

@interface PDFNativeCacheManager : NSObject <RCTBridgeModule>

@property (nonatomic, strong) NSString *cacheDir;
@property (nonatomic, strong) NSString *metadataFilePath;
@property (nonatomic, strong) NSMutableDictionary *cacheMetadata;
@property (nonatomic, strong) NSMutableDictionary *cacheStats;
@property (nonatomic, strong) NSObject *cacheLock;

// Singleton instance for direct access
+ (instancetype)sharedInstance;

@end
