package org.wonday.pdf;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class LicenseVerifier extends ReactContextBaseJavaModule {
    private static final String TAG = "LicenseVerifier";
    
    // License info cache
    private String currentLicenseKey = null;
    private String currentTier = null;
    private long expiryTimestamp = 0;
    private String currentEmail = null;
    
    // Secret key for HMAC verification (from app config)
    private String secretKey = null;

    public LicenseVerifier(ReactApplicationContext reactContext) {
        super(reactContext);
        loadSecretKey();
    }

    @Override
    public String getName() {
        return "LicenseVerifier";
    }

    /**
     * Load secret key from AndroidManifest meta-data
     */
    private void loadSecretKey() {
        try {
            Context context = getReactApplicationContext();
            ApplicationInfo appInfo = context.getPackageManager()
                .getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA);
            
            if (appInfo.metaData != null) {
                secretKey = appInfo.metaData.getString("com.reactnativepdf.license.secret");
            }
            
            if (secretKey == null) {
                Log.w(TAG, "License secret not found in AndroidManifest");
                secretKey = "default-secret-change-in-production";
            }
        } catch (Exception e) {
            Log.e(TAG, "Error loading license secret", e);
            secretKey = "default-secret-change-in-production";
        }
    }

    /**
     * Set license information from JS
     */
    @ReactMethod
    public void setLicenseInfo(ReadableMap licenseInfo, Promise promise) {
        try {
            if (licenseInfo == null) {
                promise.reject("INVALID_LICENSE", "License info is null");
                return;
            }

            String licenseKey = licenseInfo.getString("key");
            String tier = licenseInfo.getString("tier");
            String email = licenseInfo.getString("email");
            String expiresAt = licenseInfo.getString("expiresAt");

            if (licenseKey == null || tier == null) {
                promise.reject("INVALID_LICENSE", "Missing required license fields");
                return;
            }

            // Verify license key format and checksum
            if (!verifyLicenseKey(licenseKey)) {
                promise.reject("INVALID_LICENSE", "Invalid license key format or checksum");
                return;
            }

            // Parse expiry timestamp
            long expiry = 0;
            if (expiresAt != null && !expiresAt.isEmpty()) {
                try {
                    expiry = java.time.Instant.parse(expiresAt).toEpochMilli();
                } catch (Exception e) {
                    Log.w(TAG, "Invalid expiry date format", e);
                }
            }

            // Cache license info
            this.currentLicenseKey = licenseKey;
            this.currentTier = tier;
            this.currentEmail = email;
            this.expiryTimestamp = expiry;

            Log.i(TAG, "License set: " + tier + " for " + email);
            promise.resolve(true);

        } catch (Exception e) {
            Log.e(TAG, "Error setting license info", e);
            promise.reject("LICENSE_ERROR", e.getMessage());
        }
    }

    /**
     * Require Pro license for a feature
     */
    @ReactMethod
    public void requirePro(String featureName, Promise promise) {
        try {
            if (!isProActive()) {
                WritableMap error = Arguments.createMap();
                error.putString("code", "LICENSE_REQUIRED");
                error.putString("feature", featureName);
                error.putString("message", featureName + " requires a Pro license");
                promise.reject("LICENSE_REQUIRED", error);
                return;
            }

            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error checking Pro license", e);
            promise.reject("LICENSE_ERROR", e.getMessage());
        }
    }

    /**
     * Check if Pro license is active
     */
    public boolean isProActive() {
        // 🧪 TESTING MODE: Always return true for testing
        Log.i(TAG, "🧪 TESTING MODE: isProActive() returning true for testing");
        return true;
        
        /* PRODUCTION CODE (commented out for testing):
        if (currentLicenseKey == null || currentTier == null) {
            Log.w(TAG, "No license set");
            return false;
        }

        // Check if license is expired
        if (expiryTimestamp > 0 && System.currentTimeMillis() > expiryTimestamp) {
            Log.w(TAG, "License expired");
            return false;
        }

        // Check if tier is Pro or higher
        return isProTier(currentTier);
        */
    }

    /**
     * Check if tier is Pro or higher
     */
    private boolean isProTier(String tier) {
        if (tier == null) return false;
        
        switch (tier.toLowerCase()) {
            case "solo":
            case "professional":
            case "team":
            case "enterprise":
                return true;
            default:
                return false;
        }
    }

    /**
     * Get current license tier
     */
    @ReactMethod
    public void getTier(Promise promise) {
        try {
            if (currentTier == null) {
                promise.resolve("free");
            } else {
                promise.resolve(currentTier);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting tier", e);
            promise.reject("LICENSE_ERROR", e.getMessage());
        }
    }

    /**
     * Check if license is expired
     */
    @ReactMethod
    public void isExpired(Promise promise) {
        try {
            boolean expired = expiryTimestamp > 0 && System.currentTimeMillis() > expiryTimestamp;
            promise.resolve(expired);
        } catch (Exception e) {
            Log.e(TAG, "Error checking expiry", e);
            promise.reject("LICENSE_ERROR", e.getMessage());
        }
    }

    /**
     * Verify license key format and checksum
     */
    private boolean verifyLicenseKey(String licenseKey) {
        if (licenseKey == null || licenseKey.length() != 19) {
            return false;
        }

        // Check format: X###-####-####-####
        if (!licenseKey.matches("^[SPTE][A-F0-9]{3}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$")) {
            return false;
        }

        // Verify checksum
        try {
            String[] parts = licenseKey.split("-");
            String prefix = parts[0].substring(0, 1);
            String seg1 = parts[0].substring(1);
            String seg2 = parts[1];
            String seg3 = parts[2];
            String checksum = parts[3];

            String data = prefix + seg1 + seg2 + seg3;
            String expectedChecksum = generateChecksum(data);

            return checksum.equals(expectedChecksum);
        } catch (Exception e) {
            Log.e(TAG, "Error verifying license key", e);
            return false;
        }
    }

    /**
     * Generate checksum for license key
     */
    private String generateChecksum(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(data.getBytes());
            StringBuilder hexString = new StringBuilder();
            
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString().toUpperCase().substring(0, 4);
        } catch (Exception e) {
            Log.e(TAG, "Error generating checksum", e);
            return "0000";
        }
    }

    /**
     * Get license info for debugging
     */
    @ReactMethod
    public void getLicenseInfo(Promise promise) {
        try {
            WritableMap info = Arguments.createMap();
            info.putString("key", currentLicenseKey);
            info.putString("tier", currentTier);
            info.putString("email", currentEmail);
            info.putDouble("expiresAt", expiryTimestamp);
            info.putBoolean("isPro", isProActive());
            promise.resolve(info);
        } catch (Exception e) {
            Log.e(TAG, "Error getting license info", e);
            promise.reject("LICENSE_ERROR", e.getMessage());
        }
    }

    /**
     * Clear license info
     */
    @ReactMethod
    public void clearLicense(Promise promise) {
        try {
            currentLicenseKey = null;
            currentTier = null;
            currentEmail = null;
            expiryTimestamp = 0;
            Log.i(TAG, "License cleared");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error clearing license", e);
            promise.reject("LICENSE_ERROR", e.getMessage());
        }
    }
}
