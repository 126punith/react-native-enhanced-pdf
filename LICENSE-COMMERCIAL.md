# Commercial License Agreement
## react-native-pdf-jsi Pro Tier

**Version:** 1.0  
**Effective Date:** January 2025  
**Licensor:** Punith M (punithm300@gmail.com)

---

## 1. GRANT OF LICENSE

Subject to the terms of this Agreement and payment of applicable license fees, Licensor grants you a non-exclusive, non-transferable license to use the following Pro features in your applications:

---

## 2. COVERED FEATURES (Paid Tier)

This Commercial License applies ONLY to the following features:

### 2.1 Enhanced Bookmarks
**Files:**
- `src/bookmarks/components/BookmarkEditor.js` (color picker functionality)
- `src/bookmarks/components/ReadingProgress.js` (progress visualization)
- `src/bookmarks/BookmarkManager.js` (analytics functions):
  - Color-coded bookmarks
  - Reading progress tracking with time spent
  - Session management
  - Reading statistics and analytics
  - Export/import with analytics data

**Description:** Advanced bookmark features including custom colors (10 color palette), detailed reading progress tracking, time-spent analytics, session management, reading speed calculation, and estimated time remaining.

---

### 2.2 Export to Images
**Files:**
- `src/export/ExportManager.js` (image export functions):
  - `exportToImages()`
  - `exportPageToImage()`
  - `exportPagesToImages()`
- `android/src/main/java/org/wonday/pdf/PDFExporter.java`
- `ios/RNPDFPdf/PDFExporter.h`
- `ios/RNPDFPdf/PDFExporter.m`

**Description:** Export PDF pages to high-quality JPEG or PNG images with configurable quality levels (Low, Medium, High, Best), custom scaling, and batch export capabilities.

---

### 2.3 PDF Operations
**Files:**
- `src/export/ExportManager.js` (PDF operation functions):
  - `mergePDFs()`
  - `splitPDF()`
  - `extractPages()`
  - `rotatePages()`
  - `deletePages()`
- `ios/RNPDFPdf/PDFExporter.m` (iOS PDF operations)

**Description:** Advanced PDF manipulation including merge multiple PDFs, split into ranges, extract specific pages, rotate pages, and delete unwanted pages. Full support on iOS, Android support planned.

---

### 2.4 Reading Analytics Dashboard
**Files:**
- `src/analytics/` (all files - when implemented)
- Reading statistics visualization
- Progress charts and graphs
- Insights and recommendations

**Description:** Comprehensive reading analytics with visual charts, reading speed analysis, page heatmaps, session history, and personalized reading insights.

---

### 2.5 Advanced Export Features
**Files:**
- Export with formatting options
- Batch export with progress tracking
- Quality presets and custom configurations
- Advanced share integration

**Description:** Professional export capabilities with fine-grained control over output quality, format, and batch operations.

---

## 3. LICENSE TIERS AND FEES

### 3.1 Solo Developer License
**Price:** $99 USD per year  
**Includes:**
- 1 developer seat
- Use in up to 5 applications
- All Pro features listed above
- Email support (48-hour response)
- Updates and bug fixes

### 3.2 Professional License
**Price:** $399 USD per year  
**Includes:**
- 1 developer seat
- Unlimited applications
- All Pro features
- Priority email support (24-hour response)
- Early access to new features

### 3.3 Team License
**Price:** $1,999 USD per year (5 seats)  
**Includes:**
- 5 developer seats
- Unlimited applications
- All Pro features
- White labeling option
- Priority support (12-hour response)
- Roadmap input

### 3.4 Enterprise License
**Price:** Custom (starting at $4,999 USD per year)  
**Includes:**
- Unlimited seats
- Unlimited applications
- All Pro features
- On-premise deployment option
- SLA guarantees
- Dedicated support
- Custom feature development

---

## 4. PAYMENT TERMS

4.1 License fees are billed annually in advance.

4.2 Payment via Stripe or as otherwise agreed.

4.3 License keys are delivered via email within 24 hours of payment.

4.4 Refunds available within 30 days of purchase if Pro features are not working as documented.

---

## 5. LICENSE ACTIVATION

5.1 After purchasing a license, you will receive a license key.

5.2 Activate the license in your application code:
   ```javascript
import { activateLicense } from 'react-native-pdf-jsi/src/license';
   await activateLicense('YOUR-LICENSE-KEY');
   ```

5.3 License keys are validated both offline and online.

5.4 Each license key is tied to your purchase and may be deactivated if misused.

---

## 6. RESTRICTIONS

You MAY:
✅ Use Pro features in your applications (personal or commercial)
✅ Deploy applications using Pro features to app stores
✅ Provide applications to your clients or customers
✅ Use on development, staging, and production environments

You MAY NOT:
❌ Redistribute the Pro feature source code
❌ Sublicense Pro features to others
❌ Remove or bypass license validation checks
❌ Create competing products using this code
❌ Share your license key with others
❌ Use on more applications/seats than licensed for

---

## 7. OWNERSHIP

7.1 Licensor (Punith M) retains all ownership rights to the Pro features.

7.2 This license grants you usage rights only, not ownership.

7.3 All intellectual property rights remain with Licensor.

---

## 8. UPDATES AND SUPPORT

8.1 License includes updates and bug fixes during the license period.

8.2 Major version updates may require license renewal.

8.3 Support is provided via email at the response time specified for your tier.

8.4 Support covers usage questions and bug reports, not custom development.

---

## 9. TERM AND TERMINATION

9.1 License is valid for one year from purchase date.

9.2 License must be renewed annually to continue using Pro features.

9.3 Licensor may terminate this license if you breach the terms.

9.4 Upon termination, you must cease using Pro features.

9.5 Applications already deployed may continue running, but you cannot deploy new versions using Pro features.

---

## 10. WARRANTY DISCLAIMER

THE PRO FEATURES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

---

## 11. LIMITATION OF LIABILITY

IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY SPECIAL, INCIDENTAL, INDIRECT, OR CONSEQUENTIAL DAMAGES WHATSOEVER ARISING OUT OF THE USE OF OR INABILITY TO USE THE PRO FEATURES.

---

## 12. ENFORCEMENT

12.1 Unauthorized use of Pro features constitutes copyright infringement.

12.2 Licensor reserves the right to:
- Deactivate license keys for violations
- Pursue legal action for unauthorized use
- Seek damages for commercial violations
- Issue DMCA takedown notices for pirated versions

12.3 License validation may be audited for compliance.

---

## 13. JURISDICTION

This Agreement is governed by the laws of India. Disputes shall be resolved in Bangalore, Karnataka, India.

---

## 14. ENTIRE AGREEMENT

This Agreement constitutes the entire agreement between you and Licensor regarding the Pro features and supersedes all prior agreements.

---

## 15. CONTACT

**Purchase License:**
Website: https://github.com/126punith/react-native-enhanced-pdf#pricing
Email: punithm300@gmail.com

**Technical Support:**
GitHub Issues: https://github.com/126punith/react-native-enhanced-pdf/issues
Email: punithm300@gmail.com

**Business Inquiries:**
Email: punithm300@gmail.com

---

## 16. ACCEPTANCE

By activating a license key, you agree to the terms of this Commercial License Agreement.

By using Pro features without a valid license, you are in violation of this Agreement and applicable copyright law.

---

**Licensor:**  
Punith M  
Email: punithm300@gmail.com  
GitHub: https://github.com/126punith

**Effective Date:** January 2025  
**Version:** 1.0
