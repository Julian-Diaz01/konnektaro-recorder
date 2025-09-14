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
  token: string, 
  timeout: number = 30000
): Promise<TranscriptionResponse> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    console.log('Sending transcription request to:', apiUrl);
    
    const response = await axios.post(`${apiUrl}/api/transcribe`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
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

// Simple connection test
export const testConnection = async (apiUrl: string, token: string): Promise<boolean> => {
  try {
    await axios.get(`${apiUrl}/api/health`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      timeout: 5000,
    });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Consider 404 as a valid response (endpoint might not exist)
      if (error.response?.status === 404) {
        return true;
      }
    }
    return false;
  }
};