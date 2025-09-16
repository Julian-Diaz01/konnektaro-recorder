// Hook exports
export { useAudioRecorder } from './hooks/useAudioRecorder';
export type { AudioRecorderState, AudioRecorderControls } from './hooks/useAudioRecorder';

// API client exports
export { transcribeAudio, testConnection } from './utils/apiClient';
export type { TranscriptionResponse } from './utils/apiClient';

// Main component exports
export { KonnektaroAudioRecorder } from './components/KonnektaroAudioRecorder';
export type { KonnektaroAudioRecorderProps } from './components/KonnektaroAudioRecorder';
