package org.wonday.pdf;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.pdf.PdfRenderer;
import android.os.ParcelFileDescriptor;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Date;
import java.util.Locale;
import java.text.SimpleDateFormat;
import android.graphics.pdf.PdfDocument;

public class PDFExporter extends ReactContextBaseJavaModule {
    private static final String TAG = "PDFExporter";
    private LicenseVerifier licenseVerifier;

    public PDFExporter(ReactApplicationContext reactContext) {
        super(reactContext);
        licenseVerifier = new LicenseVerifier(reactContext);
    }

    @Override
    public String getName() {
        return "PDFExporter";
    }

    /**
     * Generate a unique filename with timestamp to prevent overwrites
     * @param baseName Base filename without extension
     * @param pageNum Page number (or -1 for PDF operations)
     * @param extension File extension (png, jpeg, pdf)
     * @return Filename with timestamp (e.g., "filename_page_1_20251102_181059.png")
     */
    private String generateTimestampedFileName(String baseName, int pageNum, String extension) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US);
        String timestamp = sdf.format(new Date());
        
        if (pageNum >= 0) {
            // For image exports: filename_page_1_20251102_181059.png
            return baseName + "_page_" + pageNum + "_" + timestamp + "." + extension;
        } else {
            // For PDF operations: filename_20251102_181059.pdf
            return baseName + "_" + timestamp + "." + extension;
        }
    }

    
    @ReactMethod
    public void exportToImages(String filePath, ReadableMap options, Promise promise) {
        try {
            if (!licenseVerifier.isProActive()) {
                promise.reject("LICENSE_REQUIRED", "Export to Images requires a Pro license");
                return;
            }

            if (filePath == null || filePath.isEmpty()) {
                promise.reject("INVALID_PATH", "File path is required");
                return;
            }

            File pdfFile = new File(filePath);
            if (!pdfFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "PDF file not found: " + filePath);
                return;
            }

            ReadableArray pages = options.hasKey("pages") ? options.getArray("pages") : null;
            int dpi = options.hasKey("dpi") ? options.getInt("dpi") : 150;
            String format = options.hasKey("format") ? options.getString("format") : "png";
            String outputDir = options.hasKey("outputDir") ? options.getString("outputDir") : null;

            List<String> exportedFiles = exportPagesToImages(pdfFile, pages, dpi, format, outputDir);

            WritableArray result = Arguments.createArray();
            for (String file : exportedFiles) {
                result.pushString(file);
            }

            promise.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Error exporting to images", e);
            promise.reject("EXPORT_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void exportPageToImage(String filePath, int pageIndex, ReadableMap options, Promise promise) {
        try {
            String format = options.hasKey("format") ? options.getString("format") : "jpeg";
            double quality = options.hasKey("quality") ? options.getDouble("quality") : 0.9;
            double scale = options.hasKey("scale") ? options.getDouble("scale") : 2.0;
            
            Log.i(TAG, "🖼️ [EXPORT] exportPageToImage - START - page: " + pageIndex + ", format: " + format + ", quality: " + quality + ", scale: " + scale);
            
            boolean licenseActive = licenseVerifier.isProActive();
            Log.i(TAG, "🔑 [LICENSE] isProActive: " + licenseActive);
            
            if (!licenseActive) {
                Log.e(TAG, "❌ [EXPORT] exportPageToImage - FAILED - License required");
                promise.reject("LICENSE_REQUIRED", "Export to Images requires a Pro license");
                return;
            }

            if (filePath == null || filePath.isEmpty()) {
                Log.e(TAG, "❌ [EXPORT] exportPageToImage - FAILED - Invalid path");
                promise.reject("INVALID_PATH", "File path is required");
                return;
            }

            File pdfFile = new File(filePath);
            Log.i(TAG, "📁 [FILE] PDF path: " + filePath);
            
            if (!pdfFile.exists()) {
                Log.e(TAG, "❌ [FILE] PDF not found: " + filePath);
                promise.reject("FILE_NOT_FOUND", "PDF file not found: " + filePath);
                return;
            }
            
            Log.i(TAG, "📁 [FILE] PDF exists, size: " + pdfFile.length() + " bytes");
            
            int dpi = (int)(72 * scale);
            Log.i(TAG, "🖼️ [EXPORT] Calculated DPI: " + dpi);
            
            String outputPath = exportSinglePageToImage(pdfFile, pageIndex, dpi, format, null);
            
            Log.i(TAG, "✅ [EXPORT] exportPageToImage - SUCCESS - output: " + outputPath);
            promise.resolve(outputPath);

        } catch (Exception e) {
            Log.e(TAG, "❌ [EXPORT] exportPageToImage - ERROR: " + e.getMessage(), e);
            promise.reject("EXPORT_ERROR", e.getMessage());
        }
    }

    private String exportSinglePageToImage(File pdfFile, int pageIndex, int dpi, String format, String outputDir) throws IOException {
        Log.i(TAG, "🖼️ [EXPORT] exportSinglePageToImage - START - pageIndex: " + pageIndex + ", dpi: " + dpi + ", format: " + format);
        
        try (ParcelFileDescriptor fileDescriptor = ParcelFileDescriptor.open(pdfFile, ParcelFileDescriptor.MODE_READ_ONLY);
             PdfRenderer pdfRenderer = new PdfRenderer(fileDescriptor)) {

            int totalPages = pdfRenderer.getPageCount();
            Log.i(TAG, "📁 [FILE] PDF opened, total pages: " + totalPages);
            
            if (pageIndex < 0 || pageIndex >= totalPages) {
                Log.e(TAG, "❌ [EXPORT] Invalid page index: " + pageIndex + " (total: " + totalPages + ")");
                throw new IOException("Invalid page index: " + pageIndex);
            }

            PdfRenderer.Page page = pdfRenderer.openPage(pageIndex);
            Log.i(TAG, "📄 [PAGE] Opened page " + (pageIndex + 1));
            
            int width = (int)(page.getWidth() * dpi / 72);
            int height = (int)(page.getHeight() * dpi / 72);
            
            Log.i(TAG, "🖼️ [BITMAP] Creating bitmap - width: " + width + "px, height: " + height + "px, dpi: " + dpi);
            
            Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            canvas.drawColor(Color.WHITE);
            
            Bitmap renderBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
            Log.i(TAG, "🖼️ [RENDER] Rendering page to bitmap...");
            page.render(renderBitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_PRINT);
            canvas.drawBitmap(renderBitmap, 0, 0, null);
            renderBitmap.recycle();
            
            page.close();
            Log.i(TAG, "✅ [RENDER] Page rendered successfully");

            if (outputDir == null) {
                outputDir = getReactApplicationContext().getCacheDir().getAbsolutePath();
                Log.i(TAG, "📁 [FILE] Using cache dir: " + outputDir);
            }

            // Generate unique filename with timestamp to prevent overwrites
            String baseName = pdfFile.getName().replace(".pdf", "");
            String fileName = generateTimestampedFileName(baseName, pageIndex + 1, format);
            File outputFile = new File(outputDir, fileName);
            
            Log.i(TAG, "📁 [FILE] Writing to: " + outputFile.getAbsolutePath());
            
            try (FileOutputStream out = new FileOutputStream(outputFile)) {
                Bitmap.CompressFormat compressFormat = format.equalsIgnoreCase("png") 
                    ? Bitmap.CompressFormat.PNG 
                    : Bitmap.CompressFormat.JPEG;
                int qualityPercent = format.equalsIgnoreCase("png") ? 100 : 90;
                
                Log.i(TAG, "📁 [FILE] Compressing as " + compressFormat + " at " + qualityPercent + "% quality");
                bitmap.compress(compressFormat, qualityPercent, out);
            }
            
            bitmap.recycle();
            
            long fileSize = outputFile.length();
            Log.i(TAG, "✅ [EXPORT] exportSinglePageToImage - SUCCESS - size: " + fileSize + " bytes, path: " + outputFile.getAbsolutePath());
            return outputFile.getAbsolutePath();
        }
    }

    
    private List<String> exportPagesToImages(File pdfFile, ReadableArray pages, int dpi, String format, String outputDir) throws IOException {
        Log.i(TAG, "🖼️ [EXPORT] exportPagesToImages - START - dpi: " + dpi + ", format: " + format);
        
        List<String> exportedFiles = new ArrayList<>();
        
        try (ParcelFileDescriptor fileDescriptor = ParcelFileDescriptor.open(pdfFile, ParcelFileDescriptor.MODE_READ_ONLY);
             PdfRenderer pdfRenderer = new PdfRenderer(fileDescriptor)) {

            int pageCount = pdfRenderer.getPageCount();
            Log.i(TAG, "📁 [FILE] PDF has " + pageCount + " total pages");

            List<Integer> pagesToExport = new ArrayList<>();
            if (pages != null && pages.size() > 0) {
                for (int i = 0; i < pages.size(); i++) {
                    int pageIndex = pages.getInt(i);
                    if (pageIndex >= 0 && pageIndex < pageCount) {
                        pagesToExport.add(pageIndex);
                    }
                }
                Log.i(TAG, "📊 [PROGRESS] Exporting " + pagesToExport.size() + " specific pages");
            } else {
                for (int i = 0; i < pageCount; i++) {
                    pagesToExport.add(i);
                }
                Log.i(TAG, "📊 [PROGRESS] Exporting all " + pageCount + " pages");
            }

            int current = 0;
            for (int pageIndex : pagesToExport) {
                try {
                    current++;
                    Log.i(TAG, "📊 [PROGRESS] Exporting page " + current + "/" + pagesToExport.size() + " (page number: " + (pageIndex + 1) + ")");
                    
                    PdfRenderer.Page page = pdfRenderer.openPage(pageIndex);
                    
                    float scale = dpi / 72f; // 72 DPI is default
                    int width = (int) (page.getWidth() * scale);
                    int height = (int) (page.getHeight() * scale);

                    Log.i(TAG, "🖼️ [BITMAP] Creating " + width + "x" + height + " bitmap");
                    
                    Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
                    Canvas canvas = new Canvas(bitmap);
                    canvas.drawColor(Color.WHITE);

                    page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);

                    String fileName = String.format("page_%d.%s", pageIndex + 1, format);
                    String outputPath = saveBitmap(bitmap, fileName, outputDir);
                    exportedFiles.add(outputPath);

                    bitmap.recycle();
                    page.close();

                    Log.i(TAG, "✅ [PROGRESS] Page " + (pageIndex + 1) + " exported to " + outputPath);

                } catch (Exception e) {
                    Log.e(TAG, "❌ [EXPORT] Error exporting page " + (pageIndex + 1), e);
                }
            }
            
            Log.i(TAG, "✅ [EXPORT] exportPagesToImages - SUCCESS - Exported " + exportedFiles.size() + " pages");
        }

        return exportedFiles;
    }

    
    private String saveBitmap(Bitmap bitmap, String fileName, String outputDir) throws IOException {
        File outputFile;
        
        if (outputDir != null && !outputDir.isEmpty()) {
            File dir = new File(outputDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            outputFile = new File(dir, fileName);
        } else {
            File cacheDir = getReactApplicationContext().getCacheDir();
            outputFile = new File(cacheDir, fileName);
        }

        try (FileOutputStream out = new FileOutputStream(outputFile)) {
            if (fileName.toLowerCase().endsWith(".png")) {
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
            } else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) {
                bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out);
            } else {
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
            }
        }

        return outputFile.getAbsolutePath();
    }

    
    @ReactMethod
    public void mergePDFs(ReadableArray filePaths, String outputPath, Promise promise) {
        try {
            // Check Pro license
            if (!licenseVerifier.isProActive()) {
                promise.reject("LICENSE_REQUIRED", "PDF Operations requires a Pro license");
                return;
            }

            if (filePaths == null || filePaths.size() < 2) {
                promise.reject("INVALID_INPUT", "At least 2 PDF files are required for merging");
                return;
            }

            // Validate all files exist
            List<String> validPaths = new ArrayList<>();
            for (int i = 0; i < filePaths.size(); i++) {
                String filePath = filePaths.getString(i);
                File file = new File(filePath);
                if (file.exists()) {
                    validPaths.add(filePath);
                } else {
                    Log.w(TAG, "File not found: " + filePath);
                }
            }

            if (validPaths.size() < 2) {
                promise.reject("INVALID_INPUT", "At least 2 valid PDF files are required");
                return;
            }

            // Determine output path
            if (outputPath == null || outputPath.isEmpty()) {
                File firstFile = new File(validPaths.get(0));
                outputPath = new File(firstFile.getParent(), "merged_" + System.currentTimeMillis() + ".pdf").getAbsolutePath();
            }

            // Merge PDFs using PdfRenderer and PdfDocument
            PdfDocument mergedDoc = new PdfDocument();
            int pageCount = 0;

            for (String filePath : validPaths) {
                try (ParcelFileDescriptor fileDescriptor = ParcelFileDescriptor.open(new File(filePath), ParcelFileDescriptor.MODE_READ_ONLY);
                     PdfRenderer pdfRenderer = new PdfRenderer(fileDescriptor)) {

                    int srcPageCount = pdfRenderer.getPageCount();
                    
                    for (int i = 0; i < srcPageCount; i++) {
                        PdfRenderer.Page page = pdfRenderer.openPage(i);
                        
                        // Create new page in merged document
                        PdfDocument.PageInfo pageInfo = new PdfDocument.PageInfo.Builder(
                            page.getWidth(), 
                            page.getHeight(), 
                            pageCount + 1
                        ).create();
                        
                        PdfDocument.Page newPage = mergedDoc.startPage(pageInfo);
                        Canvas canvas = newPage.getCanvas();
                        
                        // Render page to bitmap first, then draw on canvas
                        Bitmap bitmap = Bitmap.createBitmap(page.getWidth(), page.getHeight(), Bitmap.Config.ARGB_8888);
                        page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_PRINT);
                        canvas.drawBitmap(bitmap, 0, 0, null);
                        bitmap.recycle();
                        
                        mergedDoc.finishPage(newPage);
                        page.close();
                        pageCount++;
                    }
                }
            }

            // Write merged PDF
            try (FileOutputStream outputStream = new FileOutputStream(outputPath)) {
                mergedDoc.writeTo(outputStream);
            }

            mergedDoc.close();

            Log.i(TAG, "Merged " + validPaths.size() + " PDFs with " + pageCount + " pages to: " + outputPath);
            promise.resolve(outputPath);

        } catch (Exception e) {
            Log.e(TAG, "Error merging PDFs", e);
            promise.reject("MERGE_ERROR", e.getMessage());
        }
    }

    
    @ReactMethod
    public void splitPDF(String filePath, ReadableArray pageRanges, String outputDir, Promise promise) {
        try {
            // 🔍 DEEP DEBUG: Inspect incoming parameters
            Log.i(TAG, "🔍 [DEBUG] ========== SPLIT PDF DEBUG START ==========");
            Log.i(TAG, "🔍 [DEBUG] filePath type: " + (filePath != null ? filePath.getClass().getName() : "null"));
            Log.i(TAG, "🔍 [DEBUG] filePath value: " + filePath);
            Log.i(TAG, "🔍 [DEBUG] pageRanges type: " + (pageRanges != null ? pageRanges.getClass().getName() : "null"));
            Log.i(TAG, "🔍 [DEBUG] pageRanges size: " + (pageRanges != null ? pageRanges.size() : "null"));
            Log.i(TAG, "🔍 [DEBUG] outputDir type: " + (outputDir != null ? outputDir.getClass().getName() : "null"));
            Log.i(TAG, "🔍 [DEBUG] outputDir value: " + outputDir);
            
            // Inspect each element in pageRanges
            if (pageRanges != null) {
                for (int i = 0; i < pageRanges.size(); i++) {
                    try {
                        Log.i(TAG, "🔍 [DEBUG] pageRanges[" + i + "] type: " + pageRanges.getType(i));
                        
                        // Try to get as array
                        try {
                            ReadableArray range = pageRanges.getArray(i);
                            Log.i(TAG, "🔍 [DEBUG] pageRanges[" + i + "] is Array, size: " + range.size());
                            if (range.size() >= 2) {
                                Log.i(TAG, "🔍 [DEBUG] pageRanges[" + i + "][0] = " + range.getInt(0));
                                Log.i(TAG, "🔍 [DEBUG] pageRanges[" + i + "][1] = " + range.getInt(1));
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "🔍 [DEBUG] pageRanges[" + i + "] NOT an array: " + e.getMessage());
                        }
                        
                        // Try to get as map
                        try {
                            ReadableMap rangeMap = pageRanges.getMap(i);
                            Log.i(TAG, "🔍 [DEBUG] pageRanges[" + i + "] is Map");
                            if (rangeMap.hasKey("start") && rangeMap.hasKey("end")) {
                                Log.i(TAG, "🔍 [DEBUG] pageRanges[" + i + "].start = " + rangeMap.getInt("start"));
                                Log.i(TAG, "🔍 [DEBUG] pageRanges[" + i + "].end = " + rangeMap.getInt("end"));
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "🔍 [DEBUG] pageRanges[" + i + "] NOT a map: " + e.getMessage());
                        }
                        
                    } catch (Exception e) {
                        Log.e(TAG, "🔍 [DEBUG] Error inspecting pageRanges[" + i + "]: " + e.getMessage());
                    }
                }
            }
            
            Log.i(TAG, "🔍 [DEBUG] ========== SPLIT PDF DEBUG END ==========");
            
            // Original code continues...
            Log.i(TAG, "✂️ [SPLIT] splitPDF - START - file: " + filePath + ", ranges: " + pageRanges.size());
            
            // Check Pro license
            boolean licenseActive = licenseVerifier.isProActive();
            Log.i(TAG, "🔑 [LICENSE] isProActive: " + licenseActive);
            
            if (!licenseActive) {
                Log.e(TAG, "❌ [SPLIT] License required");
                promise.reject("LICENSE_REQUIRED", "PDF Operations requires a Pro license");
                return;
            }

            if (filePath == null || filePath.isEmpty()) {
                Log.e(TAG, "❌ [SPLIT] Invalid path");
                promise.reject("INVALID_PATH", "File path is required");
                return;
            }

            File pdfFile = new File(filePath);
            if (!pdfFile.exists()) {
                Log.e(TAG, "❌ [FILE] PDF not found: " + filePath);
                promise.reject("FILE_NOT_FOUND", "PDF file not found: " + filePath);
                return;
            }
            
            Log.i(TAG, "📁 [FILE] PDF exists, size: " + pdfFile.length() + " bytes");

            // Use provided outputDir or default to cache directory
            if (outputDir == null || outputDir.isEmpty()) {
                outputDir = getReactApplicationContext().getCacheDir().getAbsolutePath();
            }
            Log.i(TAG, "📁 [FILE] Output directory: " + outputDir);
            
            List<String> splitFiles = new ArrayList<>();

            try (ParcelFileDescriptor fileDescriptor = ParcelFileDescriptor.open(pdfFile, ParcelFileDescriptor.MODE_READ_ONLY);
                 PdfRenderer pdfRenderer = new PdfRenderer(fileDescriptor)) {

                int totalPages = pdfRenderer.getPageCount();
                Log.i(TAG, "📁 [FILE] PDF opened, total pages: " + totalPages);

                // Parse page ranges from flat array: [start1, end1, start2, end2, ...]
                // Example: [1, 10, 11, 21] means ranges 1-10 and 11-21
                int rangeCount = pageRanges.size() / 2;
                Log.i(TAG, "📊 [PROGRESS] Processing " + rangeCount + " ranges from flat array");
                
                for (int i = 0; i < pageRanges.size(); i += 2) {
                    if (i + 1 >= pageRanges.size()) {
                        Log.w(TAG, "⚠️ [SPLIT] Skipping incomplete range at index " + i);
                        continue;
                    }

                    int start = pageRanges.getInt(i) - 1; // Convert to 0-indexed
                    int end = pageRanges.getInt(i + 1); // End is inclusive, 1-indexed

                    int rangeNum = (i / 2) + 1;
                    Log.i(TAG, "📊 [PROGRESS] Processing range " + rangeNum + "/" + rangeCount + ": pages " + (start + 1) + "-" + end);

                    // Validate range
                    if (start < 0 || end > totalPages || start >= end) {
                        Log.w(TAG, "⚠️ [SPLIT] Invalid range: [" + (start + 1) + ", " + end + "]");
                        continue;
                    }

                    // Create split PDF for this range with timestamped filename
                    PdfDocument splitDoc = new PdfDocument();
                    String baseName = pdfFile.getName().replace(".pdf", "") + "_pages_" + (start + 1) + "-" + end;
                    String fileName = generateTimestampedFileName(baseName, -1, "pdf");
                    String outputFile = new File(outputDir, fileName).getAbsolutePath();

                    Log.i(TAG, "📁 [FILE] Creating split file: " + outputFile);

                    int pageNum = 1;
                    for (int page = start; page < end && page < totalPages; page++) {
                        Log.i(TAG, "📊 [PROGRESS] Processing page " + (page + 1) + " (page " + pageNum + " in new PDF)");
                        
                        PdfRenderer.Page srcPage = pdfRenderer.openPage(page);

                        PdfDocument.PageInfo pageInfo = new PdfDocument.PageInfo.Builder(
                            srcPage.getWidth(), 
                            srcPage.getHeight(), 
                            pageNum++
                        ).create();

                        PdfDocument.Page newPage = splitDoc.startPage(pageInfo);
                        Canvas canvas = newPage.getCanvas();
                        
                        // Render page to bitmap first, then draw on canvas
                        Bitmap bitmap = Bitmap.createBitmap(srcPage.getWidth(), srcPage.getHeight(), Bitmap.Config.ARGB_8888);
                        srcPage.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_PRINT);
                        canvas.drawBitmap(bitmap, 0, 0, null);
                        bitmap.recycle();

                        splitDoc.finishPage(newPage);
                        srcPage.close();
                    }

                    // Write split PDF
                    try (FileOutputStream outputStream = new FileOutputStream(outputFile)) {
                        splitDoc.writeTo(outputStream);
                    }

                    splitDoc.close();
                    splitFiles.add(outputFile);
                    
                    File createdFile = new File(outputFile);
                    Log.i(TAG, "✅ [SPLIT] Created file: " + outputFile + " (size: " + createdFile.length() + " bytes)");
                }
            }

            Log.i(TAG, "✅ [SPLIT] splitPDF - SUCCESS - Split into " + splitFiles.size() + " files");
            
            // Convert ArrayList to WritableArray for React Native bridge
            WritableArray result = Arguments.createArray();
            for (String file : splitFiles) {
                result.pushString(file);
            }
            promise.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "❌ [SPLIT] Error: " + e.getMessage(), e);
            promise.reject("SPLIT_ERROR", e.getMessage());
        }
    }

    
    @ReactMethod
    public void extractPages(String filePath, ReadableArray pageNumbers, String outputPath, Promise promise) {
        try {
            Log.i(TAG, "✂️ [EXTRACT] extractPages - START - file: " + filePath + ", pages: " + pageNumbers.size());
            
            // Check Pro license
            boolean licenseActive = licenseVerifier.isProActive();
            Log.i(TAG, "🔑 [LICENSE] isProActive: " + licenseActive);
            
            if (!licenseActive) {
                Log.e(TAG, "❌ [EXTRACT] License required");
                promise.reject("LICENSE_REQUIRED", "PDF Operations requires a Pro license");
                return;
            }

            if (filePath == null || filePath.isEmpty()) {
                Log.e(TAG, "❌ [EXTRACT] Invalid path");
                promise.reject("INVALID_PATH", "File path is required");
                return;
            }

            File pdfFile = new File(filePath);
            if (!pdfFile.exists()) {
                Log.e(TAG, "❌ [FILE] PDF not found: " + filePath);
                promise.reject("FILE_NOT_FOUND", "PDF file not found: " + filePath);
                return;
            }
            
            Log.i(TAG, "📁 [FILE] PDF exists, size: " + pdfFile.length() + " bytes");

            // Determine output path with timestamped filename
            if (outputPath == null || outputPath.isEmpty()) {
                String baseName = pdfFile.getName().replace(".pdf", "") + "_extracted";
                String fileName = generateTimestampedFileName(baseName, -1, "pdf");
                outputPath = new File(pdfFile.getParent(), fileName).getAbsolutePath();
            }
            
            Log.i(TAG, "📁 [FILE] Output path: " + outputPath);
            
            // Log page numbers to extract
            StringBuilder pageList = new StringBuilder();
            for (int i = 0; i < pageNumbers.size(); i++) {
                if (i > 0) pageList.append(", ");
                pageList.append(pageNumbers.getInt(i));
            }
            Log.i(TAG, "📊 [EXTRACT] Pages to extract: " + pageList.toString());

            try (ParcelFileDescriptor fileDescriptor = ParcelFileDescriptor.open(pdfFile, ParcelFileDescriptor.MODE_READ_ONLY);
                 PdfRenderer pdfRenderer = new PdfRenderer(fileDescriptor)) {

                int totalPages = pdfRenderer.getPageCount();
                Log.i(TAG, "📁 [FILE] PDF opened, total pages: " + totalPages);
                
                PdfDocument extractDoc = new PdfDocument();
                int pageNum = 1;
                int extractedCount = 0;

                for (int i = 0; i < pageNumbers.size(); i++) {
                    int pageIndex = pageNumbers.getInt(i) - 1; // Convert to 0-indexed

                    Log.i(TAG, "📊 [PROGRESS] Processing page " + (i + 1) + "/" + pageNumbers.size() + " (page number: " + (pageIndex + 1) + ")");

                    if (pageIndex >= 0 && pageIndex < totalPages) {
                        PdfRenderer.Page srcPage = pdfRenderer.openPage(pageIndex);

                        PdfDocument.PageInfo pageInfo = new PdfDocument.PageInfo.Builder(
                            srcPage.getWidth(), 
                            srcPage.getHeight(), 
                            pageNum++
                        ).create();

                        PdfDocument.Page newPage = extractDoc.startPage(pageInfo);
                        Canvas canvas = newPage.getCanvas();
                        
                        // Render page to bitmap first, then draw on canvas
                        Bitmap bitmap = Bitmap.createBitmap(srcPage.getWidth(), srcPage.getHeight(), Bitmap.Config.ARGB_8888);
                        srcPage.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_PRINT);
                        canvas.drawBitmap(bitmap, 0, 0, null);
                        bitmap.recycle();

                        extractDoc.finishPage(newPage);
                        srcPage.close();
                        extractedCount++;
                        
                        Log.i(TAG, "✅ [PROGRESS] Extracted page " + (pageIndex + 1));
                    } else {
                        Log.w(TAG, "⚠️ [EXTRACT] Skipping invalid page index: " + (pageIndex + 1));
                    }
                }

                // Write extracted PDF
                Log.i(TAG, "📁 [FILE] Writing extracted PDF...");
                try (FileOutputStream outputStream = new FileOutputStream(outputPath)) {
                    extractDoc.writeTo(outputStream);
                }

                extractDoc.close();
                
                File createdFile = new File(outputPath);
                Log.i(TAG, "✅ [EXTRACT] extractPages - SUCCESS - Extracted " + extractedCount + " pages to: " + outputPath + " (size: " + createdFile.length() + " bytes)");
            }

            promise.resolve(outputPath);

        } catch (Exception e) {
            Log.e(TAG, "❌ [EXTRACT] Error: " + e.getMessage(), e);
            promise.reject("EXTRACT_ERROR", e.getMessage());
        }
    }

    
    @ReactMethod
    public void rotatePage(String filePath, int pageNumber, int degrees, Promise promise) {
        try {
            // Check Pro license
            if (!licenseVerifier.isProActive()) {
                promise.reject("LICENSE_REQUIRED", "PDF Operations requires a Pro license");
                return;
            }

            if (filePath == null || filePath.isEmpty()) {
                promise.reject("INVALID_PATH", "File path is required");
                return;
            }

            promise.reject("NOT_IMPLEMENTED", "Page rotation not yet implemented on Android");

        } catch (Exception e) {
            Log.e(TAG, "Error rotating page", e);
            promise.reject("ROTATE_ERROR", e.getMessage());
        }
    }

    
    @ReactMethod
    public void deletePage(String filePath, int pageNumber, Promise promise) {
        try {
            // Check Pro license
            if (!licenseVerifier.isProActive()) {
                promise.reject("LICENSE_REQUIRED", "PDF Operations requires a Pro license");
                return;
            }

            if (filePath == null || filePath.isEmpty()) {
                promise.reject("INVALID_PATH", "File path is required");
                return;
            }

            promise.reject("NOT_IMPLEMENTED", "Page deletion not yet implemented on Android");

        } catch (Exception e) {
            Log.e(TAG, "Error deleting page", e);
            promise.reject("DELETE_ERROR", e.getMessage());
        }
    }

    /**
     * Get PDF page count
     */
    @ReactMethod
    public void getPageCount(String filePath, Promise promise) {
        try {
            if (filePath == null || filePath.isEmpty()) {
                promise.reject("INVALID_PATH", "File path is required");
                return;
            }

            File pdfFile = new File(filePath);
            if (!pdfFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "PDF file not found: " + filePath);
                return;
            }

            try (ParcelFileDescriptor fileDescriptor = ParcelFileDescriptor.open(pdfFile, ParcelFileDescriptor.MODE_READ_ONLY);
                 PdfRenderer pdfRenderer = new PdfRenderer(fileDescriptor)) {
                
                int pageCount = pdfRenderer.getPageCount();
                promise.resolve(pageCount);
            }

        } catch (Exception e) {
            Log.e(TAG, "Error getting page count", e);
            promise.reject("PAGE_COUNT_ERROR", e.getMessage());
        }
    }
}