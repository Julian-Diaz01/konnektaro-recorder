'use client';

import React, { useState, useEffect } from 'react';
import { SimpleAudioRecorder } from '@/components/SimpleAudioRecorder';

interface MicrofrontendProps {
  token?: string;
  apiUrl?: string;
  timeout?: number;
}

export default function Home() {
  const [token, setToken] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [timeout, setTimeout] = useState<number>(60000);
  const [isInitialized, setIsInitialized] = useState(false);

  // Auto-configure from environment variables or props
  useEffect(() => {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlApiUrl = urlParams.get('apiUrl');
    const urlTimeout = urlParams.get('timeout');

    if (urlToken && urlApiUrl) {
      setToken(urlToken);
      setApiUrl(urlApiUrl);
      if (urlTimeout) {
        setTimeout(parseInt(urlTimeout, 10));
      }
      setIsInitialized(true);
      return;
    }

    // Check for props passed from parent application
    const parentProps = (window as any).microfrontendProps as MicrofrontendProps;
    if (parentProps?.token && parentProps?.apiUrl) {
      setToken(parentProps.token);
      setApiUrl(parentProps.apiUrl);
      if (parentProps.timeout) {
        setTimeout(parentProps.timeout);
      }
      setIsInitialized(true);
      return;
    }

    // Check environment variables for development
    const envToken = process.env.NEXT_PUBLIC_DEFAULT_TOKEN;
    const envApiUrl = process.env.NEXT_PUBLIC_DEFAULT_API_URL;
    
    if (envToken && envApiUrl) {
      setToken(envToken);
      setApiUrl(envApiUrl);
      setIsInitialized(true);
      return;
    }

    // If no configuration found, show error
    setIsInitialized(false);
  }, []);

  const handleTranscriptionComplete = (result: string) => {
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Konnektaro Audio Recorder
          </h1>
          <p className="text-red-500 mb-4">
            Configuration required: token and apiUrl must be provided
          </p>
          <div className="text-sm text-gray-500 max-w-md">
            <p className="mb-2">Provide configuration via:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>URL parameters: <code>?token=YOUR_TOKEN&apiUrl=YOUR_URL</code></li>
              <li>Parent app props: <code>window.microfrontendProps</code></li>
              <li>Environment variables: <code>NEXT_PUBLIC_DEFAULT_*</code></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SimpleAudioRecorder
      token={token}
      apiUrl={apiUrl}
      timeout={timeout}
      onTranscriptionComplete={handleTranscriptionComplete}
      onError={handleError}
    />
  );
}

