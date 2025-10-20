-- ============================================
-- Supabase Database Setup
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_key TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('solo', 'professional', 'team', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    last_validated_at TIMESTAMP WITH TIME ZONE,
    validation_count INTEGER DEFAULT 0,
    max_devices INTEGER DEFAULT 3,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(email);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);

-- Create validation_logs table (for analytics)
CREATE TABLE IF NOT EXISTS validation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
    license_key TEXT NOT NULL,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_id TEXT,
    app_version TEXT,
    platform TEXT,
    ip_address TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Create index for logs
CREATE INDEX IF NOT EXISTS idx_validation_logs_license ON validation_logs(license_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_date ON validation_logs(validated_at);

-- Create customers table (for Stripe integration later)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_stripe ON customers(stripe_customer_id);

-- Create purchases table (for revenue tracking)
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    stripe_payment_id TEXT,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for purchases
CREATE INDEX IF NOT EXISTS idx_purchases_customer ON purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchased_at);

-- ============================================
-- Helper Functions
-- ============================================

-- Function to check if license is valid
CREATE OR REPLACE FUNCTION is_license_valid(p_license_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_license RECORD;
BEGIN
    SELECT * INTO v_license
    FROM licenses
    WHERE license_key = p_license_key;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    IF v_license.status != 'active' THEN
        RETURN FALSE;
    END IF;
    
    IF v_license.expires_at IS NOT NULL AND v_license.expires_at < NOW() THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to log validation
CREATE OR REPLACE FUNCTION log_validation(
    p_license_key TEXT,
    p_device_id TEXT DEFAULT NULL,
    p_app_version TEXT DEFAULT NULL,
    p_platform TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_license_id UUID;
BEGIN
    -- Get license ID
    SELECT id INTO v_license_id
    FROM licenses
    WHERE license_key = p_license_key;
    
    -- Insert log
    INSERT INTO validation_logs (
        license_id,
        license_key,
        device_id,
        app_version,
        platform,
        ip_address,
        success,
        error_message
    ) VALUES (
        v_license_id,
        p_license_key,
        p_device_id,
        p_app_version,
        p_platform,
        p_ip_address,
        p_success,
        p_error_message
    );
    
    -- Update license last validated
    IF p_success AND v_license_id IS NOT NULL THEN
        UPDATE licenses
        SET 
            last_validated_at = NOW(),
            validation_count = validation_count + 1
        WHERE id = v_license_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Sample Data (for testing)
-- ============================================

-- Insert test license keys
INSERT INTO licenses (license_key, email, tier, expires_at) VALUES
    ('TEST-SOLO-1234-ABCD', 'test@example.com', 'solo', NOW() + INTERVAL '1 year'),
    ('TEST-PRO-5678-EFGH', 'pro@example.com', 'professional', NOW() + INTERVAL '1 year'),
    ('TEST-TEAM-9012-IJKL', 'team@example.com', 'team', NOW() + INTERVAL '1 year')
ON CONFLICT (license_key) DO NOTHING;

-- ============================================
-- Row Level Security (RLS) - Optional
-- ============================================

-- Enable RLS
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role can do everything on licenses"
ON licenses
FOR ALL
TO service_role
USING (true);

CREATE POLICY "Service role can do everything on validation_logs"
ON validation_logs
FOR ALL
TO service_role
USING (true);

-- ============================================
-- Views for Analytics
-- ============================================

-- Active licenses count
CREATE OR REPLACE VIEW active_licenses_count AS
SELECT 
    tier,
    COUNT(*) as count,
    SUM(CASE WHEN expires_at > NOW() THEN 1 ELSE 0 END) as active_count
FROM licenses
WHERE status = 'active'
GROUP BY tier;

-- Revenue summary
CREATE OR REPLACE VIEW revenue_summary AS
SELECT 
    DATE_TRUNC('month', purchased_at) as month,
    COUNT(*) as total_purchases,
    SUM(amount) as total_revenue,
    currency
FROM purchases
GROUP BY DATE_TRUNC('month', purchased_at), currency
ORDER BY month DESC;

-- Validation activity (last 30 days)
CREATE OR REPLACE VIEW validation_activity AS
SELECT 
    DATE_TRUNC('day', validated_at) as day,
    COUNT(*) as total_validations,
    COUNT(DISTINCT license_key) as unique_licenses,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_validations
FROM validation_logs
WHERE validated_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', validated_at)
ORDER BY day DESC;

-- ============================================
-- Complete! 🎉
-- ============================================

-- Verify tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

