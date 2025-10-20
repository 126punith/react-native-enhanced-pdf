/**
 * Cryptographic utilities
 * License key generation and validation
 */

const crypto = require('crypto');

const LICENSE_SECRET = process.env.LICENSE_SECRET || 'change-this-secret-key';

// License tier prefixes
const TIER_PREFIXES = {
    solo: 'S',
    professional: 'P',
    team: 'T',
    enterprise: 'E'
};

/**
 * Generate license key
 * Format: X###-####-####-####
 * Where X = tier prefix
 */
function generateLicenseKey(tier = 'solo') {
    const prefix = TIER_PREFIXES[tier] || 'S';
    
    // Generate random segments
    const seg1 = crypto.randomBytes(2).toString('hex').toUpperCase().substring(0, 3);
    const seg2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const seg3 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const seg4 = generateChecksum(prefix, seg1, seg2, seg3);
    
    return `${prefix}${seg1}-${seg2}-${seg3}-${seg4}`;
}

/**
 * Generate checksum for license key
 */
function generateChecksum(...segments) {
    const data = segments.join('');
    const hash = crypto
        .createHmac('sha256', LICENSE_SECRET)
        .update(data)
        .digest('hex')
        .toUpperCase();
    
    return hash.substring(0, 4);
}

/**
 * Validate license key format
 */
function validateLicenseFormat(licenseKey) {
    // Check basic format: X###-####-####-####
    const regex = /^[SPTE][A-F0-9]{3}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
    
    if (!regex.test(licenseKey)) {
        return {
            valid: false,
            error: 'INVALID_FORMAT'
        };
    }
    
    // Verify checksum
    const parts = licenseKey.split('-');
    const prefix = parts[0].charAt(0);
    const seg1 = parts[0].substring(1);
    const seg2 = parts[1];
    const seg3 = parts[2];
    const checksum = parts[3];
    
    const expectedChecksum = generateChecksum(prefix, seg1, seg2, seg3);
    
    if (checksum !== expectedChecksum) {
        return {
            valid: false,
            error: 'INVALID_CHECKSUM'
        };
    }
    
    return {
        valid: true,
        tier: getTierFromPrefix(prefix)
    };
}

/**
 * Get tier from prefix
 */
function getTierFromPrefix(prefix) {
    const tiers = {
        'S': 'solo',
        'P': 'professional',
        'T': 'team',
        'E': 'enterprise'
    };
    return tiers[prefix] || 'solo';
}

/**
 * Generate multiple license keys (for bulk)
 */
function generateBulkLicenses(count = 1, tier = 'solo') {
    const licenses = [];
    for (let i = 0; i < count; i++) {
        licenses.push(generateLicenseKey(tier));
    }
    return licenses;
}

/**
 * Hash email (for privacy)
 */
function hashEmail(email) {
    return crypto
        .createHash('sha256')
        .update(email.toLowerCase())
        .digest('hex');
}

/**
 * Generate API key (for admin access)
 */
function generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify API key
 */
function verifyApiKey(apiKey, storedHash) {
    const hash = crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex');
    
    return hash === storedHash;
}

module.exports = {
    generateLicenseKey,
    generateChecksum,
    validateLicenseFormat,
    getTierFromPrefix,
    generateBulkLicenses,
    hashEmail,
    generateApiKey,
    verifyApiKey
};

