# Multi-Modal Chatbot with Gen-Lang-Client

## Features
- Text chat support
- Image analysis with Base64 encoding
- Audio processing (voice-to-text and text-to-voice)
- MongoDB integration for orders and recommendations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with:
```
GEN_LANG_CLIENT_API_KEY=your-api-key-0063265427
MONGODB_URI=mongodb://localhost:27017/walmart-chatbot
```

3. Run the development server:
```bash
npm run dev
```

## API Endpoints

### 1. Chat Messages
```typescript
POST /api/chat/message
Content-Type: application/json

// Text message
{
  "type": "text",
  "message": "Show me winter jackets"
}

// Image analysis
{
  "type": "image",
  "message": "What's in this image?",
  "base64Data": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}

// Audio processing
{
  "type": "audio",
  "message": "Process this audio",
  "base64Data": "data:audio/wav;base64,UklGRiQ..."
}
```

### 2. Order Creation
```typescript
POST /api/orders/create
Content-Type: application/json

{
  "userId": "user123",
  "products": [
    {
      "productId": "prod123",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "totalAmount": 59.98
}
```

### 3. Product Recommendations
```typescript
POST /api/products/recommendations
Content-Type: application/json

{
  "category": "electronics",
  "tags": ["laptop", "gaming"],
  "priceRange": {
    "min": 500,
    "max": 2000
  }
}
```

## Converting Files to Base64

### Images
```javascript
// Client-side code to convert image to Base64
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Usage
const imageFile = document.querySelector('input[type="file"]').files[0];
const base64Image = await imageToBase64(imageFile);
```

### Audio
```javascript
// Client-side code to convert audio to Base64
function audioToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Usage
const audioFile = document.querySelector('input[type="file"]').files[0];
const base64Audio = await audioToBase64(audioFile);
```

## Example Usage

1. Start a chat session:
```javascript
// Text chat
await fetch('/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'text',
    message: 'Show me winter jackets under $100'
  })
});

// Image analysis
const imageFile = document.querySelector('input[type="file"]').files[0];
const base64Image = await imageToBase64(imageFile);
await fetch('/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'image',
    message: 'What's in this image?',
    base64Data: base64Image
  })
});

// Audio processing
const audioFile = document.querySelector('input[type="file"]').files[0];
const base64Audio = await audioToBase64(audioFile);
await fetch('/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'audio',
    message: 'Process this audio',
    base64Data: base64Audio
  })
});
```

## File Size Limits
- Images: 5MB max
- Audio: 10MB max

## Supported File Types
- Images: JPEG, PNG, WebP
- Audio: WAV, MP3, WebM 