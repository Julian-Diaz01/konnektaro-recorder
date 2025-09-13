# Konnektaro Audio Recorder Microfrontend

A Next.js TypeScript microfrontend for audio recording and transcription, designed to be embedded in larger applications.

## Features

- 🎤 **Audio Recording**: High-quality audio recording with WebRTC
- 📱 **Cross-Platform**: Works on both mobile and web browsers
- 🔐 **Token Authentication**: Secure API communication with bearer tokens
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🔌 **Microfrontend Ready**: Easy integration with parent applications
- ⚡ **Real-time**: Live recording timer and audio playback
- 🛡️ **Permission Handling**: Graceful microphone permission management
- 📡 **Axios HTTP Client**: Robust HTTP requests with interceptors and error handling
- ⏱️ **Configurable Timeouts**: Customizable request timeouts for different scenarios

## Quick Start

### Installation

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

### Development Configuration

For development, you can configure the API connection through the UI by providing:
- **API URL**: Your transcription service endpoint
- **Token**: Authentication token for API requests

## Integration Methods

### Method 1: URL Parameters

```javascript
// Direct URL with parameters
const microfrontendUrl = 'http://localhost:3000/?token=YOUR_TOKEN&apiUrl=https://your-api.com';
```

### Method 2: Parent Application Props

```javascript
// Set props before loading the microfrontend
window.microfrontendProps = {
  token: 'your-auth-token',
  apiUrl: 'https://your-api.com'
};

// Load the microfrontend (e.g., in an iframe)
const iframe = document.createElement('iframe');
iframe.src = 'http://localhost:3000';
document.body.appendChild(iframe);
```

### Method 3: PostMessage Communication

```javascript
// Listen for transcription results
window.addEventListener('message', (event) => {
  if (event.data.type === 'TRANSCRIPTION_COMPLETE') {
    console.log('Transcription:', event.data.transcription);
    // Handle the transcription result
  } else if (event.data.type === 'TRANSCRIPTION_ERROR') {
    console.error('Transcription error:', event.data.error);
    // Handle errors
  }
});
```

## API Integration

The microfrontend expects your transcription API to:

### Endpoint: `POST /transcribe`
- **Headers**: `Authorization: Bearer YOUR_TOKEN`, `Content-Type: multipart/form-data`
- **Body**: FormData with `audio` field (WebM audio blob)
- **Timeout**: 60 seconds (configurable)
- **Response**:
  ```json
  {
    "transcription": "The transcribed text",
    "success": true
  }
  ```

### Optional: `GET /health`
- **Headers**: `Authorization: Bearer YOUR_TOKEN`
- **Response**: HTTP 200 for healthy service (404 is also considered valid)
- **Timeout**: 30 seconds (configurable)

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main page component
├── components/
│   └── AudioRecorder.tsx    # Main recording component
├── hooks/
│   └── useAudioRecorder.ts  # Audio recording logic
└── utils/
    └── apiClient.ts         # Axios-based API communication utilities
```

## Axios Features

The API client uses axios with the following features:

- **Request/Response Interceptors**: Automatic logging and error handling
- **Configurable Timeouts**: Default 60s for transcription, 30s for health checks
- **Automatic Retry Logic**: Built-in error handling for network issues
- **TypeScript Support**: Full type safety for requests and responses
- **Dynamic Configuration**: Update tokens and URLs without recreating the client
- **FormData Support**: Proper handling of multipart/form-data for audio uploads

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Requirements**: WebRTC support, MediaRecorder API

## Audio Formats

- **Recording**: WebM with Opus codec (high quality, good compression)
- **Supported Input**: Any audio format supported by MediaRecorder API
- **Output**: WebM audio blob sent to your transcription service

## Security Considerations

- Tokens are handled securely in memory only
- No audio data is stored locally
- CORS headers are configured for microfrontend integration
- All API communication uses HTTPS (in production)

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

For production deployment, you can set:

```env
NEXT_PUBLIC_DEFAULT_API_URL=https://your-api.com
NEXT_PUBLIC_DEFAULT_TOKEN=your-default-token
```

## Troubleshooting

### Microphone Permission Issues
- Ensure HTTPS in production (required for microphone access)
- Check browser permissions in settings
- Test in incognito mode to verify permission prompts

### API Connection Issues
- Verify CORS settings on your API server
- Check token validity and permissions
- Ensure API endpoint is accessible from the client

### Mobile Issues
- Test on actual devices (not just browser dev tools)
- Some mobile browsers have restrictions on auto-play
- Ensure proper viewport meta tag for responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on multiple browsers/devices
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
# konnektaro-recorder
