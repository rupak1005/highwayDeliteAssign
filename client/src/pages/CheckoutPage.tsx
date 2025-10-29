import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CreditCard, User, Mail, Phone, Calendar, Clock, MapPin, Users, Tag } from 'lucide-react';
import { Experience, Slot, BookingRequest, PromoValidationResponse } from '../types';
import { bookingService, promoService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  participants: number;
  promoCode: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(false);
  const [promoValidation, setPromoValidation] = useState<PromoValidationResponse | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      participants: 1,
      promoCode: ''
    }
  });

  const participants = watch('participants');
  const promoCode = watch('promoCode');

  useEffect(() => {
    // Get selected slot and experience from sessionStorage
    const slotData = sessionStorage.getItem('selectedSlot');
    const experienceData = sessionStorage.getItem('selectedExperience');

    if (!slotData || !experienceData) {
      toast.error('No booking session found');
      navigate('/');
      return;
    }

    try {
      setSelectedSlot(JSON.parse(slotData));
      setSelectedExperience(JSON.parse(experienceData));
    } catch (error) {
      console.error('Error parsing session data:', error);
      toast.error('Invalid booking session');
      navigate('/');
    }
  }, [navigate]);

  const validatePromoCode = async () => {
    if (!promoCode.trim() || !selectedSlot) return;

    try {
      setValidatingPromo(true);
      const totalAmount = selectedSlot.price * participants;
      const response = await promoService.validatePromoCode({
        code: promoCode,
        amount: totalAmount
      });

      if (response.success && response.data) {
        setPromoValidation(response.data);
        if (response.data.valid) {
          toast.success('Promo code applied successfully!');
        } else {
          toast.error('Invalid or expired promo code');
        }
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast.error('Failed to validate promo code');
    } finally {
      setValidatingPromo(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedSlot || !selectedExperience) {
      toast.error('Missing booking information');
      return;
    }

    try {
      setLoading(true);

      const bookingData: BookingRequest = {
        slotId: selectedSlot.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        participants: data.participants,
        promoCode: promoValidation?.valid ? data.promoCode : undefined
      };

      const response = await bookingService.createBooking(bookingData);

      if (response.success && response.data) {
        // Clear session storage
        sessionStorage.removeItem('selectedSlot');
        sessionStorage.removeItem('selectedExperience');
        
        // Navigate to success page
        navigate(`/booking/${response.data.booking.booking_reference}`);
      } else {
        toast.error(response.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotal = () => {
    if (!selectedSlot) return 0;
    
    const subtotal = selectedSlot.price * participants;
    const discount = promoValidation?.valid ? promoValidation.data?.discountAmount || 0 : 0;
    return Math.max(0, subtotal - discount);
  };

  if (!selectedSlot || !selectedExperience) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading booking details..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Experience</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete your booking</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      type="text"
                      {...register('customerName', { 
                        required: 'Full name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                      className={`input-field ${errors.customerName ? 'border-red-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Email Address *</label>
                    <input
                      type="email"
                      {...register('customerEmail', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className={`input-field ${errors.customerEmail ? 'border-red-500' : ''}`}
                      placeholder="Enter your email"
                    />
                    {errors.customerEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    {...register('customerPhone')}
                    className="input-field"
                    placeholder="Enter your phone number (optional)"
                  />
                </div>
              </div>

              {/* Participants */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Number of Participants
                </h2>
                
                <div>
                  <label className="label">Participants *</label>
                  <select
                    {...register('participants', { 
                      required: 'Number of participants is required',
                      min: { value: 1, message: 'At least 1 participant required' },
                      max: { value: selectedSlot.available_spots, message: `Maximum ${selectedSlot.available_spots} participants allowed` }
                    })}
                    className={`input-field ${errors.participants ? 'border-red-500' : ''}`}
                  >
                    {Array.from({ length: Math.min(selectedSlot.available_spots, 10) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} participant{i + 1 > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.participants && (
                    <p className="text-red-500 text-sm mt-1">{errors.participants.message}</p>
                  )}
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Promo Code (Optional)
                </h2>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    {...register('promoCode')}
                    className="input-field flex-1"
                    placeholder="Enter promo code"
                    onChange={(e) => {
                      setValue('promoCode', e.target.value);
                      setPromoValidation(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={validatePromoCode}
                    disabled={!promoCode.trim() || validatingPromo}
                    className="btn-secondary whitespace-nowrap"
                  >
                    {validatingPromo ? 'Validating...' : 'Apply'}
                  </button>
                </div>
                
                {promoValidation && (
                  <div className={`mt-2 p-3 rounded-lg ${
                    promoValidation.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {promoValidation.valid ? (
                      <div>
                        <p className="font-medium">Promo code applied!</p>
                        <p className="text-sm">
                          {promoValidation.data?.description} - 
                          Save {formatPrice(promoValidation.data?.discountAmount || 0)}
                        </p>
                      </div>
                    ) : (
                      <p>Invalid or expired promo code</p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Processing Booking...</span>
                  </div>
                ) : (
                  'Complete Booking'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h2>

            {/* Experience Details */}
            <div className="mb-6">
              <img
                src={selectedExperience.image_url}
                alt={selectedExperience.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              
              <h3 className="font-semibold text-gray-900 mb-2">{selectedExperience.title}</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedSlot.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedExperience.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{participants} participant{participants > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Price per person</span>
                  <span>{formatPrice(selectedSlot.price)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Participants</span>
                  <span>{participants}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(selectedSlot.price * participants)}</span>
                </div>

                {promoValidation?.valid && promoValidation.data && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Discount ({promoValidation.data.code})</span>
                    <span>-{formatPrice(promoValidation.data.discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between font-semibold text-lg mt-4 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Secure Payment</p>
                  <p>Your payment information is encrypted and secure.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

