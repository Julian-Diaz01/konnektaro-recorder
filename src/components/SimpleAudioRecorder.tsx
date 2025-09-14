'use client';

import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { transcribeAudio, testConnection, TranscriptionResponse } from '@/utils/apiClient';

interface SimpleAudioRecorderProps {
  apiUrl: string;
  token: string;
  timeout?: number;
  onTranscriptionComplete?: (transcription: string) => void;
  onError?: (error: string) => void;
}

export const SimpleAudioRecorder: React.FC<SimpleAudioRecorderProps> = ({
  apiUrl,
  token,
  timeout = 60000,
  onTranscriptionComplete,
  onError,
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [transcriptionPreview, setTranscriptionPreview] = useState<string>('');

  const {
    isRecording,
    hasPermission,
    error: recordingError,
    audioBlob,
    startRecording,
    stopRecording,
    requestPermission,
  } = useAudioRecorder();

  // Test connection when props change
  useEffect(() => {
    if (apiUrl && token) {
      testConnection(apiUrl, token).then(isConnected => {
        setConnectionStatus(isConnected ? 'connected' : 'error');
      }).catch(() => {
        setConnectionStatus('error');
      });
    }
  }, [apiUrl, token]);

  // Auto-transcribe when recording stops
  useEffect(() => {
    if (audioBlob && connectionStatus === 'connected') {
      handleTranscribe();
    }
  }, [audioBlob, connectionStatus]);

  const handleTranscribe = async () => {
    if (!audioBlob || !apiUrl || !token) return;

    setIsTranscribing(true);
    setTranscriptionPreview(''); // Clear previous preview
    try {
      const result: TranscriptionResponse = await transcribeAudio(audioBlob, apiUrl, token, timeout);
      
      if (result.success) {
        setTranscriptionPreview(result.transcription);
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
  };

  const handleMicrophoneClick = async () => {
    if (hasPermission === false) {
      await requestPermission();
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  // Helper functions for cleaner code
  const isDisabled = () => hasPermission === false || connectionStatus === 'error' || isTranscribing || connectionStatus === 'checking';
  const isError = () => hasPermission === false || connectionStatus === 'error';
  const getInstructionText = () => {
    if (connectionStatus === 'checking') return 'Connecting...';
    if (connectionStatus === 'error') return 'Connection failed';
    if (hasPermission === false) return 'Microphone access denied';
    if (isRecording) return 'Recording... Tap to stop';
    if (isTranscribing) return 'Processing audio...';
    return 'Speak now';
  };
console.log(isDisabled(), isError())
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-blue-50 p-4">
      {/* Top instruction */}
      <div className="flex justify-center items-center mb-12 mt-8">
        <button
            className={`
              px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300
              ${isRecording || isDisabled()
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 shadow-lg hover:shadow-xl'
              }
            `}
          disabled={isRecording || isDisabled()}
        >
          {getInstructionText()}
        </button>
      </div>

      {/* Fixed center microphone with ripple effect */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative">
          {/* Ripple Effect Container */}
          <div className="relative flex items-center justify-center">
            {/* Ripple circles for recording animation */}
            {isRecording && (
              <>
                <div className="absolute w-48 h-48 border-4 border-purple-400 rounded-full animate-ping opacity-60"></div>
                <div className="absolute w-64 h-64 border-4 border-purple-300 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute w-80 h-80 border-4 border-purple-200 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.6s' }}></div>
              </>
            )}
            
            {/* Main microphone button */}
            <button
              onClick={handleMicrophoneClick}
              disabled={isDisabled()}
              className={`
                relative z-10 w-40 h-40 rounded-full transition-all duration-300 transform
                ${isError() 
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

      {/* Transcription Preview - Fixed position */}
      {transcriptionPreview && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-10 max-w-2xl w-full px-4">
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-300 p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-600">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-black mb-2">Transcription Preview</h3>
                <p className="text-black text-base leading-relaxed font-medium">{transcriptionPreview}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom info button with tooltip */}
      <div className="bottom-8 left-1/2 transform -translate-x-1/2 relative group z-10">
        <button
          className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div className="bg-gray-900 text-white text-sm rounded-lg p-4 w-screen/2 min-w-64 shadow-lg">
            <div className="text-center mb-3">
              <div className="text-2xl mb-2">🎤</div>
              <div className="font-semibold text-base">How to use:</div>
            </div>
            <div className="space-y-2 text-left">
              <div className="flex items-start space-x-2">
                <span className="text-purple-300 font-bold">1.</span>
                <span>Tap microphone when <span className="font-semibold text-purple-300">purple</span></span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-300 font-bold">2.</span>
                <span>Wait for transcription</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-300 font-bold">3.</span>
                <span>Click <span className="font-semibold text-green-300">OK</span> to send to Konnektaro chat</span>
              </div>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
