import axios from 'axios';

export interface TranscriptionResponse {
  transcription: string;
  success: boolean;
  error?: string;
}

// Simple function-based API client
export const transcribeAudio = async (
  audioBlob: Blob, 
  apiUrl: string, 
  token: string = '', 
  timeout: number = 30000
): Promise<TranscriptionResponse> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, `audio-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(2, '0')}.webm`);

    console.log('Sending transcription request to:', apiUrl);
    
    // Build headers object
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };
    
    // Only add Authorization header if token is provided
    if (token && token.trim()) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(`${apiUrl}/api/transcribe`, formData, {
      headers,
      timeout,
    });

    console.log('Transcription response:', response.data);

    // Handle nested data structure
    const data = response.data.data || response.data;
    const transcription = data.transcription || data.text || '';
    
    console.log('Extracted data:', data);
    console.log('Extracted transcription:', transcription);

    return {
      transcription,
      success: true,
    };
  } catch (error) {
    console.error('Transcription error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const data = error.response.data;
        errorMessage = data?.error || data?.message || `HTTP ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error - no response from server';
      } else {
        // Something else happened
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      transcription: '',
      success: false,
      error: errorMessage,
    };
  }
};

// Simple connection test - just check if endpoint is accessible
export const testConnection = async (apiUrl: string, token: string = ''): Promise<boolean> => {
  try {
    // Build headers object
    const headers: Record<string, string> = {};
    
    // Only add Authorization header if token is provided
    if (token && token.trim()) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    await axios.get(`${apiUrl}/api/health`, {
      headers,
      timeout: 5000,
    });
    return true;
  } catch (error) {
    // If we get any response (even error), endpoint is accessible
    if (axios.isAxiosError(error) && error.response) {
      return true;
    }
    // Only return false if we can't reach the endpoint at all
    return false;
  }
};