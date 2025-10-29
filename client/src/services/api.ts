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

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const experienceService = {
  getExperiences: async (params?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }): Promise<ApiResponse<Experience[]>> => {
    const response = await api.get('/experiences', { params });
    return response.data;
  },

  getExperience: async (id: number, date?: string): Promise<ApiResponse<{
    experience: Experience;
    slots: Slot[];
  }>> => {
    const params = date ? { date } : {};
    const response = await api.get(`/experiences/${id}`, { params });
    return response.data;
  },

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
  createBooking: async (bookingData: BookingRequest): Promise<ApiResponse<any>> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getBooking: async (reference: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/bookings/${reference}`);
    return response.data;
  },
};

export const promoService = {
  validatePromoCode: async (promoData: PromoValidationRequest): Promise<ApiResponse<PromoValidationResponse>> => {
    const response = await api.post('/promo/validate', promoData);
    return response.data;
  },

  getPromoCodes: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/promo/codes');
    return response.data;
  },
};

export const healthService = {
  checkHealth: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;

