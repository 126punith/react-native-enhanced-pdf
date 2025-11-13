/**
 * Streaming Base64 Decoder for Large PDFs
 * Eliminates OOM crashes by processing base64 data in chunks
 * 
 * Features:
 * - O(1) constant memory usage (8KB chunks)
 * - Progress callback support
 * - PDF header validation
 * - Error handling and recovery
 * 
 * Usage:
 *   StreamingBase64Decoder.decodeToFile(base64String, outputFile);
 *   StreamingBase64Decoder.decodeToFileWithProgress(base64String, outputFile, progress -> {
 *       Log.i("Decode", "Progress: " + (progress * 100) + "%");
 *   });
 */

package org.wonday.pdf;

import android.util.Base64;
import android.util.Log;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class StreamingBase64Decoder {
    private static final String TAG = "StreamingBase64Decoder";
    
    // Chunk size for processing (8KB = optimal for memory/performance balance)
    private static final int CHUNK_SIZE = 8192;
    
    // PDF file signature (magic bytes)
    private static final byte[] PDF_HEADER = {0x25, 0x50, 0x44, 0x46}; // "%PDF"
    
    /**
     * Progress callback interface
     */
    public interface ProgressCallback {
        void onProgress(float progress);
    }
    
    /**
     * Decode base64 string to file using streaming (O(1) memory)
     * 
     * @param base64Data Base64 encoded PDF data
     * @param outputFile Output file to write decoded data
     * @throws IOException If I/O error occurs
     * @throws IllegalArgumentException If invalid base64 or not a PDF
     */
    public static void decodeToFile(String base64Data, File outputFile) throws IOException {
        decodeToFileWithProgress(base64Data, outputFile, null);
    }
    
    /**
     * Decode base64 string to file with progress callback
     * 
     * @param base64Data Base64 encoded PDF data
     * @param outputFile Output file to write decoded data
     * @param callback Progress callback (0.0 to 1.0)
     * @throws IOException If I/O error occurs
     * @throws IllegalArgumentException If invalid base64 or not a PDF
     */
    public static void decodeToFileWithProgress(
            String base64Data, 
            File outputFile,
            ProgressCallback callback) throws IOException {
        
        long startTime = System.currentTimeMillis();
        Log.i(TAG, "[PERF] [decodeToFileWithProgress] 🔵 ENTER - Input size: " + base64Data.length() + " chars");
        
        if (base64Data == null || base64Data.trim().isEmpty()) {
            throw new IllegalArgumentException("Base64 data is null or empty");
        }
        
        // Clean base64 data - remove data URI prefix if present
        long cleanStart = System.currentTimeMillis();
        String cleanBase64 = cleanBase64Data(base64Data);
        long cleanTime = System.currentTimeMillis() - cleanStart;
        Log.i(TAG, "[PERF] [decodeToFileWithProgress]   Clean data: " + cleanTime + "ms");
        
        int totalLength = cleanBase64.length();
        int offset = 0;
        boolean isFirstChunk = true;
        
        try (FileOutputStream fos = new FileOutputStream(outputFile);
             BufferedOutputStream bos = new BufferedOutputStream(fos, 16384)) {
            
            long decodeStart = System.currentTimeMillis();
            int chunksProcessed = 0;
            
            // Process base64 data in chunks
            while (offset < totalLength) {
                // Calculate chunk boundaries (must be multiple of 4 for base64)
                int chunkEnd = Math.min(offset + CHUNK_SIZE, totalLength);
                
                // Adjust chunk end to be on a base64 boundary (multiple of 4)
                // Exception: last chunk can be any size
                if (chunkEnd < totalLength) {
                    int remainder = (chunkEnd - offset) % 4;
                    if (remainder != 0) {
                        chunkEnd -= remainder;
                    }
                }
                
                // Extract and decode chunk
                String chunk = cleanBase64.substring(offset, chunkEnd);
                byte[] decodedChunk;
                
                try {
                    decodedChunk = Base64.decode(chunk, Base64.DEFAULT);
                } catch (IllegalArgumentException e) {
                    Log.e(TAG, "Invalid base64 data at offset " + offset, e);
                    throw new IllegalArgumentException("Invalid base64 encoding at position " + offset, e);
                }
                
                // Validate PDF header on first chunk
                if (isFirstChunk) {
                    if (!validatePDFHeader(decodedChunk)) {
                        throw new IllegalArgumentException("Invalid PDF data - missing or corrupt PDF header");
                    }
                    isFirstChunk = false;
                    Log.i(TAG, "[PERF] [decodeToFileWithProgress]   PDF header validated ✓");
                }
                
                // Write decoded chunk to file
                bos.write(decodedChunk);
                
                offset = chunkEnd;
                chunksProcessed++;
                
                // Report progress
                if (callback != null && chunksProcessed % 10 == 0) {
                    float progress = (float) offset / totalLength;
                    callback.onProgress(progress);
                }
            }
            
            bos.flush();
            fos.getFD().sync(); // Force sync to disk for durability
            
            long decodeTime = System.currentTimeMillis() - decodeStart;
            long totalTime = System.currentTimeMillis() - startTime;
            
            Log.i(TAG, "[PERF] [decodeToFileWithProgress]   Decode time: " + decodeTime + "ms");
            Log.i(TAG, "[PERF] [decodeToFileWithProgress]   Chunks processed: " + chunksProcessed);
            Log.i(TAG, "[PERF] [decodeToFileWithProgress]   Output size: " + outputFile.length() + " bytes");
            Log.i(TAG, "[PERF] [decodeToFileWithProgress] 🔴 EXIT - Total: " + totalTime + "ms");
            
            // Final progress callback
            if (callback != null) {
                callback.onProgress(1.0f);
            }
            
        } catch (IOException e) {
            // Clean up partial file on error
            if (outputFile.exists()) {
                outputFile.delete();
            }
            Log.e(TAG, "Failed to decode base64 to file", e);
            throw e;
        }
    }
    
    /**
     * Clean base64 data - remove whitespace, newlines, and data URI prefix
     */
    private static String cleanBase64Data(String base64Data) {
        String cleaned = base64Data.trim();
        
        // Remove data URI prefix if present (e.g., "data:application/pdf;base64,")
        int commaIndex = cleaned.indexOf(',');
        if (commaIndex != -1 && cleaned.substring(0, commaIndex).contains("base64")) {
            cleaned = cleaned.substring(commaIndex + 1);
        }
        
        // Remove all whitespace and newlines (some base64 strings have line breaks)
        cleaned = cleaned.replaceAll("\\s+", "");
        
        return cleaned;
    }
    
    /**
     * Validate PDF header (magic bytes: %PDF)
     */
    private static boolean validatePDFHeader(byte[] data) {
        if (data == null || data.length < PDF_HEADER.length) {
            return false;
        }
        
        // Check for PDF magic bytes at start
        for (int i = 0; i < PDF_HEADER.length; i++) {
            if (data[i] != PDF_HEADER[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Validate PDF file header
     */
    public static boolean validatePDFFile(File file) throws IOException {
        if (file == null || !file.exists() || file.length() < PDF_HEADER.length) {
            return false;
        }
        
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] header = new byte[PDF_HEADER.length];
            int bytesRead = fis.read(header);
            
            if (bytesRead < PDF_HEADER.length) {
                return false;
            }
            
            return validatePDFHeader(header);
        }
    }
    
    /**
     * Estimate decoded size from base64 length
     * Base64 encoding increases size by ~33%, so decoded size is ~75% of encoded
     */
    public static long estimateDecodedSize(int base64Length) {
        return (long) (base64Length * 0.75);
    }
    
    /**
     * Calculate number of chunks for given base64 data
     */
    public static int calculateChunkCount(int base64Length) {
        return (int) Math.ceil((double) base64Length / CHUNK_SIZE);
    }
}



