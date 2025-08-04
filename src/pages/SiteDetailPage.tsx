import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Site, Reservation, SiteCalendarData } from '../types';
import { apiClient, formatCurrency, formatDate } from '../utils/api';
import { useReservation } from '../contexts/ReservationContext';
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Wifi,
  Mountain,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  User,
  Info
} from 'lucide-react';

export default function SiteDetailPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { setSelectedSite } = useReservation();
  
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [showAllReservations, setShowAllReservations] = useState(false);
  
  // Calendar state
  const [calendarData, setCalendarData] = useState<SiteCalendarData | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (siteId) {
      loadSite(siteId);
      loadReservations(siteId);
      loadCalendar(siteId);
    }
  }, [siteId]);

  useEffect(() => {
    if (siteId) {
      loadCalendar(siteId);
    }
  }, [currentMonth]);

  const loadSite = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getSite(id);
      
      if (response.success && response.data) {
        setSite(response.data);
      } else {
        setError(response.error || 'Site not found');
      }
    } catch (err) {
      setError('Failed to load site details');
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async (id: string) => {
    try {
      setReservationsLoading(true);
      const response = await apiClient.getSiteReservations(id);
      
      if (response.success && response.data) {
        // Filter to upcoming and current reservations (not cancelled)
        const activeReservations = response.data.filter(reservation => 
          reservation.status !== 'cancelled'
        );
        setReservations(activeReservations);
      }
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setReservationsLoading(false);
    }
  };

  const loadCalendar = async (id: string) => {
    try {
      setCalendarLoading(true);
      
      // Get first and last day of current month
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      const response = await apiClient.getSiteCalendar(id, startDate, endDate);
      
      if (response.success && response.data) {
        setCalendarData(response.data);
      }
    } catch (err) {
      console.error('Failed to load calendar:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleBookNow = () => {
    if (site) {
      setSelectedSite(site);
      navigate('/booking');
    }
  };

  const nextImage = () => {
    if (site) {
      setCurrentImageIndex((prev) => 
        prev === site.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (site) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? site.images.length - 1 : prev - 1
      );
    }
  };

  const getSiteTypeIcon = (type: string) => {
    switch (type) {
      case 'campsite': return '⛺';
      case 'cabin': return '🏠';
      case 'premium': return '✨';
      default: return '🏔️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏰';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const getDayAvailability = (date: string) => {
    if (!calendarData) return null;
    return calendarData.availability.find(day => day.date === date) || null;
  };

  const renderCalendar = () => {
    if (!calendarData) return null;

    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startWeek = new Date(monthStart);
    startWeek.setDate(startWeek.getDate() - startWeek.getDay());
    
    const days = [];
    const currentDate = new Date(startWeek);

    while (currentDate <= monthEnd || currentDate.getDay() !== 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = getDayAvailability(dateStr);
      const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      let dayClass = 'relative h-10 flex items-center justify-center text-sm border transition-colors cursor-pointer';
      let statusClass = '';
      let tooltipText = '';
      
      if (!isCurrentMonth) {
        dayClass += ' text-gray-400 bg-gray-50';
      } else if (dayData) {
        if (dayData.available) {
          statusClass = 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
          tooltipText = 'Available';
        } else {
          statusClass = 'bg-red-100 text-red-700 border-red-200';
          tooltipText = dayData.reservation ? 
            `Reserved by ${dayData.reservation.guestName}` : 
            'Reserved';
        }
      } else {
        statusClass = 'bg-gray-100 text-gray-600 border-gray-200';
        tooltipText = 'No data';
      }
      
      if (isToday) {
        dayClass += ' ring-2 ring-primary-500 font-bold';
      }
      
      days.push(
        <div
          key={dateStr}
          className={`${dayClass} ${statusClass}`}
          title={tooltipText}
        >
          {currentDate.getDate()}
          {isCurrentMonth && dayData && !dayData.available && (
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
          <p className="text-lg text-neutral-600">Loading site details...</p>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || 'Site not found'}</p>
          <Link to="/sites" className="btn-primary">
            Back to Sites
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-40">
        <div className="container-width py-4">
          <Link 
            to="/sites" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sites
          </Link>
        </div>
      </div>

      <div className="container-width py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden mb-8">
              <img 
                src={site.images[currentImageIndex]} 
                alt={`${site.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {site.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {site.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white' 
                            : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Site Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getSiteTypeIcon(site.type)}</span>
                  <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full capitalize">
                    {site.type}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
                  {site.name}
                </h1>
                <p className="text-lg text-neutral-700 leading-relaxed">
                  {site.description}
                </p>
              </div>

              {/* Site Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600">Capacity</p>
                  <p className="font-semibold">{site.capacity} guests</p>
                </div>
                
                {site.size && (
                  <div className="text-center p-4 bg-white rounded-lg">
                    <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600">Size</p>
                    <p className="font-semibold">{site.size}</p>
                  </div>
                )}
                
                {site.bedrooms && (
                  <div className="text-center p-4 bg-white rounded-lg">
                    <span className="text-2xl mb-2 block">🛏️</span>
                    <p className="text-sm text-neutral-600">Bedrooms</p>
                    <p className="font-semibold">{site.bedrooms}</p>
                  </div>
                )}
                
                {site.bathrooms && (
                  <div className="text-center p-4 bg-white rounded-lg">
                    <span className="text-2xl mb-2 block">🚿</span>
                    <p className="text-sm text-neutral-600">Bathrooms</p>
                    <p className="font-semibold">{site.bathrooms}</p>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-heading font-semibold mb-4">Special Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {site.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-accent-600 mr-3 flex-shrink-0" />
                      <span className="text-neutral-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-heading font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {site.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-accent-600 mr-3 flex-shrink-0" />
                      <span className="text-neutral-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Reservations */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-heading font-semibold">Current Reservations</h3>
                  {reservations.length > 3 && (
                    <button
                      onClick={() => setShowAllReservations(!showAllReservations)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      {showAllReservations ? 'Show less' : `Show all (${reservations.length})`}
                    </button>
                  )}
                </div>
                
                {reservationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Clock className="h-6 w-6 text-neutral-400 animate-spin mr-2" />
                    <span className="text-neutral-600">Loading reservations...</span>
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-600">No active reservations</p>
                    <p className="text-sm text-neutral-500 mt-1">This site is currently available for booking</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(showAllReservations ? reservations : reservations.slice(0, 3)).map((reservation) => (
                      <div key={reservation.id} className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-neutral-500" />
                            <div>
                              <p className="font-medium text-neutral-900">{reservation.guestName}</p>
                              <p className="text-sm text-neutral-600">{reservation.guests} guests</p>
                            </div>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                            <span className="mr-1">{getStatusIcon(reservation.status)}</span>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-neutral-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium">Check-in</div>
                              <div>{formatDate(reservation.checkIn)}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-neutral-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium">Check-out</div>
                              <div>{formatDate(reservation.checkOut)}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-neutral-600">
                            <span className="font-medium mr-2">Total:</span>
                            <span className="font-semibold text-neutral-900">{formatCurrency(reservation.totalCost)}</span>
                          </div>
                        </div>
                        
                        {reservation.specialRequests && (
                          <div className="mt-3 pt-3 border-t border-neutral-100">
                            <p className="text-sm text-neutral-600">
                              <span className="font-medium">Special requests:</span> {reservation.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability Calendar */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-heading font-semibold">Availability Calendar</h3>
                  {calendarData && (
                    <div className="text-sm text-neutral-500">
                      <Info className="inline h-4 w-4 mr-1" />
                      Green = Available, Red = Reserved
                    </div>
                  )}
                </div>
                
                {calendarLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Clock className="h-6 w-6 text-neutral-400 animate-spin mr-2" />
                    <span className="text-neutral-600">Loading calendar...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={prevMonth}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        disabled={calendarLoading}
                      >
                        <ChevronLeft className="h-5 w-5 text-neutral-600" />
                      </button>
                      
                      <h4 className="text-lg font-semibold text-neutral-900">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h4>
                      
                      <button 
                        onClick={nextMonth}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        disabled={calendarLoading}
                      >
                        <ChevronRight className="h-5 w-5 text-neutral-600" />
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div>
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
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center space-x-6 text-sm pt-4 border-t border-neutral-200">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                        <span className="text-neutral-600">Available</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
                        <span className="text-neutral-600">Reserved</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-32">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-neutral-900">
                  {formatCurrency(site.price)}
                </div>
                <div className="text-neutral-600">per night</div>
              </div>

              <button 
                onClick={handleBookNow}
                className="btn-primary w-full text-lg py-3 mb-4"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book This Site
              </button>

              <div className="space-y-3 text-sm text-neutral-600 border-t border-neutral-200 pt-4">
                <div className="flex justify-between">
                  <span>Check-in</span>
                  <span>3:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out</span>
                  <span>11:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>Cancellation</span>
                  <span>Free until check-in</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center text-primary-700 mb-2">
                  <Mountain className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Hot Springs Access</span>
                </div>
                <p className="text-sm text-primary-600">
                  Unlimited access to our natural mineral hot springs included with your stay.
                </p>
              </div>

              <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center text-secondary-700 mb-2">
                  <Wifi className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Free WiFi</span>
                </div>
                <p className="text-sm text-secondary-600">
                  Stay connected with complimentary high-speed internet access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}