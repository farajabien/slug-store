// Test script to verify auto-config behavior
// Copying the auto-config logic directly to avoid import issues

// Auto Config System - Auto-detect optimal persistence strategies
function analyzeDataPatterns(data) {
  const jsonString = JSON.stringify(data);
  const size = jsonString.length;
  const reasoning = [];
  
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
  let compressionAlgorithm = 'auto';
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

function detectSensitiveFields(obj) {
  const sensitiveKeywords = [
    'password', 'token', 'secret', 'key', 'auth', 'credential',
    'ssn', 'social', 'credit', 'card'
  ];
  
  const jsonString = JSON.stringify(obj).toLowerCase();
  return sensitiveKeywords.some(keyword => jsonString.includes(keyword));
}

// Test data similar to your app state
const testState = {
  projects: [
    { id: '1', title: 'test-project', category: 'work', description: 'A test project' }
  ],
  todos: [],
  energyLevels: [],
  moodChecks: [],
  hyperfocusSessions: [],
  breakReminders: [],
  preferences: { theme: 'light' },
  analytics: { totalProjects: 1, lastUpdated: new Date().toISOString() },
  activeProjectId: '1',
  currentEnergy: 'high',
  lastActiveTab: 'work'
};

console.log('🧪 Testing Auto Config System');
console.log('============================');

// Analyze the test data
const analysis = analyzeDataPatterns(testState);
const jsonSize = JSON.stringify(testState).length;

console.log(`📊 Data Size: ${jsonSize} characters`);
console.log('📋 Analysis Results:');
console.log(`  • Should Compress: ${analysis.shouldCompress}`);
console.log(`  • Should Encrypt: ${analysis.shouldEncrypt}`);
console.log(`  • Should Persist in URL: ${analysis.shouldPersistInURL}`);
console.log(`  • Should Persist Offline: ${analysis.shouldPersistOffline}`);
console.log(`  • Compression Algorithm: ${analysis.compressionAlgorithm || 'none'}`);

console.log('\n🧠 Reasoning:');
analysis.reasoning.forEach(reason => console.log(`  • ${reason}`));

console.log('\n🔍 Expected vs Actual Behavior:');
console.log('Expected (with explicit settings):');
console.log('  • url: true → should persist in URL');
console.log('  • offline: true → should persist offline');
console.log('  • autoConfig: false → should ignore auto-config');

console.log('\nActual (with autoConfig: true):');
console.log(`  • URL persistence: ${analysis.shouldPersistInURL ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`  • Offline persistence: ${analysis.shouldPersistOffline ? '✅ Enabled' : '❌ Disabled'}`);

console.log('\n🎯 Conclusion:');
if (analysis.shouldPersistOffline === false && jsonSize < 1000) {
  console.log('❌ ISSUE CONFIRMED: Auto-config is disabling offline persistence for data under 1000 chars');
  console.log('   This explains why your state resets on navigation!');
} else {
  console.log('✅ Auto-config behavior appears correct');
}

console.log('\n💡 Recommendation:');
console.log('Try using autoConfig: false with explicit settings:');
console.log(`
const [state, setState] = useSlugStore('clarity', initialState, {
  url: true,
  offline: true,
  autoConfig: false, // Disable auto-config
  debug: true
});
`); 