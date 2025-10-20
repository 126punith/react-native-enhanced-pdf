import { NativeModules } from 'react-native';

const { LicenseVerifier } = NativeModules;

class NativeLicenseVerifier {
    /**
     * Set license information in native layer
     * @param {Object} licenseInfo - License information from server
     * @returns {Promise<boolean>} Success status
     */
    static async setLicenseInfo(licenseInfo) {
        try {
            if (!LicenseVerifier) {
                console.warn('⚠️ Native LicenseVerifier not available');
                return false;
            }
            
            const success = await LicenseVerifier.setLicenseInfo(licenseInfo);
            console.log('✅ Native license set:', success);
            return success;
        } catch (error) {
            console.error('❌ Error setting native license:', error);
            return false;
        }
    }

    /**
     * Require Pro license for a feature
     * @param {string} featureName - Name of the feature
     * @returns {Promise<boolean>} Success status
     */
    static async requirePro(featureName) {
        try {
            if (!LicenseVerifier) {
                console.warn('⚠️ Native LicenseVerifier not available');
                return false;
            }
            
            const success = await LicenseVerifier.requirePro(featureName);
            return success;
        } catch (error) {
            console.error('❌ Pro license required for:', featureName, error);
            throw error;
        }
    }

    /**
     * Get current license tier
     * @returns {Promise<string>} License tier
     */
    static async getTier() {
        try {
            if (!LicenseVerifier) {
                return 'free';
            }
            
            const tier = await LicenseVerifier.getTier();
            return tier;
        } catch (error) {
            console.error('❌ Error getting tier:', error);
            return 'free';
        }
    }

    /**
     * Check if license is expired
     * @returns {Promise<boolean>} Expiry status
     */
    static async isExpired() {
        try {
            if (!LicenseVerifier) {
                return true;
            }
            
            const expired = await LicenseVerifier.isExpired();
            return expired;
        } catch (error) {
            console.error('❌ Error checking expiry:', error);
            return true;
        }
    }

    /**
     * Get license info for debugging
     * @returns {Promise<Object>} License information
     */
    static async getLicenseInfo() {
        try {
            if (!LicenseVerifier) {
                return {
                    key: null,
                    tier: 'free',
                    email: null,
                    expiresAt: 0,
                    isPro: false
                };
            }
            
            const info = await LicenseVerifier.getLicenseInfo();
            return info;
        } catch (error) {
            console.error('❌ Error getting license info:', error);
            return {
                key: null,
                tier: 'free',
                email: null,
                expiresAt: 0,
                isPro: false
            };
        }
    }

    /**
     * Clear license info
     * @returns {Promise<boolean>} Success status
     */
    static async clearLicense() {
        try {
            if (!LicenseVerifier) {
                return true;
            }
            
            const success = await LicenseVerifier.clearLicense();
            console.log('✅ Native license cleared:', success);
            return success;
        } catch (error) {
            console.error('❌ Error clearing native license:', error);
            return false;
        }
    }

    /**
     * Check if native license verification is available
     * @returns {boolean} Availability status
     */
    static isAvailable() {
        return LicenseVerifier != null;
    }
}

export default NativeLicenseVerifier;
