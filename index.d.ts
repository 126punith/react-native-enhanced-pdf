/**
 * Copyright (c) 2017-present, Wonday (@wonday.org)
 * All rights reserved.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import * as ReactNative from 'react-native';

export type TableContent = {
    children: TableContent[],
    mNativePtr: number,
    pageIdx: number,
    title: string,
};

export type Source = {
    uri?: string;
    headers?: {
        [key: string]: string;
    };
    cache?: boolean;
    cacheFileName?: string;
    expiration?: number;
    method?: string;
};

export interface PdfProps {
    style?: ReactNative.StyleProp<ReactNative.ViewStyle>,
    progressContainerStyle?: ReactNative.StyleProp<ReactNative.ViewStyle>,
    source: Source | number,
    page?: number,
    scale?: number,
    minScale?: number,
    maxScale?: number,
    horizontal?: boolean,
    showsHorizontalScrollIndicator?: boolean,
    showsVerticalScrollIndicator?: boolean,
    scrollEnabled?: boolean,
    /**
    /**
    /**
    spacing?: number,
    password?: string,
    renderActivityIndicator?: (progress: number) => React.ReactElement,
    enableAntialiasing?: boolean,
    enablePaging?: boolean,
    enableRTL?: boolean,
    enableAnnotationRendering?: boolean,
    enableDoubleTapZoom?: boolean;
    /**
     * Fit policy.  This will adjust the initial zoom of the PDF based on the initial size of the view and the scale factor.
     * 0 = fit width
     * 1 = fit height
     * 2 = fit both
     */
    fitPolicy?: 0 | 1 | 2,
    trustAllCerts?: boolean,
    singlePage?: boolean,
    onLoadProgress?: (percent: number,) => void,
    onLoadComplete?: (numberOfPages: number, path: string, size: {height: number, width: number}, tableContents?: TableContent[]) => void,
    onPageChanged?: (page: number, numberOfPages: number) => void,
    onError?: (error: object) => void,
    onPageSingleTap?: (page: number, x: number, y: number) => void,
    onScaleChanged?: (scale: number) => void,
    onPressLink?: (url: string) => void,
}

declare class Pdf extends React.Component<PdfProps, any> {
    setPage: (pageNumber: number) => void;
}

export default Pdf;

// ========================================
// PDFCache (Streaming Base64 Decoder)
// ========================================

/**
 * Cache info returned from storage operations
 */
export interface CacheInfo {
    cacheId: string;
    filePath: string;
    fileSize: number;
    createdAt: number;
    lastAccessed?: number;
    expired?: boolean;
}

/**
 * Options for storing base64 PDF with streaming decoder
 */
export interface StoreBase64Options {
    /**
     * Base64 PDF data (with or without data URI prefix)
     */
    base64: string;
    /**
     * Custom cache identifier (optional, auto-generated if not provided)
     */
    identifier?: string;
    /**
     * Cache TTL in milliseconds
     * @default 2592000000 (30 days)
     */
    maxAge?: number;
    /**
     * Maximum cache size in bytes
     * @default 524288000 (500MB)
     */
    maxSize?: number;
    /**
     * Progress callback (0.0 to 1.0)
     */
    onProgress?: (progress: number) => void;
}

/**
 * Cache statistics
 */
export interface CacheStats {
    totalSize: number;
    fileCount: number;
    hitRate: number;
    cacheHits: number;
    cacheMisses: number;
    averageLoadTime: number;
}

/**
 * PDFCache Manager for streaming base64 decoding
 * Eliminates OOM crashes with large PDFs (60MB-200MB+)
 */
export interface PDFCacheManager {
    /**
     * Store base64 PDF with streaming decoder (O(1) constant memory)
     * @param options Storage options
     * @returns Promise resolving to cache info
     */
    storeBase64(options: StoreBase64Options): Promise<CacheInfo>;
    
    /**
     * Get cached PDF by identifier
     * @param identifier Cache identifier
     * @returns Promise resolving to cache info or null if not found
     */
    get(identifier: string): Promise<CacheInfo | null>;
    
    /**
     * Check if PDF is cached and not expired
     * @param identifier Cache identifier
     * @returns Promise resolving to true if cached and valid
     */
    has(identifier: string): Promise<boolean>;
    
    /**
     * Remove cached PDF
     * @param identifier Cache identifier
     * @returns Promise resolving to true if removed successfully
     */
    remove(identifier: string): Promise<boolean>;
    
    /**
     * Clear all cached PDFs
     */
    clear(): Promise<void>;
    
    /**
     * Clear expired PDFs only
     * @returns Promise resolving to number of entries removed
     */
    clearExpired(): Promise<number>;
    
    /**
     * Get cache statistics
     * @returns Promise resolving to cache stats
     */
    getStats(): Promise<CacheStats>;
    
    /**
     * Estimate decoded size from base64 length
     * @param base64Length Length of base64 string
     * @returns Estimated decoded size in bytes
     */
    estimateDecodedSize(base64Length: number): number;
}

/**
 * PDFCache singleton instance
 */
export const PDFCache: PDFCacheManager;

/**
 * CacheManager (alias for PDFCache)
 */
export const CacheManager: PDFCacheManager;
