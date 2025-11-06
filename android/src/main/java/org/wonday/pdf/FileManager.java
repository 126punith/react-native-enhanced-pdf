package org.wonday.pdf;

import android.app.DownloadManager;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * FileManager - Native module for file operations like opening folders
 */
public class FileManager extends ReactContextBaseJavaModule {
    private static final String TAG = "FileManager";
    private static final String FOLDER_NAME = "PDFDemoApp";
    private final ReactApplicationContext reactContext;

    public FileManager(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "FileManager";
    }

    /**
     * Open the Downloads/PDFDemoApp folder in the file manager
     * Multiple fallback strategies for maximum compatibility
     */
    @ReactMethod
    public void openDownloadsFolder(Promise promise) {
        try {
            Log.i(TAG, "📂 [OPEN FOLDER] Attempting to open Downloads/" + FOLDER_NAME);
            
            // Strategy 1: Try to open specific Downloads/PDFDemoApp folder
            try {
                Intent specificIntent = new Intent(Intent.ACTION_VIEW);
                Uri folderUri = Uri.parse("content://com.android.externalstorage.documents/document/primary:Download/" + FOLDER_NAME);
                specificIntent.setDataAndType(folderUri, "resource/folder");
                specificIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                
                if (specificIntent.resolveActivity(reactContext.getPackageManager()) != null) {
                    reactContext.startActivity(specificIntent);
                    Log.i(TAG, "✅ [OPEN FOLDER] Opened specific folder via DocumentsUI");
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e) {
                Log.i(TAG, "📂 [OPEN FOLDER] Strategy 1 failed, trying fallback...");
            }
            
            // Strategy 2: Open Downloads app
            try {
                Log.i(TAG, "📂 [OPEN FOLDER] Trying Downloads app");
                Intent downloadsIntent = new Intent(DownloadManager.ACTION_VIEW_DOWNLOADS);
                downloadsIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                
                if (downloadsIntent.resolveActivity(reactContext.getPackageManager()) != null) {
                    reactContext.startActivity(downloadsIntent);
                    Log.i(TAG, "✅ [OPEN FOLDER] Opened Downloads app");
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e) {
                Log.i(TAG, "📂 [OPEN FOLDER] Strategy 2 failed, trying fallback...");
            }
            
            // Strategy 3: Open Files app with generic CATEGORY_APP_FILES intent
            try {
                Log.i(TAG, "📂 [OPEN FOLDER] Trying Files app");
                Intent filesIntent = new Intent(Intent.ACTION_VIEW);
                filesIntent.addCategory(Intent.CATEGORY_DEFAULT);
                filesIntent.setType("resource/folder");
                filesIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                
                if (filesIntent.resolveActivity(reactContext.getPackageManager()) != null) {
                    reactContext.startActivity(filesIntent);
                    Log.i(TAG, "✅ [OPEN FOLDER] Opened Files app");
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e) {
                Log.i(TAG, "📂 [OPEN FOLDER] Strategy 3 failed");
            }
            
            // Strategy 4: Try to launch any file manager using generic intent
            try {
                Log.i(TAG, "📂 [OPEN FOLDER] Trying generic file manager");
                Intent genericIntent = new Intent(Intent.ACTION_GET_CONTENT);
                genericIntent.setType("*/*");
                genericIntent.addCategory(Intent.CATEGORY_OPENABLE);
                genericIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                
                if (genericIntent.resolveActivity(reactContext.getPackageManager()) != null) {
                    reactContext.startActivity(Intent.createChooser(genericIntent, "Open File Manager"));
                    Log.i(TAG, "✅ [OPEN FOLDER] Opened file picker");
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e) {
                Log.i(TAG, "📂 [OPEN FOLDER] Strategy 4 failed");
            }
            
            // All strategies failed
            Log.w(TAG, "⚠️ [OPEN FOLDER] All strategies failed - no file manager available");
            promise.reject("NO_FILE_MANAGER", "No file manager app available on this device");
            
        } catch (Exception e) {
            Log.e(TAG, "❌ [OPEN FOLDER] ERROR", e);
            promise.reject("OPEN_FOLDER_ERROR", e.getMessage());
        }
    }
}





