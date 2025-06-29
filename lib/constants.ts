// Token limits for different models
export const TOKEN_LIMIT = 4000;

// API endpoints
export const API_ENDPOINTS = {
  CHAT: '/api/chat/message',
  NEW_CHAT: '/api/chat/new',
  RESET_CHAT: '/api/chat/reset',
  CREATE_ORDER: '/api/orders/create',
  GET_RECOMMENDATIONS: '/api/products/recommendations'
};

// Supported file types
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const SUPPORTED_AUDIO_TYPES = ['audio/wav', 'audio/mpeg', 'audio/webm'];

// Maximum file sizes (in bytes)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB 