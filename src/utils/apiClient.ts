import axios, { AxiosInstance, AxiosError } from 'axios';

export interface ApiClientConfig {
  baseUrl: string;
  token: string;
  timeout?: number;
}

export interface TranscriptionResponse {
  transcription: string;
  success: boolean;
  error?: string;
}

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000, // 30 seconds default timeout
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
        return config;
      },
      (error: any) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: any) => {
        console.log(`Response received:`, response.status, response.statusText);
        return response;
      },
      (error: AxiosError) => {
        console.error('Response interceptor error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }

  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await this.axiosInstance.post('/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        transcription: response.data.transcription || '',
        success: true,
      };
    } catch (error) {
      console.error('Transcription API error:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          // Server responded with error status
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;
          errorMessage = data?.error || data?.message || `HTTP ${status}: ${axiosError.response.statusText}`;
        } else if (axiosError.request) {
          // Request was made but no response received
          errorMessage = 'Network error - no response from server';
        } else {
          // Something else happened
          errorMessage = axiosError.message;
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
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.axiosInstance.get('/health');
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        // Consider 404 as a valid response (endpoint might not exist)
        if (axiosError.response?.status === 404) {
          return true;
        }
      }
      return false;
    }
  }

  // Method to update token without recreating the instance
  updateToken(newToken: string): void {
    this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${newToken}`;
  }

  // Method to update base URL
  updateBaseUrl(newBaseUrl: string): void {
    this.baseUrl = newBaseUrl;
    this.axiosInstance.defaults.baseURL = newBaseUrl;
  }
}
