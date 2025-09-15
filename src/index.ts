// Main component exports
export { SimpleAudioRecorder } from './components/SimpleAudioRecorder';

// Hook exports
export { useAudioRecorder } from './hooks/useAudioRecorder';
export type { AudioRecorderState, AudioRecorderControls } from './hooks/useAudioRecorder';

// API client exports
export { transcribeAudio, testConnection } from './utils/apiClient';
export type { TranscriptionResponse } from './utils/apiClient';

// Main component with required environment variables
export { KonnektaroAudioRecorder } from './components/KonnektaroAudioRecorder';
