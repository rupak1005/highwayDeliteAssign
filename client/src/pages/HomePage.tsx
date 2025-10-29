import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Users, Search, Filter } from 'lucide-react';
import { Experience } from '../types';
import { experienceService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const HomePage = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const categories = [
    'All',
    'Adventure',
    'Food & Drink',
    'Arts & Culture',
    'Water Sports',
    'Nature',
    'City Tours'
  ];

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (priceRange.min) {
        params.minPrice = parseFloat(priceRange.min);
      }
      if (priceRange.max) {
        params.maxPrice = parseFloat(priceRange.max);
      }
      if (searchTerm) {
        params.location = searchTerm;
      }

      const response = await experienceService.getExperiences(params);
      
      if (response.success && response.data) {
        setExperiences(response.data);
      } else {
        toast.error('Failed to load experiences');
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast.error('Failed to load experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchExperiences();
  };

  const filteredExperiences = experiences.filter(experience =>
    experience.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    experience.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    experience.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading amazing experiences..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Discover Amazing
          <span className="text-primary-600"> Experiences</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          From mountain adventures to city food tours, find the perfect experience 
          for your next adventure. Book unique activities with local experts.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search experiences or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div>
            <button
              onClick={handleSearch}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Price Range */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Min Price</label>
            <input
              type="number"
              placeholder="0"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Max Price</label>
            <input
              type="number"
              placeholder="500"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiences.map((experience) => (
          <Link
            key={experience.id}
            to={`/experience/${experience.id}`}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative">
              <img
                src={experience.image_url}
                alt={experience.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {experience.category}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-medium">{experience.rating}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {experience.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {experience.description}
              </p>

              <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
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

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary-600">
                  {formatPrice(experience.price)}
                </div>
                <div className="text-sm text-gray-500">
                  {experience.available_slots || 0} slots available
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredExperiences.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or browse all experiences.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;

