import axios from 'axios';
import { 
  Experience, 
  Slot, 
  BookingRequest, 
  PromoValidationRequest, 
  PromoValidationResponse,
  ApiResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const experienceService = {
  // Get all experiences
  getExperiences: async (params?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }): Promise<ApiResponse<Experience[]>> => {
    const response = await api.get('/experiences', { params });
    return response.data;
  },

  // Get experience by ID
  getExperience: async (id: number, date?: string): Promise<ApiResponse<{
    experience: Experience;
    slots: Slot[];
  }>> => {
    const params = date ? { date } : {};
    const response = await api.get(`/experiences/${id}`, { params });
    return response.data;
  },

  // Get slots for an experience
  getSlots: async (id: number, params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Slot[]>> => {
    const response = await api.get(`/experiences/${id}/slots`, { params });
    return response.data;
  },
};

export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData: BookingRequest): Promise<ApiResponse<any>> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get booking by reference
  getBooking: async (reference: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/bookings/${reference}`);
    return response.data;
  },
};

export const promoService = {
  // Validate promo code
  validatePromoCode: async (promoData: PromoValidationRequest): Promise<ApiResponse<PromoValidationResponse>> => {
    const response = await api.post('/promo/validate', promoData);
    return response.data;
  },

  // Get all promo codes (for admin)
  getPromoCodes: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/promo/codes');
    return response.data;
  },
};

export const healthService = {
  // Check API health
  checkHealth: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;

