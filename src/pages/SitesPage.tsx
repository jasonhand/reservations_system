import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { Site, AvailabilityOverview, DayAvailability, SiteAvailability } from '../types';
import { apiClient, formatCurrency } from '../utils/api';
import { useReservation } from '../contexts/ReservationContext';
import { 
  Filter, 
  Users, 
  MapPin, 
  Star,
  Mountain,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

// Helper function to get availability indicator styling
function getAvailabilityStyle(availableDays: number, totalDays: number) {
  const percentage = (availableDays / totalDays) * 100;
  
  if (percentage >= 80) {
    return {
      containerClass: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
      iconClass: 'text-green-600',
      titleClass: 'text-green-800',
      numberClass: 'text-green-700',
      subtextClass: 'text-green-600'
    };
  } else if (percentage >= 50) {
    return {
      containerClass: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
      iconClass: 'text-yellow-600',
      titleClass: 'text-yellow-800',
      numberClass: 'text-yellow-700',
      subtextClass: 'text-yellow-600'
    };
  } else if (percentage >= 20) {
    return {
      containerClass: 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200',
      iconClass: 'text-orange-600',
      titleClass: 'text-orange-800',
      numberClass: 'text-orange-700',
      subtextClass: 'text-orange-600'
    };
  } else {
    return {
      containerClass: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200',
      iconClass: 'text-red-600',
      titleClass: 'text-red-800',
      numberClass: 'text-red-700',
      subtextClass: 'text-red-600'
    };
  }
}

export default function SitesPage() {
  const navigate = useNavigate();
  const { setSelectedSite, setDateRange, setGuests } = useReservation();
  
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // Date and guest filters
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  
  // Other filters
  const [filters, setFilters] = useState({
    type: '',
    maxPrice: '',
    minCapacity: '',
  });

  // Availability calendar state
  const [availabilityData, setAvailabilityData] = useState<AvailabilityOverview | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Individual site availability state
  const [siteAvailability, setSiteAvailability] = useState<Record<string, SiteAvailability> | null>(null);

  useEffect(() => {
    loadSites();
    loadAvailabilityData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sites, filters]);

  useEffect(() => {
    loadAvailabilityData();
  }, [currentMonth]);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading sites...');
      const response = await apiClient.getSites();
      console.log('Sites response:', response);
      
      if (response.success && response.data) {
        console.log('Sites loaded successfully:', response.data.length, 'sites');
        setSites(response.data);
      } else {
        console.error('Failed to load sites:', response.error);
        setError(response.error || 'Failed to load sites');
      }
    } catch (err) {
      console.error('Error loading sites:', err);
      setError('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailabilityData = async () => {
    try {
      setCalendarLoading(true);
      
      // Get first and last day of current month
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      // Load both overview and individual site availability in parallel
      const [overviewResponse, siteAvailabilityResponse] = await Promise.all([
        apiClient.getAvailabilityOverview(startDate, endDate),
        apiClient.getIndividualSiteAvailability(startDate, endDate)
      ]);
      
      if (overviewResponse.success && overviewResponse.data) {
        setAvailabilityData(overviewResponse.data);
      }
      
      if (siteAvailabilityResponse.success && siteAvailabilityResponse.data) {
        setSiteAvailability(siteAvailabilityResponse.data);
      }
    } catch (err) {
      console.error('Error loading availability data:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sites];

    if (filters.type) {
      filtered = filtered.filter(site => site.type === filters.type);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(site => site.price <= parseFloat(filters.maxPrice));
    }

    if (filters.minCapacity) {
      filtered = filtered.filter(site => site.capacity >= parseInt(filters.minCapacity));
    }

    setFilteredSites(filtered);
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      maxPrice: '',
      minCapacity: '',
    });
    setStartDate(null);
    setEndDate(null);
    setGuestCount(2);
  };

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    try {
      setCheckingAvailability(true);
      const response = await apiClient.getAvailableSites({
        checkIn: startDate.toISOString().split('T')[0],
        checkOut: endDate.toISOString().split('T')[0],
        guests: guestCount,
        siteType: filters.type as any
      });

      if (response.success && response.data) {
        setSites(response.data);
        console.log('Available sites found:', response.data.length);
      } else {
        console.error('Failed to check availability:', response.error);
        setError(response.error || 'Failed to check availability');
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      setError('Failed to check availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookNow = (site: Site) => {
    // Set the selected site in context
    setSelectedSite(site);
    
    // Set dates if they were selected
    if (startDate && endDate) {
      setDateRange({ startDate, endDate });
    }
    
    // Set guest count
    setGuests(guestCount);
    
    // Navigate to booking page
    navigate('/booking');
  };

  const getSiteTypeIcon = (type: string) => {
    switch (type) {
      case 'campsite':
        return '⛺';
      case 'cabin':
        return '🏠';
      case 'premium':
        return '✨';
      default:
        return '🏔️';
    }
  };

  const getSiteTypeColor = (type: string) => {
    switch (type) {
      case 'campsite':
        return 'text-accent-600 bg-accent-100';
      case 'cabin':
        return 'text-secondary-600 bg-secondary-100';
      case 'premium':
        return 'text-primary-600 bg-primary-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getAvailabilityStatus = (date: string): DayAvailability | null => {
    if (!availabilityData) return null;
    return availabilityData.availability.find(day => day.date === date) || null;
  };

  const getAvailabilityColor = (status: 'available' | 'partial' | 'full') => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'full':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const renderCalendar = () => {
    if (!availabilityData) return null;

    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startWeek = new Date(monthStart);
    startWeek.setDate(startWeek.getDate() - startWeek.getDay());
    
    const days = [];
    const currentDate = new Date(startWeek);

    while (currentDate <= monthEnd || currentDate.getDay() !== 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayStatus = getAvailabilityStatus(dateStr);
      const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      days.push(
        <div
          key={dateStr}
          className={`
            relative h-8 flex items-center justify-center text-sm border transition-colors
            ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
            ${isToday ? 'font-bold ring-2 ring-primary-500' : ''}
            ${dayStatus ? getAvailabilityColor(dayStatus.status) : 'bg-gray-50 border-gray-200'}
          `}
          title={dayStatus ? 
            `${dayStatus.availableSites}/${dayStatus.availableSites + dayStatus.reservedSites} sites available` : 
            'No data'
          }
        >
          {currentDate.getDate()}
          {isCurrentMonth && dayStatus && dayStatus.status === 'full' && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full transform translate-x-1 -translate-y-1"></div>
          )}
        </div>
      );
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Mountain className="h-12 w-12 text-primary-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-neutral-600">Loading our beautiful sites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button onClick={loadSites} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container-width">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Sites & Accommodations
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Choose from our carefully curated selection of campsites, cabins, and premium accommodations, 
            each with access to natural hot springs and mountain views.
          </p>
        </div>
      </section>

      {/* Availability Calendar */}
      <section className="bg-white border-b border-neutral-200">
        <div className="container-width py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
                Availability Overview
              </h2>
              <p className="text-neutral-600">
                View site availability at a glance. Green = fully available, Yellow = partially booked, Red = fully booked.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 border-b border-neutral-200">
                <button 
                  onClick={prevMonth}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  disabled={calendarLoading}
                >
                  <ChevronLeft className="h-5 w-5 text-neutral-600" />
                </button>
                
                <h3 className="text-lg font-semibold text-neutral-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                
                <button 
                  onClick={nextMonth}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  disabled={calendarLoading}
                >
                  <ChevronRight className="h-5 w-5 text-neutral-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {calendarLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Mountain className="h-6 w-6 text-neutral-400 animate-spin mr-2" />
                    <span className="text-neutral-600">Loading availability...</span>
                  </div>
                ) : (
                  <>
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-neutral-600">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendar()}
                    </div>
                  </>
                )}
              </div>

              {/* Legend */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                    <span className="text-neutral-600">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
                    <span className="text-neutral-600">Partially Booked</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
                    <span className="text-neutral-600">Fully Booked</span>
                  </div>
                </div>
                
                {availabilityData && (
                  <div className="text-center mt-3 text-sm text-neutral-500">
                    <Info className="inline h-4 w-4 mr-1" />
                    Total sites: {availabilityData.totalSites}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-width py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-semibold flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </h3>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Date & Guest Selection */}
                <div className="bg-primary-50 p-4 rounded-lg border-2 border-primary-200">
                  <h4 className="text-sm font-semibold text-primary-800 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Check Availability
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-primary-700 mb-1">
                          Check-in
                        </label>
                        <DatePicker
                          selected={startDate}
                          onChange={setStartDate}
                          selectsStart
                          startDate={startDate}
                          endDate={endDate}
                          minDate={new Date()}
                          className="input-field text-sm w-full"
                          placeholderText="Select date"
                          dateFormat="MMM d"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-primary-700 mb-1">
                          Check-out
                        </label>
                        <DatePicker
                          selected={endDate}
                          onChange={setEndDate}
                          selectsEnd
                          startDate={startDate}
                          endDate={endDate}
                          minDate={startDate ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                          className="input-field text-sm w-full"
                          placeholderText="Select date"
                          dateFormat="MMM d"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-primary-700 mb-1">
                        Guests
                      </label>
                      <select 
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value))}
                        className="input-field text-sm w-full"
                      >
                        {[1,2,3,4,5,6,7,8].map(num => (
                          <option key={num} value={num}>{num} guest{num !== 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={checkAvailability}
                      disabled={checkingAvailability || !startDate || !endDate}
                      className="btn-primary w-full text-sm py-2 disabled:opacity-50"
                    >
                      {checkingAvailability ? (
                        'Checking...'
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Check Availability
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Site Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Site Type
                  </label>
                  <select 
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="input-field"
                  >
                    <option value="">All Types</option>
                    <option value="campsite">⛺ Campsites</option>
                    <option value="cabin">🏠 Cabins</option>
                    <option value="premium">✨ Premium</option>
                  </select>
                </div>

                {/* Max Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Max Price per Night
                  </label>
                  <select 
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Any Price</option>
                    <option value="75">Under $75</option>
                    <option value="150">Under $150</option>
                    <option value="250">Under $250</option>
                    <option value="500">Under $500</option>
                  </select>
                </div>

                {/* Capacity Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Minimum Guests
                  </label>
                  <select 
                    value={filters.minCapacity}
                    onChange={(e) => setFilters({...filters, minCapacity: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Any Size</option>
                    <option value="2">2+ Guests</option>
                    <option value="4">4+ Guests</option>
                    <option value="6">6+ Guests</option>
                    <option value="8">8+ Guests</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    Showing {filteredSites.length} of {sites.length} sites
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Sites Grid */}
          <main className="flex-1">
            {filteredSites.length === 0 ? (
              <div className="text-center py-12">
                <Mountain className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-xl font-heading font-semibold text-neutral-700 mb-2">
                  No sites match your filters
                </h3>
                <p className="text-neutral-600 mb-4">
                  Try adjusting your search criteria to see more options.
                </p>
                <button onClick={resetFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredSites.map((site) => (
                  <div key={site.id} className="card group hover:shadow-lg transition-shadow duration-200">
                    {/* Site Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={site.images[0]} 
                        alt={site.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSiteTypeColor(site.type)}`}>
                          {getSiteTypeIcon(site.type)} {site.type}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-bold text-neutral-900">
                          {formatCurrency(site.price)}/night
                        </span>
                      </div>
                    </div>

                    {/* Site Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-2">
                        {site.name}
                      </h3>
                      
                      <p className="text-neutral-600 mb-4 line-clamp-2">
                        {site.description}
                      </p>

                      {/* Site Details */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-neutral-600">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Up to {site.capacity}
                        </span>
                        {site.size && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {site.size}
                          </span>
                        )}
                      </div>

                      {/* Availability Indicator */}
                      {siteAvailability && siteAvailability[site.id] && (() => {
                        const availability = siteAvailability[site.id];
                        const styles = getAvailabilityStyle(availability.availableDays, availability.totalDays);
                        return (
                          <div className={`flex items-center justify-between p-3 border rounded-lg mb-4 ${styles.containerClass}`}>
                            <div className="flex items-center">
                              <Calendar className={`h-4 w-4 mr-2 ${styles.iconClass}`} />
                              <span className={`text-sm font-medium ${styles.titleClass}`}>
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Availability
                              </span>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${styles.numberClass}`}>
                                {availability.availableDays}
                              </div>
                              <div className={`text-xs ${styles.subtextClass}`}>
                                of {availability.totalDays} days
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Key Amenities */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {site.amenities.slice(0, 3).map((amenity, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                        {site.amenities.length > 3 && (
                          <span className="text-xs text-neutral-500">
                            +{site.amenities.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Link 
                            to={`/sites/${site.id}`}
                            className="btn-outline"
                          >
                            View Details
                          </Link>
                          
                          <div className="flex items-center text-secondary-500">
                            <Star className="h-4 w-4 fill-current mr-1" />
                            <span className="text-sm font-medium">4.8</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleBookNow(site)}
                          className="btn-primary w-full"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}