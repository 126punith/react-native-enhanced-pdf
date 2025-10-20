/**
 * Supabase Client
 * Database connection and helper functions
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Validate license key
 */
async function validateLicense(licenseKey) {
    try {
        const { data, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('license_key', licenseKey)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned
                return {
                    valid: false,
                    error: 'LICENSE_NOT_FOUND'
                };
            }
            throw error;
        }

        // Check if license is active
        if (data.status !== 'active') {
            return {
                valid: false,
                error: 'LICENSE_INACTIVE',
                status: data.status
            };
        }

        // Check if license is expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return {
                valid: false,
                error: 'LICENSE_EXPIRED',
                expiresAt: data.expires_at
            };
        }

        return {
            valid: true,
            license: {
                id: data.id,
                key: data.license_key,
                email: data.email,
                tier: data.tier,
                status: data.status,
                createdAt: data.created_at,
                expiresAt: data.expires_at,
                validationCount: data.validation_count
            }
        };
    } catch (error) {
        console.error('Error validating license:', error);
        return {
            valid: false,
            error: 'DATABASE_ERROR',
            message: error.message
        };
    }
}

/**
 * Log validation attempt
 */
async function logValidation(licenseKey, metadata = {}) {
    try {
        // Get license ID
        const { data: license } = await supabase
            .from('licenses')
            .select('id')
            .eq('license_key', licenseKey)
            .single();

        // Insert log
        await supabase
            .from('validation_logs')
            .insert({
                license_id: license?.id,
                license_key: licenseKey,
                device_id: metadata.deviceId,
                app_version: metadata.appVersion,
                platform: metadata.platform,
                ip_address: metadata.ipAddress,
                success: metadata.success || true,
                error_message: metadata.errorMessage
            });

        // Update license last validated
        if (license?.id && metadata.success !== false) {
            await supabase
                .from('licenses')
                .update({
                    last_validated_at: new Date().toISOString(),
                    validation_count: supabase.raw('validation_count + 1')
                })
                .eq('id', license.id);
        }

        return { success: true };
    } catch (error) {
        console.error('Error logging validation:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create new license
 */
async function createLicense(licenseData) {
    try {
        const { data, error } = await supabase
            .from('licenses')
            .insert({
                license_key: licenseData.key,
                email: licenseData.email,
                tier: licenseData.tier,
                expires_at: licenseData.expiresAt,
                max_devices: licenseData.maxDevices || 3,
                metadata: licenseData.metadata || {}
            })
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            license: data
        };
    } catch (error) {
        console.error('Error creating license:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get license by email
 */
async function getLicensesByEmail(email) {
    try {
        const { data, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            success: true,
            licenses: data
        };
    } catch (error) {
        console.error('Error getting licenses:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Update license status
 */
async function updateLicenseStatus(licenseKey, status) {
    try {
        const { data, error } = await supabase
            .from('licenses')
            .update({ status })
            .eq('license_key', licenseKey)
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            license: data
        };
    } catch (error) {
        console.error('Error updating license:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get analytics
 */
async function getAnalytics() {
    try {
        // Get active licenses count
        const { data: activeLicenses } = await supabase
            .from('active_licenses_count')
            .select('*');

        // Get recent validations
        const { data: recentValidations } = await supabase
            .from('validation_logs')
            .select('*')
            .order('validated_at', { ascending: false })
            .limit(100);

        // Get revenue summary
        const { data: revenue } = await supabase
            .from('revenue_summary')
            .select('*');

        return {
            success: true,
            analytics: {
                activeLicenses,
                recentValidations,
                revenue
            }
        };
    } catch (error) {
        console.error('Error getting analytics:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    supabase,
    validateLicense,
    logValidation,
    createLicense,
    getLicensesByEmail,
    updateLicenseStatus,
    getAnalytics
};

