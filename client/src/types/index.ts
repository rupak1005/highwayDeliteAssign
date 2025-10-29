export interface Experience {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  duration_hours: number;
  max_participants: number;
  image_url: string;
  category: string;
  rating: number;
  review_count: number;
  total_slots?: number;
  available_slots?: number;
  created_at: string;
  updated_at: string;
}

export interface Slot {
  id: number;
  experience_id: number;
  date: string;
  start_time: string;
  end_time: string;
  available_spots: number;
  total_spots: number;
  price: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  slot_id: number;
  experience_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  participants: number;
  total_price: number;
  promo_code?: string;
  discount_amount: number;
  final_price: number;
  booking_status: string;
  booking_reference: string;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  slotId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  participants: number;
  promoCode?: string;
}

export interface PromoCode {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until?: string;
}

export interface PromoValidationRequest {
  code: string;
  amount: number;
}

export interface PromoValidationResponse {
  valid: boolean;
  data?: {
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    finalAmount: number;
    minAmount: number;
    maxDiscount?: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

