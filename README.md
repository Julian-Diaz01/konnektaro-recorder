# @konnektaro/speech-to-text

A React component library for speech-to-text conversion with dual-mode support. This package provides a clean, simple interface for capturing speech and converting it to text via custom API calls or native browser Speech Recognition API.

## Features

- 🎤 **Simple Speech Recording**: Clean microphone interface with visual feedback
- 📱 **Cross-Platform**: Works on both mobile and web browsers
- 🔄 **Dual Mode Support**: Custom API or native browser Speech Recognition
- 🔐 **Optional Authentication**: Secure API communication with optional bearer tokens
- 🎨 **Minimal UI**: Centered microphone icon with ripple effect during recording
- ⚡ **Auto-Conversion**: Automatically converts speech to text when recording stops
- 🛡️ **Permission Handling**: Graceful microphone permission management
- 📡 **Axios HTTP Client**: Robust HTTP requests with error handling
- ⏱️ **Configurable Timeouts**: Customizable request timeouts
- 🔧 **TypeScript Support**: Full type safety and IntelliSense
- 🌐 **Browser Fallback**: Uses native Speech Recognition API when no API is configured

## Installation

```bash
npm install @konnektaro/speech-to-text
# or
yarn add @konnektaro/speech-to-text
```

## Quick Start

### Method 1: Using Custom API (Recommended for Production)

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
      token="your-auth-token" // Optional but recommended for security
      onTranscriptionComplete={handleTranscriptionComplete}
      onError={handleError}
    />
  );
}
```

#### API Mode without Token (Less Secure)

```tsx
import React from 'react';
import { KonnektaroAudioRecorder } from '@konnektaro/speech-to-text';

function App() {
  return (
    <KonnektaroAudioRecorder
      apiUrl="https://your-api.com"
      // No token provided - API should handle unauthenticated requests
      onTranscriptionComplete={(transcription) => console.log(transcription)}
      onError={(error) => console.error(error)}
    />
  );
}
```

### Method 2: Using Native Browser Speech Recognition (No Setup Required)

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
| `apiUrl` | `string` | No | - | API URL for transcription service (enables API mode) |
| `token` | `string` | No | - | Authentication token for API requests (optional but recommended) |
| `timeout` | `number` | No | `60000` | Request timeout in milliseconds (API mode only) |
| `onTranscriptionComplete` | `(transcription: string) => void` | No | - | Callback when transcription is completed |
| `onError` | `(error: string) => void` | No | - | Callback when an error occurs |
| `className` | `string` | No | - | Custom CSS class name for styling |

**Mode Selection:**
- **API Mode**: Provide `apiUrl` prop (token is optional but recommended for security)
- **Speech API Mode**: Omit `apiUrl` prop to use native browser Speech Recognition API

## Mode Comparison

| Feature | API Mode | Speech API Mode |
|---------|----------|-----------------|
| **Setup Required** | Yes (API endpoint, token optional) | No |
| **Browser Support** | All modern browsers | Chrome, Edge, Safari (limited) |
| **Audio Quality** | High (WebM/Opus) | Browser-dependent |
| **Transcription Accuracy** | Depends on your API | Browser-dependent |
| **Privacy** | Audio sent to your server | Processed locally |
| **Offline Support** | No | Yes (browser-dependent) |
| **Customization** | Full control over processing | Limited to browser capabilities |
| **Cost** | Depends on your API | Free |

### Other Exports

```tsx
import { 
  KonnektaroAudioRecorder, // Main component for speech-to-text
  useAudioRecorder,        // Hook for audio recording logic
  transcribeAudio,         // Function for manual transcription
  testConnection          // Function for testing API connection
} from '@konnektaro/speech-to-text';

// Type imports
import type { 
  KonnektaroAudioRecorderProps,
  AudioRecorderState,
  AudioRecorderControls,
  TranscriptionResponse
} from '@konnektaro/speech-to-text';
```

#### Using Exported Functions

You can also use the transcription functions directly:

```tsx
import { transcribeAudio, testConnection } from '@konnektaro/speech-to-text';

// With authentication
const result = await transcribeAudio(audioBlob, 'https://api.example.com', 'your-token');

// Without authentication (token is optional)
const result = await transcribeAudio(audioBlob, 'https://api.example.com');

// Test connection with optional token
const isConnected = await testConnection('https://api.example.com', 'your-token');
// or without token
const isConnected = await testConnection('https://api.example.com');
```

## API Integration

When using API mode, your transcription service should implement the following endpoints:

### POST /api/transcribe

**Purpose:** Transcribe audio to text

**Headers:**
```
Authorization: Bearer YOUR_TOKEN  # Optional - only sent if token is provided
Content-Type: multipart/form-data
```

**Request Body:**
- `audio`: WebM audio blob (multipart form data)

**Success Response (200):**
```json
{
  "transcription": "The transcribed text",
  "success": true
}
```

**Error Response (4xx/5xx):**
```json
{
  "error": "Error message describing what went wrong",
  "success": false
}
```

**Example Implementation (Node.js/Express):**
```javascript
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Optional authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    // Verify token if provided
    if (!isValidToken(token)) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  }
  // Continue even without token (optional authentication)
  next();
};

app.post('/api/transcribe', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const audioBuffer = req.file.buffer;
    
    // Your transcription logic here
    const transcription = await transcribeAudio(audioBuffer);
    
    res.json({
      transcription: transcription,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});
```

### GET /api/health (Optional)

**Purpose:** Health check endpoint for connection testing

**Headers:**
```
Authorization: Bearer YOUR_TOKEN  # Optional - only sent if token is provided
```

**Success Response:**
- HTTP 200: Service is healthy
- HTTP 404: Also considered valid (endpoint not implemented)

**Example Implementation:**
```javascript
app.get('/api/health', (req, res) => {
  // Optional: Add health checks (database, external services, etc.)
  res.status(200).json({ status: 'healthy' });
});
```

### Authentication

The component sends the token in the `Authorization` header as a Bearer token **only if a token is provided**. Your API can handle both authenticated and unauthenticated requests:

#### Option 1: Required Authentication (Recommended for Production)
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify token (implement your token validation logic)
  if (!isValidToken(token)) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  next();
};

app.post('/api/transcribe', authenticateToken, upload.single('audio'), ...);
app.get('/api/health', authenticateToken, ...);
```

#### Option 2: Optional Authentication
```javascript
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    // Verify token if provided
    if (!isValidToken(token)) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = getUserFromToken(token);
  } else {
    req.user = null; // No authentication
  }

  next();
};

app.post('/api/transcribe', optionalAuth, upload.single('audio'), ...);
app.get('/api/health', optionalAuth, ...);
```

#### Option 3: No Authentication (Development Only)
```javascript
// No authentication middleware - anyone can access
app.post('/api/transcribe', upload.single('audio'), ...);
app.get('/api/health', ...);
```

### CORS Configuration

Make sure your API server includes proper CORS headers:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Alternative Implementations

#### Python (FastAPI)
```python
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import jwt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_token(token: str = Depends(oauth2_scheme)):
    # Implement your token verification logic
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=403, detail="Invalid token")

@app.post("/api/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    token_data: dict = Depends(verify_token)
):
    try:
        audio_content = await audio.read()
        # Your transcription logic here
        transcription = await transcribe_audio_content(audio_content)
        
        return {
            "transcription": transcription,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check(token_data: dict = Depends(verify_token)):
    return {"status": "healthy"}
```

#### Python (Flask)
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'https://yourdomain.com'])

def verify_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'error': 'Access token required'}), 401
        
        try:
            token = token.split(' ')[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            request.user = payload
        except jwt.PyJWTError:
            return jsonify({'error': 'Invalid token'}), 403
        
        return f(*args, **kwargs)
    return decorated

@app.route('/api/transcribe', methods=['POST'])
@verify_token
def transcribe():
    try:
        audio_file = request.files['audio']
        # Your transcription logic here
        transcription = transcribe_audio_file(audio_file)
        
        return jsonify({
            'transcription': transcription,
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/health', methods=['GET'])
@verify_token
def health():
    return jsonify({'status': 'healthy'})
```

#### PHP (Laravel)
```php
<?php

// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/transcribe', [TranscriptionController::class, 'transcribe']);
    Route::get('/health', [HealthController::class, 'check']);
});

// app/Http/Controllers/TranscriptionController.php
class TranscriptionController extends Controller
{
    public function transcribe(Request $request)
    {
        try {
            $audioFile = $request->file('audio');
            
            // Your transcription logic here
            $transcription = $this->transcribeAudio($audioFile);
            
            return response()->json([
                'transcription' => $transcription,
                'success' => true
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }
}

// app/Http/Controllers/HealthController.php
class HealthController extends Controller
{
    public function check()
    {
        return response()->json(['status' => 'healthy']);
    }
}
```

### Testing Your API

You can test your API endpoints using curl or any HTTP client:

#### Test Health Endpoint (with token)
```bash
curl -X GET "https://your-api.com/api/health" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test Health Endpoint (without token)
```bash
curl -X GET "https://your-api.com/api/health"
```

#### Test Transcription Endpoint (with token)
```bash
curl -X POST "https://your-api.com/api/transcribe" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@path/to/audio.webm"
```

#### Test Transcription Endpoint (without token)
```bash
curl -X POST "https://your-api.com/api/transcribe" \
  -F "audio=@path/to/audio.webm"
```

#### Test with JavaScript (for debugging)

**With Authentication:**
```javascript
// Test health endpoint with token
fetch('https://your-api.com/api/health', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log('Health check:', data));

// Test transcription endpoint with token
const formData = new FormData();
formData.append('audio', audioBlob); // Your WebM audio blob

fetch('https://your-api.com/api/transcribe', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Transcription:', data));
```

**Without Authentication:**
```javascript
// Test health endpoint without token
fetch('https://your-api.com/api/health', {
  method: 'GET'
})
.then(response => response.json())
.then(data => console.log('Health check:', data));

// Test transcription endpoint without token
const formData = new FormData();
formData.append('audio', audioBlob); // Your WebM audio blob

fetch('https://your-api.com/api/transcribe', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log('Transcription:', data));
```

### Common Issues and Solutions

#### CORS Errors
If you encounter CORS errors, make sure your server includes the proper headers:
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

#### Authentication Errors
- Ensure your token is valid and not expired
- Check that the Authorization header format is correct: `Bearer YOUR_TOKEN`
- Verify your token validation logic

#### Audio Format Issues
- The component sends WebM audio blobs
- Make sure your transcription service supports WebM format
- Consider converting to other formats if needed (WAV, MP3, etc.)

#### File Size Limits
- WebM files can be large for long recordings
- Consider implementing file size limits on your server
- Add progress indicators for large file uploads

## Browser Support

### API Mode
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Requirements**: WebRTC support, MediaRecorder API

### Speech API Mode
- **Chrome**: Full support (desktop and mobile)
- **Edge**: Full support (desktop and mobile)
- **Safari**: Limited support (desktop only, requires user gesture)
- **Firefox**: Not supported
- **Mobile**: iOS Safari (limited), Chrome Mobile (full support)
- **Requirements**: Speech Recognition API support

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

### 1.1.0
- Added native browser Speech Recognition API fallback
- Centered microphone button in UI
- Dual-mode support (API mode + Speech API mode)
- Made authentication token optional (recommended for production)
- Enhanced browser compatibility
- Updated documentation with comprehensive API integration examples
- Added support for multiple programming languages (Node.js, Python, PHP)
- Improved error handling and user feedback

### 1.0.x
- Initial release
- React component for speech-to-text conversion
- TypeScript support
- Multiple UI variants