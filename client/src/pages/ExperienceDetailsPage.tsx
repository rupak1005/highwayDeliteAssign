import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Users, Calendar, ArrowLeft, CheckCircle } from 'lucide-react';
import { Experience, Slot } from '../types';
import { experienceService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ExperienceDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (id) {
      fetchExperienceDetails();
    }
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlotsForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchExperienceDetails = async () => {
    try {
      setLoading(true);
      const response = await experienceService.getExperience(parseInt(id!));
      
      if (response.success && response.data) {
        setExperience(response.data.experience);
        setSlots(response.data.slots);
        
        // Set default date to today if slots are available
        if (response.data.slots.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const todaySlots = response.data.slots.filter(slot => slot.date >= today);
          if (todaySlots.length > 0) {
            setSelectedDate(todaySlots[0].date);
          }
        }
      } else {
        toast.error('Failed to load experience details');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching experience details:', error);
      toast.error('Failed to load experience details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotsForDate = async (date: string) => {
    try {
      const response = await experienceService.getSlots(parseInt(id!), { date });
      
      if (response.success && response.data) {
        setSlots(response.data);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available slots');
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  const handleBookNow = () => {
    if (selectedSlot) {
      // Store selected slot in sessionStorage for checkout
      sessionStorage.setItem('selectedSlot', JSON.stringify(selectedSlot));
      sessionStorage.setItem('selectedExperience', JSON.stringify(experience));
      navigate('/checkout');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    return `${hours} hr${hours > 1 ? 's' : ''}`;
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

  const getAvailableDates = () => {
    const dates = [...new Set(slots.map(slot => slot.date))].sort();
    return dates;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading experience details..." />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Experience not found</h2>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Experiences</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Experience Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <img
              src={experience.image_url}
              alt={experience.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {experience.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{experience.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(experience.duration_hours)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Max {experience.max_participants}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    {formatPrice(experience.price)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{experience.rating}</span>
                    <span className="text-sm text-gray-500">({experience.review_count} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About this experience</h3>
                <p className="text-gray-700 leading-relaxed">
                  {experience.description}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Professional guide</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">All equipment included</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Safety briefing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Insurance coverage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Book this experience</h2>
            
            {/* Date Selection */}
            <div className="mb-6">
              <label className="label">Select Date</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
              >
                <option value="">Choose a date</option>
                {getAvailableDates().map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="mb-6">
                <label className="label">Available Times</label>
                <div className="space-y-2">
                  {slots
                    .filter(slot => slot.date === selectedDate)
                    .map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.is_available}
                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                          selectedSlot?.id === slot.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : slot.is_available
                            ? 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </div>
                            <div className="text-sm">
                              {slot.available_spots} of {slot.total_spots} spots available
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatPrice(slot.price)}
                            </div>
                            {!slot.is_available && (
                              <div className="text-xs text-red-500">Sold Out</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBookNow}
              disabled={!selectedSlot}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedSlot
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedSlot ? 'Continue to Checkout' : 'Select a time slot'}
            </button>

            {/* Price Summary */}
            {selectedSlot && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Price per person</span>
                  <span className="font-medium">{formatPrice(selectedSlot.price)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Participants</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex items-center justify-between font-semibold mt-3 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(selectedSlot.price)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetailsPage;

