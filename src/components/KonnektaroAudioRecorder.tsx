import React, {useState, useEffect, useCallback} from 'react';
import {useAudioRecorder} from '../hooks/useAudioRecorder';
import {transcribeAudio, testConnection} from '../utils/apiClient';

// TypeScript declarations for Speech Recognition API
declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

declare var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
};

export interface KonnektaroAudioRecorderProps {
    /**
     * API URL for transcription service
     * If not provided, will use native browser Speech API as fallback
     */
    apiUrl?: string;

    /**
     * Authentication token for API requests (optional but recommended for security)
     * If not provided, API requests will be made without authentication
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
     * Background color for the microphone button when active/recording
     * @default "#8b5cf6" (purple-500)
     */
    activeBackgroundColor?: string;

    /**
     * Background color for the microphone button when disabled
     * @default "#6b7280" (gray-500)
     */
    disabledBackgroundColor?: string;

    /**
     * Background color for the microphone button when stopped/idle
     * @default "#8b5cf6" (purple-500)
     */
    idleBackgroundColor?: string;

    /**
     * Color for the microphone icon
     * @default "#ffffff" (white)
     */
    iconColor?: string;

    /**
     * Color for the ripple effect when recording
     * @default "#a855f7" (purple-400)
     */
    rippleColor?: string;
}

/**
 * KonnektaroAudioRecorder - A React component for audio recording and transcription
 *
 * This component supports two modes:
 * 1. API Mode: Provide apiUrl prop (token is optional but recommended)
 * 2. Speech API Mode: Uses native browser Speech Recognition API as fallback
 *
 * @example
 * ```tsx
 * // Using API mode with authentication
 * <KonnektaroAudioRecorder 
 *   apiUrl="https://api.example.com" 
 *   token="your-token" 
 * />
 *
 * // Using API mode without authentication
 * <KonnektaroAudioRecorder 
 *   apiUrl="https://api.example.com" 
 * />
 *
 * // Using Speech API mode (no props needed)
 * <KonnektaroAudioRecorder />
 * ```
 */
export const KonnektaroAudioRecorder: React.FC<KonnektaroAudioRecorderProps> = ({
                                                                                    apiUrl: propApiUrl,
                                                                                    token: propToken,
                                                                                    timeout = 60000,
                                                                                    onTranscriptionComplete,
                                                                                    onError,
                                                                                    activeBackgroundColor = "#8b5cf6",
                                                                                    disabledBackgroundColor = "#6b7280",
                                                                                    idleBackgroundColor = "#8b5cf6",
                                                                                    iconColor = "#ffffff",
                                                                                    rippleColor = "#a855f7",
                                                                                }) => {
    const [apiUrl, setApiUrl] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [useSpeechAPI, setUseSpeechAPI] = useState(false);
    const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
    const [isListening, setIsListening] = useState(false);

    const {
        isRecording,
        hasPermission,
        audioBlob,
        startRecording,
        stopRecording,
    } = useAudioRecorder();

    // Initialize configuration
    useEffect(() => {
        const initializeConfig = () => {
            // Priority 1: API Mode (with or without token)
            if (propApiUrl) {
                setApiUrl(propApiUrl);
                setToken(propToken || ''); // Token is optional
                setUseSpeechAPI(false);
                setError('');
                return;
            }

            // Check for Speech API support
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                setUseSpeechAPI(true);
                setError('');
                return;
            }

            // No configuration and no Speech API support
            setUseSpeechAPI(false);
            setError('No API configuration provided and Speech Recognition API is not supported in this browser.');
        };

        initializeConfig();
    }, [propApiUrl, propToken]);

    // Initialize Speech Recognition API
    useEffect(() => {
        if (useSpeechAPI) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onstart = () => {
                    setIsListening(true);
                };

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    const transcript = event.results[0][0].transcript;
                    onTranscriptionComplete?.(transcript);
                };

                recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                    onError?.(`Speech recognition error: ${event.error}`);
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                setSpeechRecognition(recognition);
                setConnectionStatus('connected');
            }
        }
    }, [useSpeechAPI, onTranscriptionComplete, onError]);

    // Test connection when configured with API
    useEffect(() => {
        const testConn = async () => {
            if (!useSpeechAPI && apiUrl) {
                try {
                    const isConnected = await testConnection(apiUrl, token || '');
                    setConnectionStatus(isConnected ? 'connected' : 'error');
                } catch (error) {
                    setConnectionStatus('error');
                }
            }
        };

        testConn();
    }, [useSpeechAPI, apiUrl, token]);

    // Auto-transcribe when recording stops (API mode only)
    useEffect(() => {
        if (audioBlob && connectionStatus === 'connected' && !useSpeechAPI) {
            handleTranscribe();
        }
    }, [audioBlob, connectionStatus, useSpeechAPI]);

    const handleTranscribe = useCallback(async () => {
        if (!audioBlob || !apiUrl) return;

        setIsTranscribing(true);
        try {
            const result = await transcribeAudio(audioBlob, apiUrl, token || '', timeout);

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
        if (useSpeechAPI) {
            // Speech API mode
            if (speechRecognition) {
                if (isListening) {
                    speechRecognition.stop();
                } else {
                    speechRecognition.start();
                }
            }
        } else {
            // API mode
            if (hasPermission === false) {
                onError?.('Microphone access denied');
                return;
            }

            if (isRecording) {
                stopRecording();
            } else {
                await startRecording();
            }
        }
    }, [useSpeechAPI, speechRecognition, isListening, hasPermission, isRecording, startRecording, stopRecording, onError]);

    const isDisabled = () => {
        if (useSpeechAPI) {
            return connectionStatus === 'error' || connectionStatus === 'checking';
        } else {
            return hasPermission === false ||
                connectionStatus === 'error' ||
                isTranscribing ||
                connectionStatus === 'checking';
        }
    };

    return (
        <>
            <style>
                {`
                    @keyframes ripple-fade {
                        0% {
                            transform: scale(0.8);
                            opacity: 0.8;
                        }
                        50% {
                            transform: scale(1.2);
                            opacity: 0.4;
                        }
                        100% {
                            transform: scale(1.5);
                            opacity: 0;
                        }
                    }
                `}
            </style>
            <div className="relative min-h-screen bg-gradient-to-b from-white to-blue-50 p-4">

            {/* Fixed center microphone with ripple effect */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative">
                    {/* Ripple Effect Container */}
                    <div className="relative flex items-center justify-center">
                        {/* Ripple circles for recording/listening animation */}
                        {(isRecording || isListening) && (
                            <>
                                <div
                                    className="absolute w-32 h-32 border-2 rounded-full animate-ping opacity-0"
                                    style={{
                                        borderColor: rippleColor,
                                        animation: 'ripple-fade 2s ease-out infinite'
                                    }}></div>
                                <div
                                    className="absolute w-40 h-40 border-2 rounded-full animate-ping opacity-0"
                                    style={{
                                        borderColor: rippleColor,
                                        animation: 'ripple-fade 2s ease-out infinite 0.3s'
                                    }}></div>
                                <div
                                    className="absolute w-48 h-48 border-2 rounded-full animate-ping opacity-0"
                                    style={{
                                        borderColor: rippleColor,
                                        animation: 'ripple-fade 2s ease-out infinite 0.6s'
                                    }}></div>
                            </>
                        )}

                        {/* Main microphone button */}
                        <button
                            onClick={handleMicrophoneClick}
                            disabled={isDisabled()}
                            className="relative z-10 w-40 h-40 rounded-full transition-all duration-300 transform shadow-md hover:shadow-lg active:scale-95"
                            style={{
                                backgroundColor: isDisabled() 
                                    ? disabledBackgroundColor 
                                    : (isRecording || isListening) 
                                        ? activeBackgroundColor 
                                        : idleBackgroundColor,
                                opacity: isDisabled() ? 0.5 : 1,
                                cursor: isDisabled() ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {/* Microphone Icon */}
                            <div className="text-6xl transition-all duration-300 justify-items-center" style={{color: iconColor}}>
                                {(isRecording || isListening) ? (
                                    // Recording/Listening state - microphone with waves
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2 m-auto">
                                        <path
                                            d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                        <path
                                            d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                                    </svg>
                                ) : isTranscribing ? (
                                    // Transcribing state - loading spinner
                                    <svg viewBox="0 0 24 24" className="w-1/2 h-1/2 m-auto animate-spin">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"
                                                opacity="0.3"/>
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2"
                                              fill="none" strokeLinecap="round"/>
                                    </svg>
                                ) : (!useSpeechAPI && hasPermission === false) ? (
                                    // No permission state - microphone with X (API mode only)
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2 m-auto">
                                        <path
                                            d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                        <path
                                            d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                                        <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2"
                                              strokeLinecap="round"/>
                                    </svg>
                                ) : (
                                    // Default state - regular microphone
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2 m-auto">
                                        <path
                                            d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                        <path
                                            d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                                    </svg>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};
