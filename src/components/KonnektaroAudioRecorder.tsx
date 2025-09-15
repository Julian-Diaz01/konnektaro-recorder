import React, { useState, useEffect, useCallback } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio, testConnection } from '../utils/apiClient';

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
}) => {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const {
    isRecording,
    hasPermission,
    error: recordingError,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

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

      // Configuration error
      setIsConfigured(false);
      setError('Missing required configuration. Please provide apiUrl and token via props or environment variables.');
    };

    initializeConfig();
  }, [propApiUrl, propToken]);

  // Test connection when configured
  useEffect(() => {
    const testConn = async () => {
      if (isConfigured && apiUrl && token) {
        try {
          const isConnected = await testConnection(apiUrl, token);
          setConnectionStatus(isConnected ? 'connected' : 'error');
        } catch (error) {
          setConnectionStatus('error');
        }
      }
    };

    testConn();
  }, [isConfigured, apiUrl, token]);

  // Auto-transcribe when recording stops
  useEffect(() => {
    if (audioBlob && connectionStatus === 'connected') {
      handleTranscribe();
    }
  }, [audioBlob, connectionStatus]);

  const handleTranscribe = useCallback(async () => {
    if (!audioBlob || !apiUrl || !token) return;

    setIsTranscribing(true);
    try {
      const result = await transcribeAudio(audioBlob, apiUrl, token, timeout);
      
      if (result.success) {
        onTranscriptionComplete?.(result.transcription);
      } else {
        const errorMsg = result.error || 'Transcription failed';
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMsg);
    } finally {
      setIsTranscribing(false);
    }
  }, [audioBlob, apiUrl, token, timeout, onTranscriptionComplete, onError]);

  const handleMicrophoneClick = useCallback(async () => {
    if (hasPermission === false) {
      onError?.('Microphone access denied');
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [hasPermission, isRecording, startRecording, stopRecording, onError]);

  const isDisabled = () => 
    hasPermission === false || 
    connectionStatus === 'error' || 
    isTranscribing || 
    connectionStatus === 'checking';

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 p-4">
        {/* Status indicator */}
        <div className="mb-6 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : connectionStatus === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {connectionStatus === 'connected' ? '✓ Connected' : 
             connectionStatus === 'error' ? '✗ Connection Error' : '⏳ Connecting...'}
          </div>
        </div>

        {/* Main microphone button */}
        <div className="relative mb-6">
          <div className="relative flex items-center justify-center">
            {/* Ripple circles for recording animation */}
            {isRecording && (
              <>
                <div className="absolute w-32 h-32 border-4 border-purple-400 rounded-full animate-ping opacity-60"></div>
                <div className="absolute w-40 h-40 border-4 border-purple-300 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute w-48 h-48 border-4 border-purple-200 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.6s' }}></div>
              </>
            )}
            
            {/* Main microphone button */}
            <button
              onClick={handleMicrophoneClick}
              disabled={isDisabled()}
              className={`
                relative z-10 w-40 h-40 rounded-full transition-all duration-300 transform
                ${hasPermission === false || connectionStatus === 'error'
                  ? 'bg-primary-60 shadow-md opacity-50 cursor-not-allowed'
                  : 'bg-purple-500 shadow-md hover:shadow-lg active:scale-95'
                }
              `}
            >
              {/* Microphone Icon - Always White */}
              <div className="text-white text-6xl transition-all duration-300">
                {isRecording ? (
                  // Recording state - microphone with waves
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2 m-auto">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                ) : isTranscribing ? (
                  // Transcribing state - loading spinner
                  <svg viewBox="0 0 24 24" className="w-1/2 h-1/2 m-auto animate-spin">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                ) : hasPermission === false ? (
                  // No permission state - microphone with X
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2 m-auto">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  // Default state - regular microphone
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2 m-auto">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
