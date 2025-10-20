/**
 * License Validation API
 * Endpoint: /api/validate
 * Method: POST
 * 
 * Validates license keys for React Native PDF JSI
 */

const { validateLicense, logValidation } = require('../utils/supabase');
const { validateLicenseFormat } = require('../utils/crypto');

/**
 * Get client IP address
 */
function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           'unknown';
}

/**
 * CORS headers
 */
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Main handler
 */
module.exports = async (req, res) => {
    // Set CORS headers
    setCorsHeaders(res);

    // Handle OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'METHOD_NOT_ALLOWED',
            message: 'Only POST requests are allowed'
        });
    }

    try {
        // Get request body
        const { licenseKey, deviceId, appVersion, platform } = req.body;

        // Validate input
        if (!licenseKey) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_LICENSE_KEY',
                message: 'License key is required'
            });
        }

        // Validate format first (fast, no database hit)
        const formatCheck = validateLicenseFormat(licenseKey);
        
        if (!formatCheck.valid) {
            // Log failed validation
            await logValidation(licenseKey, {
                deviceId,
                appVersion,
                platform,
                ipAddress: getClientIp(req),
                success: false,
                errorMessage: formatCheck.error
            });

            return res.status(400).json({
                success: false,
                error: formatCheck.error,
                message: 'Invalid license key format',
                valid: false
            });
        }

        // Validate against database
        const validation = await validateLicense(licenseKey);

        if (!validation.valid) {
            // Log failed validation
            await logValidation(licenseKey, {
                deviceId,
                appVersion,
                platform,
                ipAddress: getClientIp(req),
                success: false,
                errorMessage: validation.error
            });

            // Map error to HTTP status
            const statusCode = validation.error === 'LICENSE_NOT_FOUND' ? 404 : 403;

            return res.status(statusCode).json({
                success: false,
                error: validation.error,
                message: getErrorMessage(validation.error),
                valid: false
            });
        }

        // License is valid! Log successful validation
        await logValidation(licenseKey, {
            deviceId,
            appVersion,
            platform,
            ipAddress: getClientIp(req),
            success: true
        });

        // Return success
        return res.status(200).json({
            success: true,
            valid: true,
            license: {
                tier: validation.license.tier,
                status: validation.license.status,
                expiresAt: validation.license.expiresAt,
                features: getFeaturesByTier(validation.license.tier)
            }
        });

    } catch (error) {
        console.error('Validation error:', error);

        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Internal server error',
            valid: false
        });
    }
};

/**
 * Get error message for error code
 */
function getErrorMessage(errorCode) {
    const messages = {
        'LICENSE_NOT_FOUND': 'License key not found',
        'LICENSE_INACTIVE': 'License is inactive',
        'LICENSE_EXPIRED': 'License has expired',
        'LICENSE_SUSPENDED': 'License has been suspended',
        'INVALID_FORMAT': 'Invalid license key format',
        'INVALID_CHECKSUM': 'Invalid license key checksum',
        'DATABASE_ERROR': 'Database error occurred'
    };
    
    return messages[errorCode] || 'Unknown error';
}

/**
 * Get features by tier
 */
function getFeaturesByTier(tier) {
    const features = {
        solo: [
            'enhanced_bookmarks',
            'reading_progress',
            'export_images',
            'pdf_operations',
            'reading_analytics'
        ],
        professional: [
            'enhanced_bookmarks',
            'reading_progress',
            'export_images',
            'pdf_operations',
            'reading_analytics',
            'priority_support'
        ],
        team: [
            'enhanced_bookmarks',
            'reading_progress',
            'export_images',
            'pdf_operations',
            'reading_analytics',
            'priority_support',
            'team_dashboard',
            'usage_analytics'
        ],
        enterprise: [
            'enhanced_bookmarks',
            'reading_progress',
            'export_images',
            'pdf_operations',
            'reading_analytics',
            'priority_support',
            'team_dashboard',
            'usage_analytics',
            'custom_integrations',
            'dedicated_support',
            'sla_guarantees'
        ]
    };
    
    return features[tier] || features.solo;
}

