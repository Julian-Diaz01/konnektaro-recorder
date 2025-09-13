'use client';

import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { ApiClient, TranscriptionResponse } from '@/utils/apiClient';

interface AudioRecorderProps {
  apiUrl: string;
  token: string;
  timeout?: number;
  onTranscriptionComplete?: (transcription: string) => void;
  onError?: (error: string) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  apiUrl,
  token,
  timeout = 60000,
  onTranscriptionComplete,
  onError,
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const {
    isRecording,
    isPaused,
    recordingTime,
    hasPermission,
    error: recordingError,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    requestPermission,
  } = useAudioRecorder();

  // Initialize API client when props change
  useEffect(() => {
    if (apiUrl && token) {
      const client = new ApiClient({ 
        baseUrl: apiUrl, 
        token,
        timeout
      });
      setApiClient(client);
      
      // Test connection
      client.testConnection().then(isConnected => {
        setConnectionStatus(isConnected ? 'connected' : 'error');
      }).catch(() => {
        setConnectionStatus('error');
      });
    }
  }, [apiUrl, token]);

  const handleTranscribe = async () => {
    if (!audioBlob || !apiClient) return;

    setIsTranscribing(true);
    try {
      const result: TranscriptionResponse = await apiClient.transcribeAudio(audioBlob);
      
      if (result.success) {
        setTranscription(result.transcription);
        onTranscriptionComplete?.(result.transcription);
      } else {
        const errorMsg = result.error || 'Transcription failed';
        setTranscription('');
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMsg);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'checking': return 'text-yellow-500';
      case 'connected': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'checking': return 'Checking connection...';
      case 'connected': return 'Connected';
      case 'error': return 'Connection failed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎤 Audio Recorder</h2>
        <div className={`text-sm ${getConnectionStatusColor()}`}>
          {getConnectionStatusText()}
        </div>
      </div>

      {/* Permission Status */}
      {hasPermission === false && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-2">⚠️</div>
            <div>
              <p className="text-red-800 font-medium">Microphone access denied</p>
              <p className="text-red-600 text-sm">Please allow microphone access to record audio.</p>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="btn-primary mt-3"
          >
            Grant Permission
          </button>
        </div>
      )}

      {/* Recording Controls */}
      <div className="text-center mb-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={hasPermission === false || connectionStatus === 'error'}
            className="btn-primary text-lg px-8 py-3"
          >
            🎤 Start Recording
          </button>
        ) : (
          <div className="space-y-4">
            <div className="text-3xl font-mono font-bold text-primary-600">
              {formatTime(recordingTime)}
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="btn-secondary"
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={stopRecording}
                className="btn-primary"
              >
                ⏹️ Stop Recording
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {(recordingError || connectionStatus === 'error') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{recordingError || 'Failed to connect to API'}</p>
        </div>
      )}

      {/* Audio Playback */}
      {audioUrl && audioBlob && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-900 mb-3">Recorded Audio</h3>
          <div className="flex items-center space-x-3">
            <audio controls className="flex-1">
              <source src={audioUrl} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
            <div className="text-sm text-gray-500">
              {Math.round(audioBlob.size / 1024)} KB
            </div>
          </div>
          <div className="flex justify-center space-x-3 mt-4">
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing || connectionStatus !== 'connected'}
              className="btn-primary"
            >
              {isTranscribing ? '🔄 Transcribing...' : '📝 Transcribe'}
            </button>
            <button
              onClick={resetRecording}
              className="btn-secondary"
            >
              🔄 Record Again
            </button>
          </div>
        </div>
      )}

      {/* Transcription Result */}
      {transcription && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">Transcription Result:</h3>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <p className="text-gray-900 whitespace-pre-wrap">{transcription}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-600">
        <h4 className="font-medium mb-2">Instructions:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Click "Start Recording" to begin capturing audio</li>
          <li>Use pause/resume to control recording</li>
          <li>Click "Stop Recording" when finished</li>
          <li>Click "Transcribe" to send audio for processing</li>
          <li>Transcription result will appear below</li>
        </ul>
      </div>
    </div>
  );
};
