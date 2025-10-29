import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Calendar, Clock, MapPin, Users, ArrowLeft, Download, Mail } from 'lucide-react';
import { bookingService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface BookingDetails {
  id: number;
  booking_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  participants: number;
  total_price: number;
  promo_code?: string;
  discount_amount: number;
  final_price: number;
  booking_status: string;
  date: string;
  start_time: string;
  end_time: string;
  experience_title: string;
  location: string;
  image_url: string;
  created_at: string;
}

const BookingResultPage = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reference) {
      fetchBookingDetails();
    }
  }, [reference]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBooking(reference!);
      
      if (response.success && response.data) {
        setBooking(response.data);
      } else {
        setError(response.message || 'Booking not found');
      }
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      setError(error.response?.data?.message || 'Failed to load booking details');
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

  const handleDownloadReceipt = () => {
    if (!booking) return;
    
    // Create a simple receipt text
    const receipt = `
BOOKIT - BOOKING RECEIPT
========================

Booking Reference: ${booking.booking_reference}
Booking Date: ${formatDate(booking.created_at)}
Status: ${booking.booking_status.toUpperCase()}

CUSTOMER DETAILS
-----------------
Name: ${booking.customer_name}
Email: ${booking.customer_email}
Phone: ${booking.customer_phone || 'Not provided'}

EXPERIENCE DETAILS
------------------
Experience: ${booking.experience_title}
Location: ${booking.location}
Date: ${formatDate(booking.date)}
Time: ${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}
Participants: ${booking.participants}

PRICING
-------
Subtotal: ${formatPrice(booking.total_price)}
${booking.promo_code ? `Discount (${booking.promo_code}): -${formatPrice(booking.discount_amount)}` : ''}
Total Paid: ${formatPrice(booking.final_price)}

Thank you for choosing BookIt!
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookit-receipt-${booking.booking_reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded successfully!');
  };

  const handleEmailReceipt = () => {
    if (!booking) return;
    
    const subject = `Your BookIt Receipt - ${booking.booking_reference}`;
    const body = `Hi ${booking.customer_name},

Thank you for your booking! Here are your booking details:

Booking Reference: ${booking.booking_reference}
Experience: ${booking.experience_title}
Date: ${formatDate(booking.date)}
Time: ${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}
Total Paid: ${formatPrice(booking.final_price)}

We look forward to seeing you!

Best regards,
The BookIt Team`;

    const mailtoLink = `mailto:${booking.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading booking details..." />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 mb-4">
            <XCircle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The booking you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isSuccessful = booking.booking_status === 'confirmed';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="text-center mb-8">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isSuccessful ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isSuccessful ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        
        <h1 className={`text-3xl font-bold mb-2 ${
          isSuccessful ? 'text-green-600' : 'text-red-600'
        }`}>
          {isSuccessful ? 'Booking Confirmed!' : 'Booking Failed'}
        </h1>
        
        <p className="text-gray-600 text-lg">
          {isSuccessful 
            ? 'Your experience has been successfully booked. We\'ll send you a confirmation email shortly.'
            : 'There was an issue processing your booking. Please try again or contact support.'
          }
        </p>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Details</h2>
              <p className="text-gray-600">Reference: {booking.booking_reference}</p>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isSuccessful 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {booking.booking_status.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Experience Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={booking.image_url}
                    alt={booking.experience_title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{booking.experience_title}</h4>
                    <p className="text-sm text-gray-600">{booking.location}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{booking.participants} participant{booking.participants > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{booking.customer_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{booking.customer_email}</span>
                </div>
                {booking.customer_phone && (
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{booking.customer_phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(booking.total_price)}</span>
              </div>
              
              {booking.promo_code && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Discount ({booking.promo_code})</span>
                  <span>-{formatPrice(booking.discount_amount)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                <span>Total Paid</span>
                <span>{formatPrice(booking.final_price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isSuccessful && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadReceipt}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Receipt</span>
          </button>
          
          <button
            onClick={handleEmailReceipt}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Email Receipt</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Book Another Experience
          </button>
        </div>
      )}

      {!isSuccessful && (
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingResultPage;

