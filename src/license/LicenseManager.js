/**
 * LicenseManager - Pro Tier License Validation
 * Handles license key validation and feature gating
 * 
 * @author Punith M
 * @version 1.0.0
 * @license Commercial (for Pro features)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LICENSE_STORAGE_KEY = '@react-native-pdf-jsi/pro-license';
const VALIDATION_ENDPOINT = 'https://react-native-pdf-jsi.vercel.app/api/validate-license';

/**
 * License Tiers
 */
export const LicenseTier = {
    FREE: 'free',
    SOLO: 'solo',
    PRO: 'pro',
    TEAM: 'team',
    ENTERPRISE: 'enterprise'
};

/**
 * Pro Features (require license)
 */
export const ProFeature = {
    ENHANCED_BOOKMARKS: 'enhanced_bookmarks',
    BOOKMARK_COLORS: 'bookmark_colors',
    READING_PROGRESS: 'reading_progress',
    READING_ANALYTICS: 'reading_analytics',
    EXPORT_IMAGES: 'export_images',
    PDF_OPERATIONS: 'pdf_operations',
    ADVANCED_EXPORT: 'advanced_export',
    PRIORITY_SUPPORT: 'priority_support'
};

/**
 * LicenseManager Class
 */
class LicenseManager {
    constructor() {
        this.licenseKey = null;
        this.licenseTier = LicenseTier.FREE;
        this.isActive = false;
        this.expiresAt = null;
        this.lastValidation = null;
        this.initialized = false;
    }

    /**
     * Initialize license manager
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Load saved license
            const saved = await AsyncStorage.getItem(LICENSE_STORAGE_KEY);
            
            if (saved) {
                const data = JSON.parse(saved);
                await this.activate(data.licenseKey, false); // Don't save again
            } else {
                console.log('📋 LicenseManager: No saved license found (Free tier)');
            }

            this.initialized = true;

        } catch (error) {
            console.error('📋 LicenseManager: Initialization error:', error);
            this.initialized = true;
        }
    }

    /**
     * Activate Pro features with license key
     * @param {string} licenseKey - License key (format: XXXX-XXXX-XXXX-XXXX)
     * @param {boolean} saveToStorage - Save to AsyncStorage
     * @returns {Promise<Object>} Activation result
     */
    async activate(licenseKey, saveToStorage = true) {
        try {
            console.log('📋 LicenseManager: Activating license...');

            // Validate format
            if (!this.isValidFormat(licenseKey)) {
                throw new Error('Invalid license key format. Expected: XXXX-XXXX-XXXX-XXXX');
            }

            // Offline validation (signature check)
            const offlineValid = this.validateOffline(licenseKey);
            
            if (!offlineValid) {
                throw new Error('Invalid license key signature');
            }

            // Online validation (optional, with fallback)
            let validationResult;
            try {
                validationResult = await this.validateOnline(licenseKey);
            } catch (error) {
                console.warn('📋 LicenseManager: Online validation failed, using offline validation');
                validationResult = {
                    valid: true,
                    tier: this.extractTierFromKey(licenseKey),
                    expiresAt: this.extractExpiryFromKey(licenseKey),
                    offline: true
                };
            }

            if (!validationResult.valid) {
                throw new Error(validationResult.reason || 'License validation failed');
            }

            // Activate license
            this.licenseKey = licenseKey;
            this.licenseTier = validationResult.tier || LicenseTier.SOLO;
            this.isActive = true;
            this.expiresAt = validationResult.expiresAt;
            this.lastValidation = new Date();

            // Save to storage
            if (saveToStorage) {
                await AsyncStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify({
                    licenseKey,
                    tier: this.licenseTier,
                    activatedAt: new Date().toISOString(),
                    expiresAt: this.expiresAt
                }));
            }

            console.log(`✅ LicenseManager: Pro features activated! (${this.licenseTier})`);
            console.log(`📅 LicenseManager: Expires at: ${this.expiresAt}`);

            return {
                success: true,
                tier: this.licenseTier,
                expiresAt: this.expiresAt
            };

        } catch (error) {
            console.error('❌ LicenseManager: Activation failed:', error.message);
            
            // Reset to free tier
            this.licenseKey = null;
            this.licenseTier = LicenseTier.FREE;
            this.isActive = false;
            
            throw error;
        }
    }

    /**
     * Deactivate license (logout)
     */
    async deactivate() {
        this.licenseKey = null;
        this.licenseTier = LicenseTier.FREE;
        this.isActive = false;
        this.expiresAt = null;
        await AsyncStorage.removeItem(LICENSE_STORAGE_KEY);
        console.log('📋 LicenseManager: License deactivated');
    }

    /**
     * Check if Pro tier is active
     * @returns {boolean} True if Pro features are available
     */
    isProActive() {
        return this.isActive && this.licenseTier !== LicenseTier.FREE;
    }

    /**
     * Get current license tier
     * @returns {string} License tier
     */
    getTier() {
        return this.licenseTier;
    }

    /**
     * Check if specific feature is available
     * @param {string} feature - Feature name from ProFeature enum
     * @returns {boolean} True if feature is available
     */
    hasFeature(feature) {
        // Free tier has no Pro features
        if (!this.isActive || this.licenseTier === LicenseTier.FREE) {
            return false;
        }

        // All tiers have all features (for now)
        // Could restrict features by tier in future
        return true;
    }

    /**
     * Require Pro license for a feature (throws if not available)
     * @param {string} featureName - Human-readable feature name
     * @throws {Error} If feature requires Pro license
     */
    requirePro(featureName) {
        if (!this.isProActive()) {
            const error = new Error(
                `${featureName} requires a Pro license.\n\n` +
                `Get your license at: https://github.com/126punith/react-native-enhanced-pdf#pricing\n` +
                `Or email: punithm300@gmail.com\n\n` +
                `Solo Developer: $99/year\n` +
                `Professional: $399/year`
            );
            error.code = 'LICENSE_REQUIRED';
            error.feature = featureName;
            throw error;
        }

        // Check if license is expired
        if (this.expiresAt && new Date(this.expiresAt) < new Date()) {
            const error = new Error(
                `Your Pro license has expired.\n\n` +
                `Renew at: https://github.com/126punith/react-native-enhanced-pdf#pricing\n` +
                `Expired on: ${this.expiresAt}`
            );
            error.code = 'LICENSE_EXPIRED';
            throw error;
        }
    }

    /**
     * Get license information
     * @returns {Object} License info
     */
    getLicenseInfo() {
        return {
            isActive: this.isActive,
            tier: this.licenseTier,
            expiresAt: this.expiresAt,
            lastValidation: this.lastValidation,
            features: this.isProActive() ? Object.values(ProFeature) : []
        };
    }

    // ============================================
    // VALIDATION METHODS
    // ============================================

    /**
     * Validate license key format
     * Format: XXXX-XXXX-XXXX-XXXX
     */
    isValidFormat(key) {
        if (!key || typeof key !== 'string') return false;
        
        const format = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        return format.test(key.toUpperCase());
    }

    /**
     * Offline validation (signature check)
     * This prevents simple bypasses
     */
    validateOffline(key) {
        try {
            const parts = key.toUpperCase().split('-');
            
            // Check format
            if (parts.length !== 4) return false;

            // Verify checksum (simplified - use crypto in production)
            const checksum = this.calculateChecksum(parts.slice(0, 3).join('-'));
            
            // Last 4 chars of part[3] should match checksum
            return parts[3].endsWith(checksum);

        } catch (error) {
            console.error('📋 LicenseManager: Offline validation error:', error);
            return false;
        }
    }

    /**
     * Online validation (calls your API)
     * This is the main security layer
     */
    async validateOnline(key) {
        try {
            const response = await fetch(VALIDATION_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    licenseKey: key,
                    platform: Platform.OS,
                    packageVersion: '2.3.0',
                    timestamp: new Date().toISOString()
                }),
                timeout: 5000 // 5 second timeout
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();
            
            return {
                valid: data.valid === true,
                tier: data.tier,
                expiresAt: data.expiresAt,
                reason: data.reason
            };

        } catch (error) {
            console.error('📋 LicenseManager: Online validation error:', error);
            
            // Graceful degradation: allow offline validation
            // But log this for monitoring
            throw error; // Re-throw to trigger fallback
        }
    }

    /**
     * Calculate checksum (simplified)
     * In production, use proper crypto library
     */
    calculateChecksum(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Return last 2 chars
        return Math.abs(hash).toString(36).toUpperCase().substr(0, 2);
    }

    /**
     * Extract tier from license key (encoded in key)
     */
    extractTierFromKey(key) {
        // First char indicates tier:
        // S = Solo, P = Pro, T = Team, E = Enterprise
        const firstChar = key.charAt(0);
        
        switch (firstChar) {
            case 'S': return LicenseTier.SOLO;
            case 'P': return LicenseTier.PRO;
            case 'T': return LicenseTier.TEAM;
            case 'E': return LicenseTier.ENTERPRISE;
            default: return LicenseTier.SOLO;
        }
    }

    /**
     * Extract expiry from license key
     */
    extractExpiryFromKey(key) {
        // In production, encode expiry in key
        // For now, default to 1 year from now
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return oneYearFromNow.toISOString();
    }

    /**
     * Generate a license key (for your backend)
     * This is example code - implement on your server
     */
    static generateLicenseKey(tier = LicenseTier.SOLO) {
        const tierPrefix = tier.charAt(0).toUpperCase();
        
        // Random parts
        const part1 = tierPrefix + this.randomString(3);
        const part2 = this.randomString(4);
        const part3 = this.randomString(4);
        
        // Checksum
        const checksum = this.simpleChecksum(part1 + '-' + part2 + '-' + part3);
        const part4 = this.randomString(2) + checksum;
        
        return `${part1}-${part2}-${part3}-${part4}`.toUpperCase();
    }

    static randomString(length) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    static simpleChecksum(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36).toUpperCase().substr(0, 2);
    }
}

// Create singleton instance
const licenseManager = new LicenseManager();

// Auto-initialize
licenseManager.initialize().catch(err => {
    console.error('Failed to initialize LicenseManager:', err);
});

export { LicenseManager, LicenseTier, ProFeature };
export default licenseManager;

