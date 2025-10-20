/**
 * License Module
 * Main export for license management
 * 
 * @author Punith M
 * @version 1.0.0
 */

// Core Manager
export { default as licenseManager, LicenseManager, LicenseTier, ProFeature } from './LicenseManager';

// UI Components
export { LicensePrompt, ProBadge, FeatureGate } from './components/LicensePrompt';

// Native License Verification
export { default as NativeLicenseVerifier } from './NativeLicenseVerifier';

// Convenience function for activation
import licenseManager from './LicenseManager';

/**
 * Activate Pro license (convenience function)
 * @param {string} licenseKey - License key
 * @returns {Promise<Object>} Activation result
 */
export async function activateLicense(licenseKey) {
    return await licenseManager.activate(licenseKey);
}

/**
 * Check if Pro is active (convenience function)
 * @returns {boolean} True if Pro features are available
 */
export function isProActive() {
    return licenseManager.isProActive();
}

/**
 * Get license info (convenience function)
 * @returns {Object} License information
 */
export function getLicenseInfo() {
    return licenseManager.getLicenseInfo();
}

// Default export
export default licenseManager;

