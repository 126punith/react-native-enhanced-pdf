# 🔐 License System Documentation

Complete guide to the react-native-pdf-jsi licensing system.

---

## 📋 Overview

react-native-pdf-jsi uses a **dual licensing** model:
- **Free Tier:** MIT License (core features)
- **Pro Tier:** Commercial License (enhanced features)

All code is included in the npm package, but Pro features require a valid license key to activate.

---

## 🆓 Free Tier (MIT License)

### What's Free Forever:

✅ **Core PDF Viewing**
- All original Wonday features
- PDF rendering and display
- Zoom, pan, page navigation
- Password-protected PDFs
- All viewing modes

✅ **Advanced Search**
- Fuzzy search (typo-tolerant)
- Boolean search (AND, OR, NOT)
- Regex search (patterns)
- Context snippets
- Search highlighting

✅ **Basic Bookmarks**
- Create, read, update, delete
- Page-based organization
- Simple notes
- Automatic persistence

✅ **Export to Text**
- Export pages to plain text
- Single or multiple pages
- Share as text

✅ **All Performance Features**
- JSI acceleration (80x faster)
- Smart caching
- 16KB compliance

### Usage (No License Required):

```javascript
import Pdf from 'react-native-pdf-jsi';
import { useSearch } from 'react-native-pdf-jsi/src/search';
import { useBookmarks } from 'react-native-pdf-jsi/src/bookmarks';

// ✅ All free features work immediately
<Pdf source={{uri: 'document.pdf'}} />

const { results } = useSearch(filePath);
const { bookmarks, createBookmark } = useBookmarks(pdfId);
```

---

## 💎 Pro Tier (Commercial License)

### What Requires License:

🔒 **Enhanced Bookmarks**
- 10 beautiful colors
- Reading progress tracking
- Time spent analytics
- Session management
- Reading speed calculation
- Advanced statistics

🔒 **Export to Images**
- JPEG export (4 quality levels)
- PNG export with transparency
- Batch export with progress
- Custom scaling and sizing

🔒 **PDF Operations**
- Merge multiple PDFs
- Split PDF by ranges
- Extract specific pages
- Rotate pages
- Delete pages

🔒 **Reading Analytics**
- Progress visualization
- Reading statistics
- Charts and graphs
- Insights dashboard

🔒 **Priority Support**
- 48-hour email response
- Direct support from creator
- Bug fix priority

---

## 🚀 Quick Start (Pro Tier)

### Step 1: Purchase License

Visit: https://github.com/126punith/react-native-enhanced-pdf#pricing

Or email: punithm300@gmail.com

**Pricing:**
- Solo Developer: $99/year
- Professional: $399/year
- Team (5 seats): $1,999/year
- Enterprise: Custom

### Step 2: Install Package

```bash
npm install react-native-pdf-jsi
npm install @react-native-async-storage/async-storage
```

### Step 3: Activate License

```javascript
import { activateLicense } from 'react-native-pdf-jsi/src/license';

// Activate once in your app (e.g., App.js)
useEffect(() => {
    async function initLicense() {
        try {
            await activateLicense('YOUR-LICENSE-KEY-HERE');
            console.log('✅ Pro features activated!');
        } catch (error) {
            console.error('License activation failed:', error.message);
        }
    }
    initLicense();
}, []);
```

### Step 4: Use Pro Features

```javascript
import { useExport, ExportFormat } from 'react-native-pdf-jsi/src/export';
import { useBookmarks } from 'react-native-pdf-jsi/src/bookmarks';

// Pro features now work!
const { exportToImages } = useExport(filePath);
await exportToImages({ format: ExportFormat.JPEG }); // ✅ Works!

const { createBookmark } = useBookmarks(pdfId);
await createBookmark({ 
    page: 5, 
    name: 'Chapter 3',
    color: '#FFD700'  // ✅ Colors work with Pro!
});
```

---

## 🔑 License Key Format

```
Format: XXXX-XXXX-XXXX-XXXX
Example: S7F2-9B4E-C1D8-3K5M

Structure:
├─ Part 1 (4 chars): Tier identifier + random
│  ├─ S = Solo Developer ($99/year)
│  ├─ P = Professional ($399/year)
│  ├─ T = Team ($1,999/year)
│  └─ E = Enterprise (custom)
├─ Part 2 (4 chars): Random identifier
├─ Part 3 (4 chars): Random identifier
└─ Part 4 (4 chars): Checksum + signature
```

---

## 🛡️ License Validation

### Three-Layer Security:

**Layer 1: Format Validation**
- Checks key format (XXXX-XXXX-XXXX-XXXX)
- Fast, offline check
- Prevents basic errors

**Layer 2: Signature Validation**
- Verifies cryptographic signature
- Offline validation
- Prevents simple tampering

**Layer 3: Server Validation** (Optional)
- Calls validation API
- Checks expiration
- Monitors usage
- Can revoke keys

### Validation Flow:

```
User activates license
    ↓
Format check (offline)
    ↓
Signature check (offline)
    ↓
Server validation (online)
    ↓
✅ Pro features unlocked!
```

---

## 📖 API Reference

### activateLicense(licenseKey)

Activate Pro features with a license key.

```javascript
import { activateLicense } from 'react-native-pdf-jsi/src/license';

try {
    const result = await activateLicense('S7F2-9B4E-C1D8-3K5M');
    console.log('Activated:', result.tier);
    console.log('Expires:', result.expiresAt);
} catch (error) {
    console.error('Activation failed:', error.message);
}
```

---

### isProActive()

Check if Pro features are currently active.

```javascript
import { isProActive } from 'react-native-pdf-jsi/src/license';

if (isProActive()) {
    console.log('✅ Pro features available');
} else {
    console.log('⏳ Free tier only');
}
```

---

### getLicenseInfo()

Get detailed license information.

```javascript
import { getLicenseInfo } from 'react-native-pdf-jsi/src/license';

const info = getLicenseInfo();
console.log('Active:', info.isActive);
console.log('Tier:', info.tier);
console.log('Expires:', info.expiresAt);
console.log('Features:', info.features);
```

---

### LicenseManager Methods

```javascript
import licenseManager from 'react-native-pdf-jsi/src/license';

// Check if specific feature is available
if (licenseManager.hasFeature(ProFeature.EXPORT_IMAGES)) {
    // Show export to images option
}

// Require Pro (throws error if not active)
try {
    licenseManager.requirePro('Export to Images');
    // Proceed with feature
} catch (error) {
    // Show upgrade prompt
    Alert.alert('Pro Required', error.message);
}

// Deactivate license
await licenseManager.deactivate();
```

---

## 🎨 UI Components

### LicensePrompt

Modal that shows when user tries to access Pro feature.

```javascript
import { LicensePrompt } from 'react-native-pdf-jsi/src/license';

<LicensePrompt
    visible={showPrompt}
    featureName="Export to Images"
    onClose={() => setShowPrompt(false)}
    onUpgrade={() => {
        // Navigate to purchase page
    }}
/>
```

---

### ProBadge

Small badge to mark Pro features in UI.

```javascript
import { ProBadge } from 'react-native-pdf-jsi/src/license';

<View style={{flexDirection: 'row'}}>
    <Text>Export to Images</Text>
    <ProBadge />
</View>
```

---

### FeatureGate

Wrapper component that shows/hides features based on license.

```javascript
import { FeatureGate } from 'react-native-pdf-jsi/src/license';

<FeatureGate 
    feature={ProFeature.EXPORT_IMAGES}
    featureName="Export to Images"
>
    {/* This content only shows if Pro is active */}
    <ExportToImagesButton />
</FeatureGate>
```

---

## 🐛 Error Handling

### License Required Error

```javascript
try {
    await exportToImages(filePath);
} catch (error) {
    if (error.code === 'LICENSE_REQUIRED') {
        // Show upgrade prompt
        Alert.alert(
            'Pro Feature',
            error.message,
            [
                { text: 'Cancel' },
                { text: 'Get Pro', onPress: () => navigateToPricing() }
            ]
        );
    }
}
```

### License Expired Error

```javascript
try {
    await exportToImages(filePath);
} catch (error) {
    if (error.code === 'LICENSE_EXPIRED') {
        // Show renewal prompt
        Alert.alert('License Expired', error.message);
    }
}
```

---

## 🔒 Security FAQ

### Q: Can users bypass the license check?

**A:** Technically yes, but:
- Requires modifying code (illegal under Commercial License)
- Server validation makes it harder
- Legal recourse available for violations
- Most developers are honest
- $99/year is cheap enough to just pay

### Q: What if someone shares their license key?

**A:** We can:
- Track usage per key
- Detect unusual patterns
- Revoke abused keys
- Issue new key to legitimate user
- Terms prohibit key sharing

### Q: What if validation server is down?

**A:** Graceful degradation:
- Offline validation allows usage
- Features continue working
- Online validation retries later
- Users not affected by server issues

---

## 📊 Monitoring & Analytics

### Track License Usage

```javascript
// On your validation server, log:
{
    licenseKey: 'S7F2-...',
    timestamp: '2025-01-15T10:30:00Z',
    platform: 'android',
    packageVersion: '2.3.0',
    appId: 'com.yourapp.example'
}

// Analyze to:
// - Detect key sharing (same key, many appIds)
// - Monitor usage patterns
// - Identify popular features
// - Track version adoption
```

---

## 💡 Best Practices

### 1. Activate Early

```javascript
// Activate in App.js (root component)
useEffect(() => {
    activateLicense(savedKey);
}, []);
```

### 2. Handle Errors Gracefully

```javascript
// Don't crash if activation fails
try {
    await activateLicense(key);
} catch (error) {
    console.warn('License activation failed:', error);
    // App continues in free mode
}
```

### 3. Save License Persistently

```javascript
// LicenseManager automatically saves to AsyncStorage
// But you can also save in your own storage
await activateLicense(key);
await yourStorage.save('licenseKey', key);
```

### 4. Check Before Using Pro Features

```javascript
// Option A: Try-catch
try {
    await exportToImages();
} catch (error) {
    if (error.code === 'LICENSE_REQUIRED') {
        // Show upgrade prompt
    }
}

// Option B: Pre-check
if (licenseManager.isProActive()) {
    await exportToImages();
} else {
    // Show upgrade prompt
}
```

---

## 🎯 Integration Example

### Complete App Setup

```javascript
// App.js

import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { activateLicense, isProActive } from 'react-native-pdf-jsi/src/license';

export default function App() {
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        initializeLicense();
    }, []);

    const initializeLicense = async () => {
        // Get saved license key (from your storage)
        const savedKey = await getUserLicenseKey();

        if (savedKey) {
            try {
                await activateLicense(savedKey);
                setIsPro(true);
                console.log('✅ Pro activated!');
            } catch (error) {
                console.warn('License activation failed:', error);
                setIsPro(false);
            }
        }
    };

    return (
        <View style={{flex: 1}}>
            <Text>License Status: {isPro ? '✅ Pro' : '⏳ Free'}</Text>
            {/* Rest of your app */}
        </View>
    );
}
```

---

## 📞 Support

### License Issues

Email: punithm300@gmail.com

Include:
- License key (first 8 characters only)
- Error message
- Platform (iOS/Android)
- Package version

### Purchase License

Visit: https://github.com/126punith/react-native-enhanced-pdf#pricing  
Email: punithm300@gmail.com

---

**Built with ❤️ by Punith M**

