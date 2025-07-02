'use client';

import { useState, useEffect } from 'react';
import { useSlugStore } from '../../../packages/slug-store/src/client';

interface RefreshTestState {
  refreshCount: number;
  timestamp: number;
  testData: string;
  sessionId: string;
}

export function RefreshTest() {
  const [refreshTestState, setRefreshTestState] = useSlugStore<RefreshTestState>(
    'refresh-test',
    {
      refreshCount: 0,
      timestamp: Date.now(),
      testData: 'Initial test data',
      sessionId: Math.random().toString(36).substring(7)
    },
    {
      url: true,
      offline: true,
      autoConfig: false,
      debug: true
    }
  );

  const [logs, setLogs] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');

  // Log function
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1]?.split('.')[0] || 'unknown';
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🧪 RefreshTest: ${message}`);
  };

  // Update URL display
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [refreshTestState]);

  // Log when component mounts (after refresh)
  useEffect(() => {
    addLog(`Component mounted with refreshCount: ${refreshTestState.refreshCount}`);
    addLog(`Session ID: ${refreshTestState.sessionId}`);
    addLog(`Data age: ${((Date.now() - refreshTestState.timestamp) / 1000).toFixed(1)}s`);
    
    // Check if this is a refresh by looking at refresh count vs session data
    const isLikelyRefresh = refreshTestState.refreshCount > 0;
    if (isLikelyRefresh) {
      addLog('✅ State survived page refresh!');
    } else {
      addLog('🔍 First load or state reset');
    }
  }, []); // Empty dependency array = runs on mount only

  const incrementRefreshCount = () => {
    const newState = {
      ...refreshTestState,
      refreshCount: refreshTestState.refreshCount + 1,
      timestamp: Date.now()
    };
    setRefreshTestState(newState);
    addLog(`Incremented refresh count to ${newState.refreshCount}`);
  };

  const updateTestData = () => {
    const newData = `Test data updated at ${new Date().toISOString()}`;
    const newState = {
      ...refreshTestState,
      testData: newData,
      timestamp: Date.now()
    };
    setRefreshTestState(newState);
    addLog('Updated test data');
  };

  const simulateRefresh = () => {
    addLog('Simulating page refresh...');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 500);
  };

  const simulateNavigation = () => {
    addLog('Simulating navigation...');
    if (typeof window !== 'undefined') {
      // Navigate to the same page with hash to test URL preservation
      const currentUrl = new URL(window.location.href);
      currentUrl.hash = 'navigated';
      window.history.pushState({}, '', currentUrl.toString());
      
      // Then navigate back
      setTimeout(() => {
        window.history.back();
      }, 1000);
    }
  };

  const clearState = () => {
    const newState = {
      refreshCount: 0,
      timestamp: Date.now(),
      testData: 'Reset test data',
      sessionId: Math.random().toString(36).substring(7)
    };
    setRefreshTestState(newState);
    addLog('State cleared and reset');
  };

  const checkUrlState = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const stateParam = url.searchParams.get('refresh-test');
      addLog(`URL has state parameter: ${!!stateParam}`);
      if (stateParam) {
        addLog(`State parameter length: ${stateParam.length} chars`);
        try {
          const decoded = JSON.parse(decodeURIComponent(stateParam));
          addLog(`Decoded refresh count: ${decoded.refreshCount}`);
        } catch (error) {
          addLog(`Failed to decode URL state: ${error}`);
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">🔄 Refresh & Navigation Test</h2>
        
        {/* Current State Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Current State</h3>
            <div className="space-y-1 text-sm">
              <div>Refresh Count: <span className="font-mono font-bold">{refreshTestState.refreshCount}</span></div>
              <div>Session ID: <span className="font-mono">{refreshTestState.sessionId}</span></div>
              <div>Timestamp: <span className="font-mono">{new Date(refreshTestState.timestamp).toLocaleTimeString()}</span></div>
              <div>Test Data: <span className="font-mono text-xs">{refreshTestState.testData}</span></div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">URL Info</h3>
            <div className="text-xs font-mono break-all">
              {currentUrl.length > 80 ? currentUrl.substring(0, 80) + '...' : currentUrl}
            </div>
            <div className="text-sm mt-2">
              Length: {currentUrl.length} chars
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={incrementRefreshCount}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Increment Counter
          </button>
          <button
            onClick={updateTestData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Update Test Data
          </button>
          <button
            onClick={simulateRefresh}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            🔄 Refresh Page
          </button>
          <button
            onClick={simulateNavigation}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🔗 Test Navigation
          </button>
          <button
            onClick={checkUrlState}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            🔍 Check URL State
          </button>
          <button
            onClick={clearState}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🗑️ Clear State
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>Click "Increment Counter" a few times to change the state</li>
            <li>Click "🔄 Refresh Page" to test if state survives refresh</li>
            <li>Try navigating away and back using browser buttons</li>
            <li>Check if the counter value persists across refreshes</li>
            <li>Verify URL contains the state parameter</li>
          </ol>
        </div>

        {/* Activity Log */}
        <div className="bg-gray-50 rounded p-4">
          <h3 className="font-semibold mb-2">Activity Log</h3>
          <div className="h-40 overflow-y-auto border bg-white p-2 rounded">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-sm">No activity yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs font-mono mb-1 last:mb-0">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 