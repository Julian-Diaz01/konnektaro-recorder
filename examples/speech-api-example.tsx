import React, { useState } from 'react';
import { KonnektaroAudioRecorder } from '../src/components/KonnektaroAudioRecorder';

/**
 * Example demonstrating both API mode and Speech API mode
 */
export const SpeechAPIExample: React.FC = () => {
    const [transcription, setTranscription] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [mode, setMode] = useState<'api' | 'speech'>('speech');

    const handleTranscriptionComplete = (text: string) => {
        setTranscription(text);
        setError('');
    };

    const handleError = (err: string) => {
        setError(err);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Konnektaro Audio Recorder - Dual Mode Demo
                </h1>

                {/* Mode Selection */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Select Mode:</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setMode('speech')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                mode === 'speech'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Speech API Mode (No Setup)
                        </button>
                        <button
                            onClick={() => setMode('api')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                mode === 'api'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            API Mode (No Auth Required)
                        </button>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        {mode === 'speech' ? (
                            <p>
                                <strong>Speech API Mode:</strong> Uses native browser Speech Recognition API. 
                                Works in Chrome, Edge, and Safari (limited). No setup required!
                            </p>
                        ) : (
                            <p>
                                <strong>API Mode:</strong> Only requires apiUrl prop (token is optional). 
                                This example will show an error since no API is configured.
                            </p>
                        )}
                    </div>
                </div>

                {/* Audio Recorder */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Audio Recorder:</h2>
                    {mode === 'api' ? (
                        <KonnektaroAudioRecorder
                            // No props provided - will show configuration error
                            onTranscriptionComplete={handleTranscriptionComplete}
                            onError={handleError}
                        />
                    ) : (
                        <KonnektaroAudioRecorder
                            // Speech API mode - no props needed
                            onTranscriptionComplete={handleTranscriptionComplete}
                            onError={handleError}
                        />
                    )}
                </div>

                {/* Results */}
                {(transcription || error) && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Results:</h2>
                        {transcription && (
                            <div className="mb-4">
                                <h3 className="font-medium text-gray-700 mb-2">Transcription:</h3>
                                <p className="bg-gray-100 p-3 rounded-lg text-gray-900">
                                    {transcription}
                                </p>
                            </div>
                        )}
                        {error && (
                            <div>
                                <h3 className="font-medium text-red-700 mb-2">Error:</h3>
                                <p className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-800">
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">How to Use:</h2>
                    <ol className="list-decimal list-inside space-y-2 text-blue-800">
                        <li>Select your preferred mode above</li>
                        <li>Click the microphone button in the center</li>
                        <li>Speak clearly into your microphone</li>
                        <li>Click the microphone button again to stop</li>
                        <li>View your transcription results below</li>
                    </ol>
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                        <p className="text-blue-900 text-sm">
                            <strong>Note:</strong> Speech API mode works best in Chrome and Edge browsers. 
                            Make sure to allow microphone permissions when prompted.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpeechAPIExample;
