package org.wonday.pdf;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * FileDownloader - Native module for downloading files to public storage using MediaStore API
 * Ensures files are immediately visible in file managers
 */
public class FileDownloader extends ReactContextBaseJavaModule {
    private static final String TAG = "FileDownloader";
    private static final String FOLDER_NAME = "PDFDemoApp";
    private static final String NOTIFICATION_CHANNEL_ID = "pdf_exports";
    private final ReactApplicationContext reactContext;

    public FileDownloader(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        createNotificationChannel();
    }
    
    /**
     * Create notification channel for export notifications (Android O+)
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "PDF Exports";
            String description = "Notifications for PDF export operations";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(NOTIFICATION_CHANNEL_ID, name, importance);
            channel.setDescription(description);
            
            NotificationManager notificationManager = reactContext.getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
                Log.i(TAG, "📱 [NOTIFICATION] Channel created");
            }
        }
    }

    @Override
    public String getName() {
        return "FileDownloader";
    }

    /**
     * Download file to public Downloads folder using MediaStore API
     * 
     * @param sourcePath Path to source file in app's cache
     * @param fileName Name for the downloaded file
     * @param mimeType MIME type (application/pdf, image/png, image/jpeg)
     * @param promise Promise to resolve with public file path
     */
    @ReactMethod
    public void downloadToPublicFolder(String sourcePath, String fileName, String mimeType, Promise promise) {
        try {
            Log.i(TAG, "📥 [DOWNLOAD] START - file: " + fileName + ", type: " + mimeType);
            Log.i(TAG, "📁 [SOURCE] " + sourcePath);

            // Verify source file exists
            File sourceFile = new File(sourcePath);
            if (!sourceFile.exists()) {
                Log.e(TAG, "❌ [ERROR] Source file not found: " + sourcePath);
                promise.reject("FILE_NOT_FOUND", "Source file not found: " + sourcePath);
                return;
            }

            Log.i(TAG, "📁 [SOURCE] File exists, size: " + sourceFile.length() + " bytes");

            String publicPath;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10+ - Use MediaStore API (Scoped Storage)
                publicPath = downloadUsingMediaStore(sourceFile, fileName, mimeType);
            } else {
                // Android 9 and below - Use legacy public directory
                publicPath = downloadUsingLegacyStorage(sourceFile, fileName);
            }

            Log.i(TAG, "✅ [DOWNLOAD] SUCCESS - " + publicPath);
            
            // Show notification with "Open Folder" action
            showDownloadNotification(1, fileName);
            
            promise.resolve(publicPath);

        } catch (Exception e) {
            Log.e(TAG, "❌ [DOWNLOAD] ERROR", e);
            promise.reject("DOWNLOAD_ERROR", e.getMessage());
        }
    }

    /**
     * Download using MediaStore API (Android 10+)
     */
    private String downloadUsingMediaStore(File sourceFile, String fileName, String mimeType) throws Exception {
        Log.i(TAG, "📱 [MEDIASTORE] Using MediaStore API for Android 10+");

        ContentResolver resolver = reactContext.getContentResolver();
        
        // Set up content values
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
        values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + FOLDER_NAME);
        values.put(MediaStore.Downloads.IS_PENDING, 1); // Mark as pending while writing

        Log.i(TAG, "📁 [MEDIASTORE] Creating entry in MediaStore...");
        
        // Insert into MediaStore
        Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        
        if (uri == null) {
            throw new Exception("Failed to create MediaStore entry");
        }

        Log.i(TAG, "📁 [MEDIASTORE] URI created: " + uri.toString());
        Log.i(TAG, "📥 [COPY] Copying file content...");

        // Copy file content
        try (InputStream in = new FileInputStream(sourceFile);
             OutputStream out = resolver.openOutputStream(uri)) {
            
            if (out == null) {
                throw new Exception("Failed to open output stream");
            }

            byte[] buffer = new byte[8192];
            int bytesRead;
            long totalBytes = 0;

            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
                totalBytes += bytesRead;
            }

            Log.i(TAG, "✅ [COPY] Copied " + totalBytes + " bytes");
        }

        // Mark as complete (no longer pending)
        values.clear();
        values.put(MediaStore.Downloads.IS_PENDING, 0);
        resolver.update(uri, values, null, null);

        Log.i(TAG, "✅ [MEDIASTORE] File published successfully");

        // Return user-friendly path
        String publicPath = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                + "/" + FOLDER_NAME + "/" + fileName;
        
        return publicPath;
    }

    /**
     * Download using legacy storage (Android 9 and below)
     */
    private String downloadUsingLegacyStorage(File sourceFile, String fileName) throws Exception {
        Log.i(TAG, "📱 [LEGACY] Using legacy storage for Android 9 and below");

        // Get public Downloads directory
        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File appFolder = new File(downloadsDir, FOLDER_NAME);

        // Create folder if needed
        if (!appFolder.exists()) {
            boolean created = appFolder.mkdirs();
            Log.i(TAG, "📁 [LEGACY] Folder created: " + created);
        }

        File destFile = new File(appFolder, fileName);
        Log.i(TAG, "📁 [LEGACY] Destination: " + destFile.getAbsolutePath());
        Log.i(TAG, "📥 [COPY] Copying file...");

        // Copy file
        try (InputStream in = new FileInputStream(sourceFile);
             OutputStream out = new java.io.FileOutputStream(destFile)) {
            
            byte[] buffer = new byte[8192];
            int bytesRead;
            long totalBytes = 0;

            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
                totalBytes += bytesRead;
            }

            Log.i(TAG, "✅ [COPY] Copied " + totalBytes + " bytes");
        }

        // Trigger media scanner for legacy devices
        android.media.MediaScannerConnection.scanFile(
            reactContext,
            new String[]{destFile.getAbsolutePath()},
            new String[]{getMimeType(fileName)},
            null
        );

        Log.i(TAG, "✅ [LEGACY] Media scanner notified");

        return destFile.getAbsolutePath();
    }

    /**
     * Get MIME type from file extension
     */
    private String getMimeType(String fileName) {
        if (fileName.endsWith(".pdf")) {
            return "application/pdf";
        } else if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".jpeg") || fileName.endsWith(".jpg")) {
            return "image/jpeg";
        }
        return "application/octet-stream";
    }
    
    /**
     * Show notification after successful download with "Open Folder" action
     * @param fileCount Number of files downloaded
     * @param fileName Name of the file (used for notification text)
     */
    private void showDownloadNotification(int fileCount, String fileName) {
        try {
            Log.i(TAG, "📱 [NOTIFICATION] Showing notification for " + fileCount + " file(s)");
            
            // Create intent to open Downloads/PDFDemoApp folder
            Intent intent = new Intent(Intent.ACTION_VIEW);
            Uri folderUri = Uri.parse("content://com.android.externalstorage.documents/document/primary:Download/" + FOLDER_NAME);
            intent.setDataAndType(folderUri, "resource/folder");
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            
            // Create pending intent with FLAG_IMMUTABLE for Android 12+
            PendingIntent pendingIntent = PendingIntent.getActivity(
                reactContext, 
                0, 
                intent, 
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M 
                    ? PendingIntent.FLAG_IMMUTABLE 
                    : 0
            );
            
            // Build notification
            String contentText = fileCount + " file(s) saved to Downloads/" + FOLDER_NAME;
            NotificationCompat.Builder builder = new NotificationCompat.Builder(reactContext, NOTIFICATION_CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_menu_save)
                .setContentTitle("✅ Export Complete")
                .setContentText(contentText)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(contentText))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .addAction(android.R.drawable.ic_menu_view, "Open Folder", pendingIntent);
            
            // Show notification
            NotificationManagerCompat notificationManager = NotificationManagerCompat.from(reactContext);
            notificationManager.notify(1001, builder.build());
            
            Log.i(TAG, "✅ [NOTIFICATION] Notification shown successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "❌ [NOTIFICATION] Failed to show notification", e);
            // Don't throw - notification is non-critical
        }
    }
}





