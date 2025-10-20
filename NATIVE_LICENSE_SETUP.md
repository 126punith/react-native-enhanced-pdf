# 🔐 Native License Verification Setup

This guide explains how to set up native license verification for your React Native PDF library.

## 🚨 CRITICAL: Security Configuration

### 1. Set License Secret Key

**Android:**
```bash
# In your app's build.gradle or gradle.properties
LICENSE_SECRET=your-super-secret-key-here-change-this-in-production
```

**iOS:**
```bash
# In your Xcode project settings or Info.plist
LICENSE_SECRET=your-super-secret-key-here-change-this-in-production
```

### 2. Environment Variables

Create a `.env` file in your project root:
```bash
# License verification secret (MUST match native config)
LICENSE_SECRET=your-super-secret-key-here-change-this-in-production

# Supabase configuration
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key

# Admin API key for license generation
ADMIN_API_KEY=your-admin-api-key
```

### 3. Build Configuration

**Android (build.gradle):**
```gradle
android {
    defaultConfig {
        // ... other config
        buildConfigField "String", "LICENSE_SECRET", "\"${project.LICENSE_SECRET}\""
    }
}
```

**iOS (Info.plist):**
```xml
<key>ReactNativePDFLicenseSecret</key>
<string>$(LICENSE_SECRET)</string>
```

## 🔧 How It Works

### 1. License Flow
```
User enters license key → JS validation → Native verification → Pro features unlocked
```

### 2. Security Layers
- **JS Layer**: Basic validation, user experience
- **Native Layer**: Cryptographic verification, tamper protection
- **Server Layer**: Online validation, usage tracking

### 3. Native Modules
- `LicenseVerifier`: Core verification logic
- `PDFTextExtractor`: Text extraction with license checks
- `PDFExporter`: Export features with license checks

## 🚀 Deployment Checklist

### Before Pushing to Production:

1. **Change Default Secrets**
   ```bash
   # Generate a strong secret
   openssl rand -base64 32
   ```

2. **Update Native Configs**
   - Android: Update `LICENSE_SECRET` in build.gradle
   - iOS: Update `LICENSE_SECRET` in Info.plist

3. **Test License Flow**
   ```javascript
   import { activateLicense } from 'react-native-pdf-enhanced';
   
   // Test with a valid license key
   await activateLicense('S123-4567-8901-2345');
   ```

4. **Verify Native Protection**
   - Try calling native methods without license
   - Ensure Pro features are blocked

## 🛡️ Security Best Practices

### 1. Secret Management
- Never commit secrets to git
- Use environment variables
- Rotate secrets regularly
- Use different secrets for dev/staging/prod

### 2. License Key Format
```
Format: X###-####-####-####
Where X = S (Solo), P (Pro), T (Team), E (Enterprise)
```

### 3. Validation
- Offline: Cryptographic signature verification
- Online: Server-side validation with usage tracking
- Fallback: Graceful degradation when offline

## 🔍 Troubleshooting

### Common Issues:

1. **"Native LicenseVerifier not available"**
   - Check if native modules are properly registered
   - Verify React Native linking

2. **"License secret not found"**
   - Check AndroidManifest.xml and Info.plist
   - Verify environment variables

3. **"Invalid license key format"**
   - Check license key format: X###-####-####-####
   - Verify checksum calculation

### Debug Commands:
```javascript
import { NativeLicenseVerifier } from 'react-native-pdf-enhanced';

// Check if native verification is available
console.log('Available:', NativeLicenseVerifier.isAvailable());

// Get current license info
const info = await NativeLicenseVerifier.getLicenseInfo();
console.log('License info:', info);
```

## 📱 Platform-Specific Notes

### Android
- Uses `PdfiumCore` for text extraction
- Requires API 21+ for PDF rendering
- License secret stored in AndroidManifest meta-data

### iOS
- Uses `PDFKit` for text extraction and export
- Requires iOS 11.0+ for PDFKit
- License secret stored in Info.plist

## 🚨 IMPORTANT WARNINGS

1. **Never push code without license checks**
2. **Always test with invalid license keys**
3. **Keep secrets secure and rotated**
4. **Monitor for license bypass attempts**
5. **Use server-side validation for production**

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Verify your configuration
3. Test with sample license keys
4. Contact: punithm300@gmail.com

---

**Remember**: This is a security-critical system. Take time to understand and test thoroughly before deploying to production.
