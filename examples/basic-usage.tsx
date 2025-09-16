import React from 'react';
import { KonnektaroAudioRecorder } from '@konnektaro/speech-to-text';

function App() {
  const handleTranscriptionComplete = (transcription: string) => {
    console.log('Transcription:', transcription);
    alert(`Transcription completed: ${transcription}`);
  };

  const handleError = (error: string) => {
    console.error('Error:', error);
    alert(`Error: ${error}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Konnektaro Audio Recorder Example</h1>
      
      <KonnektaroAudioRecorder
        apiUrl="https://your-api.com"
        token="your-auth-token"
        onTranscriptionComplete={handleTranscriptionComplete}
        onError={handleError}
        colors={{
          active: { background: "#ef4444", boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)" },
          ripple: "#ef4444"
        }}
      />
    </div>
  );
}

export default App;