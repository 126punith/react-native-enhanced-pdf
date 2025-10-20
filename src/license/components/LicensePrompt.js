/**
 * LicensePrompt - UI component for Pro feature prompts
 * Shows upgrade prompt when user tries to use Pro features
 * 
 * @author Punith M
 * @version 1.0.0
 */

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
    Modal
} from 'react-native';

/**
 * LicensePrompt Component
 * Shows when user tries to access Pro feature without license
 */
export const LicensePrompt = ({
    visible = false,
    featureName = 'This feature',
    onClose,
    onUpgrade
}) => {
    const handleUpgrade = () => {
        if (onUpgrade) {
            onUpgrade();
        } else {
            // Open pricing page
            Linking.openURL('https://github.com/126punith/react-native-enhanced-pdf#pricing');
        }
        if (onClose) onClose();
    };

    const handleContactSales = () => {
        Linking.openURL('mailto:punithm300@gmail.com?subject=Pro License Inquiry');
        if (onClose) onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🔒</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Pro Feature</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        {featureName} requires a Pro license.
                    </Text>

                    {/* Features List */}
                    <View style={styles.featuresList}>
                        <Text style={styles.featuresTitle}>Pro includes:</Text>
                        <Text style={styles.featureItem}>✅ Enhanced Bookmarks with 10 colors</Text>
                        <Text style={styles.featureItem}>✅ Reading Progress & Analytics</Text>
                        <Text style={styles.featureItem}>✅ Export to Images (JPEG, PNG)</Text>
                        <Text style={styles.featureItem}>✅ PDF Operations (merge, split)</Text>
                        <Text style={styles.featureItem}>✅ Priority Support</Text>
                    </View>

                    {/* Pricing */}
                    <View style={styles.pricing}>
                        <Text style={styles.priceLabel}>Solo Developer</Text>
                        <Text style={styles.price}>$99/year</Text>
                        <Text style={styles.priceSubtext}>or $19/month</Text>
                    </View>

                    {/* Actions */}
                    <TouchableOpacity
                        style={styles.upgradeButton}
                        onPress={handleUpgrade}
                    >
                        <Text style={styles.upgradeButtonText}>
                            🚀 Get Pro License
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={handleContactSales}
                    >
                        <Text style={styles.contactButtonText}>
                            💬 Contact Sales
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>
                            Maybe Later
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

/**
 * Inline Pro Badge (for marking features in UI)
 */
export const ProBadge = ({ style }) => (
    <View style={[styles.badge, style]}>
        <Text style={styles.badgeText}>PRO</Text>
    </View>
);

/**
 * Feature Gate Component (wraps Pro features)
 */
export const FeatureGate = ({
    feature,
    featureName,
    children,
    fallback = null,
    showPrompt = true
}) => {
    const [showLicensePrompt, setShowLicensePrompt] = React.useState(false);
    const licenseManager = require('../LicenseManager').default;

    const isFeatureAvailable = licenseManager.hasFeature(feature);

    if (!isFeatureAvailable) {
        if (showPrompt && !fallback) {
            return (
                <>
                    <TouchableOpacity
                        style={styles.lockedFeature}
                        onPress={() => setShowLicensePrompt(true)}
                    >
                        <Text style={styles.lockedIcon}>🔒</Text>
                        <Text style={styles.lockedText}>
                            {featureName || 'This feature'} requires Pro
                        </Text>
                        <ProBadge />
                    </TouchableOpacity>

                    <LicensePrompt
                        visible={showLicensePrompt}
                        featureName={featureName}
                        onClose={() => setShowLicensePrompt(false)}
                    />
                </>
            );
        }
        
        return fallback;
    }

    return children;
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 48,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    featuresList: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    featuresTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    featureItem: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
        lineHeight: 20,
    },
    pricing: {
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    price: {
        fontSize: 32,
        fontWeight: '700',
        color: '#007AFF',
        marginBottom: 4,
    },
    priceSubtext: {
        fontSize: 13,
        color: '#999',
    },
    upgradeButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    upgradeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    contactButton: {
        backgroundColor: '#f0f0f0',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 12,
    },
    contactButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        padding: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#999',
        fontSize: 14,
    },
    badge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#333',
    },
    lockedFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFD700',
        borderStyle: 'dashed',
    },
    lockedIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    lockedText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
});

export default LicensePrompt;

