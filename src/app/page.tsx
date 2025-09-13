'use client';

import React, { useState, useEffect } from 'react';
import { AudioRecorder } from '@/components/AudioRecorder';

interface MicrofrontendProps {
  token?: string;
  apiUrl?: string;
}

export default function Home() {
  const [token, setToken] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [transcription, setTranscription] = useState<string>('');

  // Check for props from parent application or URL parameters
  useEffect(() => {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlApiUrl = urlParams.get('apiUrl');

    if (urlToken && urlApiUrl) {
      setToken(urlToken);
      setApiUrl(urlApiUrl);
      setIsInitialized(true);
      return;
    }

    // Check for props passed from parent application
    // This would be used when embedded as a microfrontend
    const parentProps = (window as any).microfrontendProps as MicrofrontendProps;
    if (parentProps?.token && parentProps?.apiUrl) {
      setToken(parentProps.token);
      setApiUrl(parentProps.apiUrl);
      setIsInitialized(true);
      return;
    }

    // For development/testing - show configuration form
    setIsInitialized(false);
  }, []);

  const handleInitialize = () => {
    if (token.trim() && apiUrl.trim()) {
      setIsInitialized(true);
    }
  };

  const handleTranscriptionComplete = (result: string) => {
    setTranscription(result);
    
    // Send result back to parent application if embedded
    if ((window as any).parent !== window) {
      (window as any).parent.postMessage({
        type: 'TRANSCRIPTION_COMPLETE',
        transcription: result,
      }, '*');
    }
  };

  const handleError = (error: string) => {
    console.error('Audio recorder error:', error);
    
    // Send error back to parent application if embedded
    if ((window as any).parent !== window) {
      (window as any).parent.postMessage({
        type: 'TRANSCRIPTION_ERROR',
        error: error,
      }, '*');
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🎤 Konnektaro Recorder
            </h1>
            <p className="text-gray-600">
              Configure your API connection to start recording
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-2">
                API URL
              </label>
              <input
                id="apiUrl"
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://your-api.com"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                Authentication Token
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Your authentication token"
                className="input-field"
              />
            </div>

            <button
              onClick={handleInitialize}
              disabled={!token.trim() || !apiUrl.trim()}
              className="btn-primary w-full"
            >
              Initialize Recorder
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2">This microfrontend can be integrated in two ways:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>URL parameters: <code>?token=YOUR_TOKEN&apiUrl=YOUR_URL</code></li>
              <li>Parent application props: <code>window.microfrontendProps</code></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <AudioRecorder
          token={token}
          apiUrl={apiUrl}
          onTranscriptionComplete={handleTranscriptionComplete}
          onError={handleError}
        />

        {/* Transcription Output */}
        {transcription && (
          <div className="mt-8 card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📝 Latest Transcription
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-900 whitespace-pre-wrap">{transcription}</p>
            </div>
            <button
              onClick={() => setTranscription('')}
              className="btn-secondary mt-3"
            >
              Clear
            </button>
          </div>
        )}

        {/* Integration Instructions */}
        <div className="mt-8 card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            🔗 Integration Guide
          </h3>
          <div className="text-sm text-blue-800 space-y-3">
            <p>
              <strong>For Microfrontend Integration:</strong>
            </p>
            <pre className="bg-blue-100 p-3 rounded text-xs overflow-x-auto">
{`// Set props before loading the microfrontend
window.microfrontendProps = {
  token: 'your-auth-token',
  apiUrl: 'https://your-api.com'
};

// Listen for transcription results
window.addEventListener('message', (event) => {
  if (event.data.type === 'TRANSCRIPTION_COMPLETE') {
    console.log('Transcription:', event.data.transcription);
  }
});`}
            </pre>
            
            <p>
              <strong>For URL-based Integration:</strong>
            </p>
            <p className="text-xs">
              <code>
                /?token=YOUR_TOKEN&apiUrl=https://your-api.com
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

