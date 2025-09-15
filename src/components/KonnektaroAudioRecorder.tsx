import React, { useState, useEffect } from 'react';
import { SimpleAudioRecorder } from './SimpleAudioRecorder';

export interface KonnektaroAudioRecorderProps {
  /**
   * API URL for transcription service - REQUIRED
   * Must be provided via props or environment variable
   */
  apiUrl?: string;
  
  /**
   * Authentication token for API requests - REQUIRED
   * Must be provided via props or environment variable
   */
  token?: string;
  
  /**
   * Request timeout in milliseconds
   * @default 60000
   */
  timeout?: number;
  
  /**
   * Callback when transcription is completed
   */
  onTranscriptionComplete?: (transcription: string) => void;
  
  /**
   * Callback when an error occurs
   */
  onError?: (error: string) => void;
  
  /**
   * Custom CSS class name for styling
   */
  className?: string;
  
  /**
   * Whether to show the simple or full recorder interface
   * @default 'simple'
   */
  variant?: 'simple' | 'full';
}

/**
 * KonnektaroAudioRecorder - A React component for audio recording and transcription
 * 
 * This component requires either:
 * 1. apiUrl and token props to be provided directly
 * 2. Environment variables NEXT_PUBLIC_KONNEKTARO_API_URL and NEXT_PUBLIC_KONNEKTARO_TOKEN
 * 
 * @example
 * ```tsx
 * // Using props
 * <KonnektaroAudioRecorder 
 *   apiUrl="https://api.example.com" 
 *   token="your-token" 
 * />
 * 
 * // Using environment variables
 * // NEXT_PUBLIC_KONNEKTARO_API_URL=https://api.example.com
 * // NEXT_PUBLIC_KONNEKTARO_TOKEN=your-token
 * <KonnektaroAudioRecorder />
 * ```
 */
export const KonnektaroAudioRecorder: React.FC<KonnektaroAudioRecorderProps> = ({
  apiUrl: propApiUrl,
  token: propToken,
  timeout = 60000,
  onTranscriptionComplete,
  onError,
  className,
  variant = 'simple',
}) => {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize configuration
  useEffect(() => {
    const initializeConfig = () => {
      // Priority 1: Props
      if (propApiUrl && propToken) {
        setApiUrl(propApiUrl);
        setToken(propToken);
        setIsConfigured(true);
        setError('');
        return;
      }

      // Priority 2: Environment variables (for build-time configuration)
      const envApiUrl = typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_KONNEKTARO_API_URL : undefined;
      const envToken = typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_KONNEKTARO_TOKEN : undefined;

      if (envApiUrl && envToken) {
        setApiUrl(envApiUrl);
        setToken(envToken);
        setIsConfigured(true);
        setError('');
        return;
      }

      // Priority 3: Partial props with env fallback
      const finalApiUrl = propApiUrl || envApiUrl;
      const finalToken = propToken || envToken;

      if (finalApiUrl && finalToken) {
        setApiUrl(finalApiUrl);
        setToken(finalToken);
        setIsConfigured(true);
        setError('');
        return;
      }

      // Configuration error
      setIsConfigured(false);
      setError('Missing required configuration. Please provide apiUrl and token via props or environment variables.');
    };

    initializeConfig();
  }, [propApiUrl, propToken]);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
  };

  const handleTranscriptionComplete = (transcription: string) => {
    setError('');
    onTranscriptionComplete?.(transcription);
  };

  if (!isConfigured) {
    return (
      <div className={`konnektaro-audio-recorder-error ${className || ''}`}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🎤</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Konnektaro Audio Recorder
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium mb-2">Configuration Required</p>
              <p className="text-red-600 text-sm mb-3">{error}</p>
              <div className="text-sm text-red-600">
                <p className="mb-2">Provide configuration via:</p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Props: <code className="bg-red-100 px-1 rounded">apiUrl</code> and <code className="bg-red-100 px-1 rounded">token</code></li>
                  <li>Environment variables: <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_KONNEKTARO_API_URL</code> and <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_KONNEKTARO_TOKEN</code></li>
                </ul>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p className="mb-2">Example usage:</p>
              <pre className="bg-gray-100 p-2 rounded text-left text-xs overflow-x-auto">
{`<KonnektaroAudioRecorder 
  apiUrl="https://api.example.com" 
  token="your-token" 
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`konnektaro-audio-recorder ${className || ''}`}>
      <SimpleAudioRecorder
        apiUrl={apiUrl}
        token={token}
        timeout={timeout}
        onTranscriptionComplete={handleTranscriptionComplete}
        onError={handleError}
      />
    </div>
  );
};
