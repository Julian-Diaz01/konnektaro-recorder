import React from 'react';
import { KonnektaroAudioRecorder } from '@konnektaro/speech-to-text';

/**
 * Basic usage example with props
 */
export function BasicExample() {
  const handleTranscriptionComplete = (transcription: string) => {
    console.log('Transcription completed:', transcription);
    // Handle the transcription result
  };

  const handleError = (error: string) => {
    console.error('Error occurred:', error);
    // Handle errors
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Audio Recorder Example</h1>
      <KonnektaroAudioRecorder
        apiUrl="https://your-api.com"
        token="your-auth-token"
        timeout={60000}
        onTranscriptionComplete={handleTranscriptionComplete}
        onError={handleError}
        className="my-custom-recorder"
      />
    </div>
  );
}

/**
 * Example using environment variables
 * Set NEXT_PUBLIC_KONNEKTARO_API_URL and NEXT_PUBLIC_KONNEKTARO_TOKEN
 */
export function EnvironmentExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Audio Recorder with Environment Variables</h1>
      <KonnektaroAudioRecorder
        onTranscriptionComplete={(transcription) => {
          console.log('Transcription:', transcription);
        }}
        onError={(error) => {
          console.error('Error:', error);
        }}
      />
    </div>
  );
}

/**
 * Example with custom styling
 */
export function StyledExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Styled Audio Recorder</h1>
      <KonnektaroAudioRecorder
        apiUrl="https://your-api.com"
        token="your-auth-token"
        className="custom-recorder-style"
        onTranscriptionComplete={(transcription) => {
          alert(`Transcription: ${transcription}`);
        }}
        onError={(error) => {
          alert(`Error: ${error}`);
        }}
      />
    </div>
  );
}
