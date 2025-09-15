# @konnektaro/speech-to-text

A React component library for speech-to-text conversion with required environment variables. This package provides a clean, simple interface for capturing speech and converting it to text via API calls.

## Features

- 🎤 **Simple Speech Recording**: Clean microphone interface with visual feedback
- 📱 **Cross-Platform**: Works on both mobile and web browsers
- 🔐 **Token Authentication**: Secure API communication with bearer tokens
- 🎨 **Minimal UI**: Just a microphone icon with ripple effect during recording
- ⚡ **Auto-Conversion**: Automatically converts speech to text when recording stops
- 🛡️ **Permission Handling**: Graceful microphone permission management
- 📡 **Axios HTTP Client**: Robust HTTP requests with error handling
- ⏱️ **Configurable Timeouts**: Customizable request timeouts
- 🔧 **TypeScript Support**: Full type safety and IntelliSense

## Installation

```bash
npm install @konnektaro/speech-to-text
# or
yarn add @konnektaro/speech-to-text
```

## Quick Start

### Method 1: Using Props (Recommended)

```tsx
import React from 'react';
import { KonnektaroAudioRecorder } from '@konnektaro/speech-to-text';

function App() {
  const handleTranscriptionComplete = (transcription: string) => {
    console.log('Transcription:', transcription);
  };

  const handleError = (error: string) => {
    console.error('Error:', error);
  };

  return (
    <KonnektaroAudioRecorder
      apiUrl="https://your-api.com"
      token="your-auth-token"
      onTranscriptionComplete={handleTranscriptionComplete}
      onError={handleError}
    />
  );
}
```

### Method 2: Using Environment Variables

Set up your environment variables:

```env
NEXT_PUBLIC_KONNEKTARO_API_URL=https://your-api.com
NEXT_PUBLIC_KONNEKTARO_TOKEN=your-auth-token
```

Then use the component without props:

```tsx
import React from 'react';
import { KonnektaroAudioRecorder } from '@konnektaro/speech-to-text';

function App() {
  return (
    <KonnektaroAudioRecorder
      onTranscriptionComplete={(transcription) => console.log(transcription)}
      onError={(error) => console.error(error)}
    />
  );
}
```

## API Reference

### KonnektaroAudioRecorder Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `apiUrl` | `string` | No* | - | API URL for transcription service |
| `token` | `string` | No* | - | Authentication token for API requests |
| `timeout` | `number` | No | `60000` | Request timeout in milliseconds |
| `onTranscriptionComplete` | `(transcription: string) => void` | No | - | Callback when transcription is completed |
| `onError` | `(error: string) => void` | No | - | Callback when an error occurs |
| `className` | `string` | No | - | Custom CSS class name for styling |
| `variant` | `'simple' \| 'full'` | No | `'simple'` | UI variant to display |

*Either `apiUrl` and `token` props must be provided, or the corresponding environment variables must be set.

### Other Exports

```tsx
import { 
  AudioRecorder,           // Full-featured recorder component
  SimpleAudioRecorder,     // Minimal recorder component
  useAudioRecorder,        // Hook for audio recording logic
  transcribeAudio,         // Function for manual transcription
  testConnection          // Function for testing API connection
} from '@konnektaro/speech-to-text';
```

## API Integration

Your transcription API should implement the following endpoints:

### POST /api/transcribe

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Body:**
- `audio`: WebM audio blob

**Response:**
```json
{
  "transcription": "The transcribed text",
  "success": true
}
```

### GET /api/health (Optional)

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
- HTTP 200 for healthy service (404 is also considered valid)

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Requirements**: WebRTC support, MediaRecorder API

## Audio Formats

- **Recording**: WebM with Opus codec (high quality, good compression)
- **Supported Input**: Any audio format supported by MediaRecorder API
- **Output**: WebM audio blob sent to your transcription service

## Styling

The component uses Tailwind CSS classes. You can customize the appearance by:

1. **Using className prop:**
```tsx
<KonnektaroAudioRecorder 
  className="my-custom-class"
  // ... other props
/>
```

2. **Overriding CSS classes:**
```css
.konnektaro-audio-recorder {
  /* Your custom styles */
}
```

## Error Handling

The component handles various error scenarios:

- **Configuration Errors**: Missing API URL or token
- **Permission Errors**: Microphone access denied
- **Network Errors**: API connection failures
- **Transcription Errors**: API response errors

All errors are passed to the `onError` callback and displayed in the UI.

## Development

### Building the Package

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Security Considerations

- Tokens are handled securely in memory only
- No audio data is stored locally
- All API communication should use HTTPS in production
- CORS headers should be configured on your API server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on multiple browsers/devices
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### 1.0.2
- Initial release
- React component for speech-to-text conversion
- Support for required environment variables
- TypeScript support
- Multiple UI variants