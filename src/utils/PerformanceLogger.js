/**
 * PerformanceLogger - Comprehensive performance monitoring and logging
 * 
 * Features:
 * - High-precision timing
 * - Checkpoints for step-by-step analysis
 * - Memory tracking
 * - Throughput calculations
 * - Structured logging with [PERF] prefix
 */

class PerformanceLogger {
  constructor() {
    this.timers = new Map();
    this.checkpoints = new Map();
    this.enabled = true;
  }

  /**
   * Start timing an operation
   */
  startTimer(operationName, params = {}) {
    if (!this.enabled) return;

    const timestamp = performance.now();
    const memoryBefore = this.getMemoryUsage();

    this.timers.set(operationName, {
      name: operationName,
      startTime: timestamp,
      startDate: new Date().toISOString(),
      params: params,
      memoryBefore: memoryBefore,
      checkpoints: [],
    });

    console.log(
      `[PERF] [${operationName}] ▶️ START`,
      `\n  📅 Time: ${new Date().toISOString()}`,
      `\n  📊 Memory Before: ${this.formatMemory(memoryBefore)}`,
      `\n  🔧 Params:`, params
    );
  }

  /**
   * Mark a checkpoint during an operation
   */
  checkpoint(operationName, checkpointLabel, data = {}) {
    if (!this.enabled) return;

    const timer = this.timers.get(operationName);
    if (!timer) {
      console.warn(`[PERF] ⚠️ No timer found for: ${operationName}`);
      return;
    }

    const timestamp = performance.now();
    const elapsed = timestamp - timer.startTime;
    const lastCheckpoint = timer.checkpoints.length > 0
      ? timer.checkpoints[timer.checkpoints.length - 1]
      : {timestamp: timer.startTime};
    const sinceLastCheckpoint = timestamp - lastCheckpoint.timestamp;

    const checkpoint = {
      label: checkpointLabel,
      timestamp: timestamp,
      elapsed: elapsed,
      sinceLastCheckpoint: sinceLastCheckpoint,
      data: data,
    };

    timer.checkpoints.push(checkpoint);

    console.log(
      `[PERF] [${operationName}] 🔶 CHECKPOINT: ${checkpointLabel}`,
      `\n  ⏱️  Elapsed: ${elapsed.toFixed(2)}ms`,
      `\n  🔄 Since last: ${sinceLastCheckpoint.toFixed(2)}ms`,
      data && Object.keys(data).length > 0 ? `\n  📊 Data:` : '', data
    );
  }

  /**
   * End timing and log complete summary
   */
  endTimer(operationName, result = {}) {
    if (!this.enabled) return;

    const timer = this.timers.get(operationName);
    if (!timer) {
      console.warn(`[PERF] ⚠️ No timer found for: ${operationName}`);
      return;
    }

    const endTime = performance.now();
    const totalDuration = endTime - timer.startTime;
    const memoryAfter = this.getMemoryUsage();
    const memoryDelta = memoryAfter - timer.memoryBefore;

    console.log(
      `[PERF] [${operationName}] ⏹️ END`,
      `\n  ⏱️  Total Duration: ${totalDuration.toFixed(2)}ms`,
      `\n  📊 Memory After: ${this.formatMemory(memoryAfter)}`,
      `\n  📈 Memory Delta: ${this.formatMemory(memoryDelta)}`,
      `\n  🎯 Result:`, result
    );

    // Log checkpoint summary
    if (timer.checkpoints.length > 0) {
      console.log(`[PERF] [${operationName}] 📋 Checkpoint Summary:`);
      timer.checkpoints.forEach((cp, index) => {
        console.log(
          `  ${index + 1}. ${cp.label}:`,
          `${cp.elapsed.toFixed(2)}ms (Δ${cp.sinceLastCheckpoint.toFixed(2)}ms)`
        );
      });
    }

    // Calculate statistics
    const stats = {
      operation: operationName,
      totalDuration: totalDuration,
      checkpointCount: timer.checkpoints.length,
      memoryBefore: timer.memoryBefore,
      memoryAfter: memoryAfter,
      memoryDelta: memoryDelta,
      params: timer.params,
      result: result,
    };

    console.log(`[PERF] [${operationName}] 📊 STATS:`, stats);

    // Clean up
    this.timers.delete(operationName);

    return stats;
  }

  /**
   * Log throughput calculation
   */
  logThroughput(bytes, milliseconds, label = 'Operation') {
    if (!this.enabled) return;

    const megabytes = bytes / (1024 * 1024);
    const seconds = milliseconds / 1000;
    const throughputMBps = megabytes / seconds;

    console.log(
      `[PERF] [THROUGHPUT] ${label}`,
      `\n  📦 Size: ${megabytes.toFixed(2)} MB`,
      `\n  ⏱️  Time: ${milliseconds.toFixed(2)}ms`,
      `\n  🚀 Throughput: ${throughputMBps.toFixed(2)} MB/s`
    );

    return throughputMBps;
  }

  /**
   * Log memory usage
   */
  logMemory(label = 'Current') {
    if (!this.enabled) return;

    const memory = this.getMemoryUsage();
    console.log(
      `[PERF] [MEMORY] ${label}:`,
      this.formatMemory(memory)
    );

    return memory;
  }

  /**
   * Get current memory usage (if available)
   */
  getMemoryUsage() {
    // React Native doesn't expose memory API directly
    // This would require native module integration
    // For now, return 0 (can be enhanced with native bridge)
    if (global.performance && global.performance.memory) {
      return global.performance.memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  /**
   * Format memory size for display
   */
  formatMemory(bytes) {
    if (bytes === 0) return 'N/A (requires native bridge)';
    
    const mb = bytes / (1024 * 1024);
    if (mb > 1) {
      return `${mb.toFixed(2)} MB`;
    }
    
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  }

  /**
   * Log method entry with parameters
   */
  logMethodEntry(className, methodName, params = {}) {
    if (!this.enabled) return;

    console.log(
      `[PERF] [${className}.${methodName}] 🔵 ENTER`,
      Object.keys(params).length > 0 ? '\n  📥 Params:' : '',
      params
    );
  }

  /**
   * Log method exit with result
   */
  logMethodExit(className, methodName, result = {}, duration = null) {
    if (!this.enabled) return;

    console.log(
      `[PERF] [${className}.${methodName}] 🔴 EXIT`,
      duration !== null ? `\n  ⏱️  Duration: ${duration.toFixed(2)}ms` : '',
      Object.keys(result).length > 0 ? '\n  📤 Result:' : '',
      result
    );
  }

  /**
   * Log file operation
   */
  logFileOperation(operation, filePath, size = null, duration = null) {
    if (!this.enabled) return;

    console.log(
      `[PERF] [FILE_IO] ${operation}`,
      `\n  📁 Path: ${filePath}`,
      size !== null ? `\n  📦 Size: ${this.formatBytes(size)}` : '',
      duration !== null ? `\n  ⏱️  Duration: ${duration.toFixed(2)}ms` : ''
    );
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes) {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes} bytes`;
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`[PERF] Logging ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Get all active timers (for debugging)
   */
  getActiveTimers() {
    return Array.from(this.timers.keys());
  }

  /**
   * Clear all timers
   */
  clearAll() {
    this.timers.clear();
    this.checkpoints.clear();
    console.log('[PERF] All timers cleared');
  }
}

// Export singleton instance
const performanceLogger = new PerformanceLogger();
export default performanceLogger;






