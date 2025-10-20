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

    
    private List<String> exportPagesToImages(File pdfFile, ReadableArray pages, int dpi, String format, String outputDir) throws IOException {
        List<String> exportedFiles = new ArrayList<>();
        
        try (ParcelFileDescriptor fileDescriptor = ParcelFileDescriptor.open(pdfFile, ParcelFileDescriptor.MODE_READ_ONLY);
             PdfRenderer pdfRenderer = new PdfRenderer(fileDescriptor)) {

            int pageCount = pdfRenderer.getPageCount();
            Log.i(TAG, "PDF has " + pageCount + " pages");

            List<Integer> pagesToExport = new ArrayList<>();
            if (pages != null && pages.size() > 0) {
                for (int i = 0; i < pages.size(); i++) {
                    int pageIndex = pages.getInt(i);
                    if (pageIndex >= 0 && pageIndex < pageCount) {
                        pagesToExport.add(pageIndex);
                    }
                }
            } else {
                for (int i = 0; i < pageCount; i++) {
                    pagesToExport.add(i);
                }
            }

            for (int pageIndex : pagesToExport) {
                try {
                    PdfRenderer.Page page = pdfRenderer.openPage(pageIndex);
                    
                    float scale = dpi / 72f; // 72 DPI is default
                    int width = (int) (page.getWidth() * scale);
                    int height = (int) (page.getHeight() * scale);

                    Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
                    Canvas canvas = new Canvas(bitmap);
                    canvas.drawColor(Color.WHITE);

                    page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);

                    String fileName = String.format("page_%d.%s", pageIndex + 1, format);
                    String outputPath = saveBitmap(bitmap, fileName, outputDir);
                    exportedFiles.add(outputPath);

                    bitmap.recycle();
                    page.close();

                    Log.i(TAG, "Exported page " + (pageIndex + 1) + " to " + outputPath);

                } catch (Exception e) {
                    Log.e(TAG, "Error exporting page " + pageIndex, e);
                }
            }
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

            promise.reject("NOT_IMPLEMENTED", "PDF merging not yet implemented on Android");

        } catch (Exception e) {
            Log.e(TAG, "Error merging PDFs", e);
            promise.reject("MERGE_ERROR", e.getMessage());
        }
    }

    
    @ReactMethod
    public void splitPDF(String filePath, ReadableArray pageRanges, Promise promise) {
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

            promise.reject("NOT_IMPLEMENTED", "PDF splitting not yet implemented on Android");

        } catch (Exception e) {
            Log.e(TAG, "Error splitting PDF", e);
            promise.reject("SPLIT_ERROR", e.getMessage());
        }
    }

    
    @ReactMethod
    public void extractPages(String filePath, ReadableArray pageNumbers, String outputPath, Promise promise) {
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

            promise.reject("NOT_IMPLEMENTED", "Page extraction not yet implemented on Android");

        } catch (Exception e) {
            Log.e(TAG, "Error extracting pages", e);
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