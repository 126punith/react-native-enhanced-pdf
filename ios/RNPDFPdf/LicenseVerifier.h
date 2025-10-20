/**
 * Native License Verification Module (iOS)
 * Prevents bypassing JS license checks by enforcing at native level
 * 
 * LICENSE: Commercial License (Pro feature)
 * 
 * @author Punith M
 * @version 1.0.0
 */

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface LicenseVerifier : NSObject <RCTBridgeModule>

@end
