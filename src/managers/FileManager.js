import { NativeModules } from 'react-native';

const { FileManager: NativeFileManager, FileDownloader } = NativeModules;

/**
 * FileManager - JavaScript wrapper for file operations
 * Provides methods for file management, downloading, and folder access
 */
class FileManager {
  /**
   * Open the Downloads folder in the device's file manager
   * Uses multiple fallback strategies for maximum compatibility
   * @returns {Promise<boolean>} Resolves to true if folder opened successfully
   */
  static async openDownloadsFolder() {
    try {
      console.log('📂 [FileManager] Opening Downloads folder');
      
      if (!NativeFileManager) {
        throw new Error('FileManager native module not available');
      }
      
      const result = await NativeFileManager.openDownloadsFolder();
      console.log('✅ [FileManager] Folder opened successfully');
      return result;
    } catch (error) {
      console.error('❌ [FileManager] Error opening folder:', error);
      throw error;
    }
  }

  /**
   * Download file to public Downloads folder using MediaStore API
   * Ensures files are immediately visible in file managers
   * 
   * @param {string} sourcePath Path to source file in app's cache
   * @param {string} fileName Name for the downloaded file
   * @param {string} mimeType MIME type (application/pdf, image/png, image/jpeg)
   * @returns {Promise<string>} Resolves to public file path
   */
  static async downloadToPublicFolder(sourcePath, fileName, mimeType = 'application/pdf') {
    try {
      console.log('📥 [FileManager] Downloading to public folder:', fileName);
      
      if (!FileDownloader) {
        throw new Error('FileDownloader native module not available');
      }
      
      const publicPath = await FileDownloader.downloadToPublicFolder(sourcePath, fileName, mimeType);
      console.log('✅ [FileManager] File downloaded:', publicPath);
      return publicPath;
    } catch (error) {
      console.error('❌ [FileManager] Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Download multiple files to public Downloads folder
   * 
   * @param {Array<{sourcePath: string, fileName: string, mimeType: string}>} files Array of file objects
   * @returns {Promise<Array<string>>} Resolves to array of public file paths
   */
  static async downloadMultipleFiles(files) {
    try {
      console.log(`📥 [FileManager] Downloading ${files.length} files to public folder`);
      
      const results = [];
      for (const file of files) {
        const { sourcePath, fileName, mimeType = 'application/pdf' } = file;
        const publicPath = await this.downloadToPublicFolder(sourcePath, fileName, mimeType);
        results.push(publicPath);
      }
      
      console.log(`✅ [FileManager] Downloaded ${results.length} files successfully`);
      return results;
    } catch (error) {
      console.error('❌ [FileManager] Error downloading multiple files:', error);
      throw error;
    }
  }
}

export default FileManager;





