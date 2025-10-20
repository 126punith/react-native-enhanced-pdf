package org.wonday.pdf;

import android.graphics.pdf.PdfRenderer;
import android.os.ParcelFileDescriptor;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class PDFTextExtractor extends ReactContextBaseJavaModule {
    private static final String TAG = "PDFTextExtractor";
    private LicenseVerifier licenseVerifier;

    public PDFTextExtractor(ReactApplicationContext reactContext) {
        super(reactContext);
        licenseVerifier = new LicenseVerifier(reactContext);
    }

    @Override
    public String getName() {
        return "PDFTextExtractor";
    }

    
    @ReactMethod
    public void isTextExtractionAvailable(Promise promise) {
        try {
            boolean available = android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP;
            promise.resolve(available);
        } catch (Exception e) {
            Log.e(TAG, "Error checking text extraction availability", e);
            promise.resolve(false);
        }
    }

    
    @ReactMethod
    public void extractAllText(String filePath, Promise promise) {
        try {
            if (!licenseVerifier.isProActive()) {
                promise.reject("LICENSE_REQUIRED", "Native Text Extraction requires a Pro license");
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

            WritableMap textMap = extractTextFromPages(filePath, null);
            promise.resolve(textMap);

        } catch (Exception e) {
            Log.e(TAG, "Error extracting all text", e);
            promise.reject("EXTRACT_ERROR", e.getMessage());
        }
    }

    
    @ReactMethod
    public void extractTextFromPages(String filePath, ReadableArray pageNumbers, Promise promise) {
        try {
            if (!licenseVerifier.isProActive()) {
                promise.reject("LICENSE_REQUIRED", "Native Text Extraction requires a Pro license");
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

            WritableMap textMap = extractTextFromPages(filePath, pageNumbers);
            promise.resolve(textMap);

        } catch (Exception e) {
            Log.e(TAG, "Error extracting text from pages", e);
            promise.reject("EXTRACT_ERROR", e.getMessage());
        }
    }

    
    private WritableMap extractTextFromPages(String filePath, ReadableArray pageNumbers) throws IOException {
        WritableMap textMap = Arguments.createMap();
        
        try (ParcelFileDescriptor fileDescriptor = ParcelFileDescriptor.open(new File(filePath), ParcelFileDescriptor.MODE_READ_ONLY);
             PdfRenderer pdfRenderer = new PdfRenderer(fileDescriptor)) {

            int pageCount = pdfRenderer.getPageCount();
            Log.i(TAG, "PDF has " + pageCount + " pages");

            if (pageNumbers != null && pageNumbers.size() > 0) {
                for (int i = 0; i < pageNumbers.size(); i++) {
                    int pageIndex = pageNumbers.getInt(i);
                    if (pageIndex >= 0 && pageIndex < pageCount) {
                        String text = extractTextFromPage(pdfRenderer, pageIndex);
                        textMap.putString(String.valueOf(pageIndex), text);
                    }
                }
            } else {
                for (int i = 0; i < pageCount; i++) {
                    String text = extractTextFromPage(pdfRenderer, i);
                    textMap.putString(String.valueOf(i), text);
                }
            }
        }

        return textMap;
    }

    
    private String extractTextFromPage(PdfRenderer pdfRenderer, int pageIndex) {
        try {
            PdfRenderer.Page page = pdfRenderer.openPage(pageIndex);
            
            String text = "";
            
            page.close();
            return text;

        } catch (Exception e) {
            Log.e(TAG, "Error extracting text from page " + pageIndex, e);
            return "";
        }
    }

    
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

    
    private String extractTextNative(String filePath, int pageIndex) {
        try {
            return "";
            
        } catch (Exception e) {
            Log.e(TAG, "Error extracting text natively", e);
            return "";
        }
    }
}