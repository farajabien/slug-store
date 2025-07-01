// Auto Config System - Auto-detect optimal persistence strategies

export interface AutoConfigAnalysisResult {
  shouldCompress: boolean;
  shouldEncrypt: boolean;
  shouldPersistInURL: boolean;
  shouldPersistOffline: boolean;
  compressionAlgorithm?: 'gzip' | 'brotli' | 'auto';
  reasoning: string[];
}

/**
 * Analyze data patterns to recommend optimal persistence strategies
 */
export function analyzeDataPatterns<T>(data: T): AutoConfigAnalysisResult {
  const jsonString = JSON.stringify(data);
  const size = jsonString.length;
  const reasoning: string[] = [];
  
  // Size-based decisions
  const shouldCompress = size > 500; // Lower threshold for testing
  if (shouldCompress) {
    reasoning.push(`Large data detected (${size} chars) - enabling compression`);
  }
  
  // Detect sensitive fields
  const hasSensitiveFields = detectSensitiveFields(data);
  const shouldEncrypt = hasSensitiveFields;
  if (shouldEncrypt) {
    reasoning.push('Sensitive data detected - enabling encryption');
  }
  
  // URL persistence decisions
  const shouldPersistInURL = !hasSensitiveFields && size < 8000;
  if (shouldPersistInURL) {
    reasoning.push('Shareable, non-sensitive data under URL limits - enabling URL persistence');
  }
  
  // Offline persistence decisions
  const shouldPersistOffline = size > 1000 || hasSensitiveFields; // Lower threshold for testing
  if (shouldPersistOffline) {
    reasoning.push('Large data or sensitive content - enabling offline persistence');
  }
  
  // Compression algorithm selection
  let compressionAlgorithm: 'gzip' | 'brotli' | 'auto' = 'auto';
  if (shouldCompress) {
    if (size > 5000) {
      compressionAlgorithm = 'brotli';
      reasoning.push('Very large data - using Brotli compression');
    } else if (size > 2000) {
      compressionAlgorithm = 'gzip';  
      reasoning.push('Large data - using Gzip compression');
    }
  }
  
  return {
    shouldCompress,
    shouldEncrypt,
    shouldPersistInURL,
    shouldPersistOffline,
    compressionAlgorithm,
    reasoning
  };
}

/**
 * Detect potentially sensitive fields based on common patterns
 */
function detectSensitiveFields(obj: any): boolean {
  const sensitiveKeywords = [
    'password', 'token', 'secret', 'key', 'auth', 'credential',
    'ssn', 'social', 'credit', 'card'
  ];
  
  const jsonString = JSON.stringify(obj).toLowerCase();
  return sensitiveKeywords.some(keyword => jsonString.includes(keyword));
}

/**
 * Development mode helper to explain auto-configuration decisions
 */
export function explainAutoConfig<T>(data: T): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const analysis = analyzeDataPatterns(data);
  
  console.group('⚙️ Slug Store Auto Config Analysis');
  console.log('📊 Data Pattern Analysis:', {
    size: `${JSON.stringify(data).length} characters`,
    compression: analysis.shouldCompress ? '✅ Enabled' : '❌ Disabled',
    encryption: analysis.shouldEncrypt ? '✅ Enabled' : '❌ Disabled',
    urlPersistence: analysis.shouldPersistInURL ? '✅ Enabled' : '❌ Disabled',
    offlinePersistence: analysis.shouldPersistOffline ? '✅ Enabled' : '❌ Disabled'
  });
  
  console.log('🧠 Reasoning:');
  analysis.reasoning.forEach(reason => console.log(`  • ${reason}`));
  console.groupEnd();
} 