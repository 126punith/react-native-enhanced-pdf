#import "LicenseVerifier.h"
#import <CommonCrypto/CommonHMAC.h>
#import <CommonCrypto/CommonDigest.h>

@implementation LicenseVerifier {
    NSString *_currentLicenseKey;
    NSString *_currentTier;
    NSString *_currentEmail;
    NSTimeInterval _expiryTimestamp;
    NSString *_secretKey;
}

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        [self loadSecretKey];
        _expiryTimestamp = 0;
    }
    return self;
}

/**
 * Load secret key from Info.plist
 */
- (void)loadSecretKey {
    _secretKey = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"ReactNativePDFLicenseSecret"];
    
    if (!_secretKey) {
        NSLog(@"⚠️ License secret not found in Info.plist");
        _secretKey = @"default-secret-change-in-production";
    }
}

/**
 * Set license information from JS
 */
RCT_EXPORT_METHOD(setLicenseInfo:(NSDictionary *)licenseInfo
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (!licenseInfo) {
        reject(@"INVALID_LICENSE", @"License info is null", nil);
        return;
    }
    
    NSString *licenseKey = licenseInfo[@"key"];
    NSString *tier = licenseInfo[@"tier"];
    NSString *email = licenseInfo[@"email"];
    NSString *expiresAt = licenseInfo[@"expiresAt"];
    
    if (!licenseKey || !tier) {
        reject(@"INVALID_LICENSE", @"Missing required license fields", nil);
        return;
    }
    
    // Verify license key format and checksum
    if (![self verifyLicenseKey:licenseKey]) {
        reject(@"INVALID_LICENSE", @"Invalid license key format or checksum", nil);
        return;
    }
    
    // Parse expiry timestamp
    NSTimeInterval expiry = 0;
    if (expiresAt && expiresAt.length > 0) {
        NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
        formatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
        formatter.timeZone = [NSTimeZone timeZoneWithAbbreviation:@"UTC"];
        NSDate *date = [formatter dateFromString:expiresAt];
        if (date) {
            expiry = [date timeIntervalSince1970];
        }
    }
    
    // Cache license info
    _currentLicenseKey = licenseKey;
    _currentTier = tier;
    _currentEmail = email;
    _expiryTimestamp = expiry;
    
    NSLog(@"✅ License set: %@ for %@", tier, email);
    resolve(@YES);
}

/**
 * Require Pro license for a feature
 */
RCT_EXPORT_METHOD(requirePro:(NSString *)featureName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (![self isProActive]) {
        NSDictionary *error = @{
            @"code": @"LICENSE_REQUIRED",
            @"feature": featureName,
            @"message": [NSString stringWithFormat:@"%@ requires a Pro license", featureName]
        };
        reject(@"LICENSE_REQUIRED", [NSString stringWithFormat:@"%@ requires a Pro license", featureName], nil);
        return;
    }
    
    resolve(@YES);
}

/**
 * Check if Pro license is active
 */
- (BOOL)isProActive {
    if (!_currentLicenseKey || !_currentTier) {
        NSLog(@"⚠️ No license set");
        return NO;
    }
    
    // Check if license is expired
    if (_expiryTimestamp > 0 && [[NSDate date] timeIntervalSince1970] > _expiryTimestamp) {
        NSLog(@"⚠️ License expired");
        return NO;
    }
    
    // Check if tier is Pro or higher
    return [self isProTier:_currentTier];
}

/**
 * Check if tier is Pro or higher
 */
- (BOOL)isProTier:(NSString *)tier {
    if (!tier) return NO;
    
    NSString *lowerTier = [tier lowercaseString];
    return [lowerTier isEqualToString:@"solo"] ||
           [lowerTier isEqualToString:@"professional"] ||
           [lowerTier isEqualToString:@"team"] ||
           [lowerTier isEqualToString:@"enterprise"];
}

/**
 * Get current license tier
 */
RCT_EXPORT_METHOD(getTier:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(_currentTier ?: @"free");
}

/**
 * Check if license is expired
 */
RCT_EXPORT_METHOD(isExpired:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL expired = _expiryTimestamp > 0 && [[NSDate date] timeIntervalSince1970] > _expiryTimestamp;
    resolve(@(expired));
}

/**
 * Verify license key format and checksum
 */
- (BOOL)verifyLicenseKey:(NSString *)licenseKey {
    if (!licenseKey || licenseKey.length != 19) {
        return NO;
    }
    
    // Check format: X###-####-####-####
    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"^[SPTE][A-F0-9]{3}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$"
                                                                           options:0
                                                                             error:nil];
    if ([regex numberOfMatchesInString:licenseKey options:0 range:NSMakeRange(0, licenseKey.length)] == 0) {
        return NO;
    }
    
    // Verify checksum
    NSArray *parts = [licenseKey componentsSeparatedByString:@"-"];
    if (parts.count != 4) return NO;
    
    NSString *prefix = [[parts[0] substringToIndex:1] uppercaseString];
    NSString *seg1 = [parts[0] substringFromIndex:1];
    NSString *seg2 = parts[1];
    NSString *seg3 = parts[2];
    NSString *checksum = parts[3];
    
    NSString *data = [NSString stringWithFormat:@"%@%@%@%@", prefix, seg1, seg2, seg3];
    NSString *expectedChecksum = [self generateChecksum:data];
    
    return [checksum isEqualToString:expectedChecksum];
}

/**
 * Generate checksum for license key
 */
- (NSString *)generateChecksum:(NSString *)data {
    const char *cKey = [_secretKey cStringUsingEncoding:NSUTF8StringEncoding];
    const char *cData = [data cStringUsingEncoding:NSUTF8StringEncoding];
    
    unsigned char cHMAC[CC_SHA256_DIGEST_LENGTH];
    CCHmac(kCCHmacAlgSHA256, cKey, strlen(cKey), cData, strlen(cData), cHMAC);
    
    NSMutableString *hexString = [NSMutableString string];
    for (int i = 0; i < CC_SHA256_DIGEST_LENGTH; i++) {
        [hexString appendFormat:@"%02X", cHMAC[i]];
    }
    
    return [hexString substringToIndex:4];
}

/**
 * Get license info for debugging
 */
RCT_EXPORT_METHOD(getLicenseInfo:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSDictionary *info = @{
        @"key": _currentLicenseKey ?: [NSNull null],
        @"tier": _currentTier ?: [NSNull null],
        @"email": _currentEmail ?: [NSNull null],
        @"expiresAt": @(_expiryTimestamp),
        @"isPro": @([self isProActive])
    };
    resolve(info);
}

/**
 * Clear license info
 */
RCT_EXPORT_METHOD(clearLicense:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    _currentLicenseKey = nil;
    _currentTier = nil;
    _currentEmail = nil;
    _expiryTimestamp = 0;
    NSLog(@"✅ License cleared");
    resolve(@YES);
}

@end
