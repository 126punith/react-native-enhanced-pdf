# MIT License (Free Tier)

Copyright (c) 2025 Punith M (punithm300@gmail.com) - Enhancements  
Copyright (c) 2017 Wonday (@wonday.org) - Original work

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## APPLIES TO (Free Tier Components):

### Core PDF Viewing (Original Wonday Code - MIT)
- `index.js` - Main PDF component
- `PdfView.js` - PDF view component
- `PdfManager.js` - PDF manager
- `PdfPageView.js` - Page view component
- `PdfViewFlatList.js` - FlatList integration
- `DoubleTapView.js` - Gesture handling
- `PinchZoomView.js` - Zoom handling
- All original native modules (Android, iOS, Windows)
- All original Wonday features and improvements

### Enhanced Features by Punith M (Also MIT for Free Tier)

**Advanced Search Engine:**
- `src/search/SearchEngine.js` - Core search engine
- `src/search/hooks/useSearch.js` - Search React hook
- `src/search/components/SearchBar.js` - Search UI component
- `src/search/utils/pdfPathResolver.js` - Path utilities
- All search functionality (fuzzy, boolean, regex)

**Native Text Extraction:**
- `src/utils/PDFTextExtractor.js` - JS bridge
- `android/src/main/java/org/wonday/pdf/PDFTextExtractor.java` - Android
- `ios/RNPDFPdf/PDFTextExtractor.h` - iOS header
- `ios/RNPDFPdf/PDFTextExtractor.m` - iOS implementation

**Basic Bookmarks:**
- `src/bookmarks/BookmarkManager.js` - Basic CRUD functions only:
  - `createBookmark()` - Basic bookmark creation (no colors)
  - `getBookmarks()` - Retrieve bookmarks
  - `updateBookmark()` - Update bookmark (name, notes only)
  - `deleteBookmark()` - Delete bookmark
  - `getBookmarksOnPage()` - Get bookmarks on page
  - `hasBookmarkOnPage()` - Check if page has bookmark

**Basic Export:**
- `src/export/ExportManager.js` - Text export functions only:
  - `exportToText()` - Export PDF to plain text
  - `exportPageToText()` - Export single page to text

**Utilities:**
- `src/utils/` - All utility functions
- Configuration files
- Type definitions
- Documentation (MIT portions)

---

## DOES NOT APPLY TO (See LICENSE-COMMERCIAL.md):

The following features require a separate commercial license:
- Enhanced Bookmarks (colors, analytics, progress tracking)
- Export to Images (JPEG, PNG)
- PDF Operations (merge, split, extract, rotate, delete)
- Reading Analytics Dashboard
- Advanced Export Features

---

## ATTRIBUTION

This project builds upon the excellent work of Wonday:
- Original: https://github.com/wonday/react-native-pdf
- Original License: MIT
- We thank Wonday for creating the foundation!

Enhancements and new features by Punith M (2025):
- JSI Integration (80x performance improvement)
- 16KB Google Play Compliance
- Advanced Search Engine
- Smart Bookmarks System
- Export & Conversion Features
- Native Text Extraction
- Reading Progress Tracking
- And more...

---

## USAGE

You may freely use, modify, and distribute the MIT-licensed components.

For paid features, please purchase a license at:
https://github.com/126punith/react-native-enhanced-pdf#pricing

---

For questions about licensing:
Email: punithm300@gmail.com
GitHub: https://github.com/126punith/react-native-enhanced-pdf
