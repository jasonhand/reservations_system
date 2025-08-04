import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { useReservation } from '../contexts/ReservationContext';
import { apiClient, formatCurrency, calculateNights } from '../utils/api';
import { BookingFormData } from '../types';
import { Calendar, User, ArrowRight } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

export default function BookingPage() {
  const navigate = useNavigate();
  const { state, setDateRange } = useReservation();
  const { selectedSite, dateRange, guests } = state;
  
  const [startDate, setStartDate] = useState<Date | null>(dateRange.startDate);
  const [endDate, setEndDate] = useState<Date | null>(dateRange.endDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormData>();

  useEffect(() => {
    if (!selectedSite) {
      navigate('/sites');
    }
  }, [selectedSite, navigate]);

  // Handle date changes
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setDateRange({ startDate: date, endDate });
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setDateRange({ startDate, endDate: date });
  };


  const handleBookingSubmit = async (data: BookingFormData) => {
    if (!selectedSite || !startDate || !endDate) {
      setError('Please select dates and site');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingData: BookingFormData = {
        siteId: selectedSite.id,
        checkIn: startDate.toISOString().split('T')[0],
        checkOut: endDate.toISOString().split('T')[0],
        guests: parseInt(data.guests.toString()),
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        specialRequests: data.specialRequests || ''
      };

      const response = await apiClient.createReservation(bookingData);

      if (response.success && response.data) {
        navigate(`/confirmation/${response.data.id}`);
      } else {
        setError(response.error || 'Failed to create reservation');
      }
    } catch (err) {
      setError('Failed to create reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedSite) {
    return null;
  }

  const nights = startDate && endDate ? calculateNights(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ) : 0;

  const totalCost = nights * selectedSite.price;

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-width">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-8">
            Complete Your Reservation
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(handleBookingSubmit)} className="space-y-6">
                {/* Dates Section */}
                <div className="card p-6">
                  <h3 className="text-lg font-heading font-semibold mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Select Your Dates
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Check-in Date
                      </label>
                      <DatePicker
                        selected={startDate}
                        onChange={handleStartDateChange}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        minDate={new Date()}
                        maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                        className="input-field w-full"
                        placeholderText="Select check-in date"
                        dateFormat="MMMM d, yyyy"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Check-out Date
                      </label>
                      <DatePicker
                        selected={endDate}
                        onChange={handleEndDateChange}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                        maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                        className="input-field w-full"
                        placeholderText="Select check-out date"
                        dateFormat="MMMM d, yyyy"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Number of Guests
                    </label>
                    <select 
                      {...register('guests', { 
                        required: 'Number of guests is required',
                        min: { value: 1, message: 'At least 1 guest required' },
                        max: { value: selectedSite.capacity, message: `Maximum ${selectedSite.capacity} guests allowed` }
                      })}
                      className="input-field max-w-xs"
                      defaultValue={guests}
                    >
                      {[...Array(selectedSite.capacity)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                    {errors.guests && (
                      <p className="mt-1 text-sm text-red-600">{errors.guests.message}</p>
                    )}
                  </div>
                </div>

                {/* Guest Information */}
                <div className="card p-6">
                  <h3 className="text-lg font-heading font-semibold mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Guest Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        {...register('guestName', { 
                          required: 'Full name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' }
                        })}
                        type="text"
                        className="input-field"
                        placeholder="Enter your full name"
                      />
                      {errors.guestName && (
                        <p className="mt-1 text-sm text-red-600">{errors.guestName.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          {...register('guestEmail', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          type="email"
                          className="input-field"
                          placeholder="your@email.com"
                        />
                        {errors.guestEmail && (
                          <p className="mt-1 text-sm text-red-600">{errors.guestEmail.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          {...register('guestPhone', { 
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[\+]?[1-9][\d]{0,15}$/,
                              message: 'Please enter a valid phone number'
                            }
                          })}
                          type="tel"
                          className="input-field"
                          placeholder="(555) 123-4567"
                        />
                        {errors.guestPhone && (
                          <p className="mt-1 text-sm text-red-600">{errors.guestPhone.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        {...register('specialRequests')}
                        rows={3}
                        className="input-field"
                        placeholder="Any special requests or requirements..."
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !startDate || !endDate}
                  className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Creating Reservation...'
                  ) : (
                    <>
                      Complete Reservation
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Reservation Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="text-lg font-heading font-semibold mb-4">
                  Reservation Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <img 
                      src={selectedSite.images[0]} 
                      alt={selectedSite.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-neutral-900">{selectedSite.name}</h4>
                      <p className="text-sm text-neutral-600 capitalize">{selectedSite.type}</p>
                    </div>
                  </div>

                  {startDate && endDate && (
                    <div className="space-y-2 py-4 border-y border-neutral-200">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Check-in</span>
                        <span>{startDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Check-out</span>
                        <span>{endDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Nights</span>
                        <span>{nights}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Guests</span>
                        <span>{guests}</span>
                      </div>
                    </div>
                  )}

                  {nights > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          {formatCurrency(selectedSite.price)} × {nights} nights
                        </span>
                        <span>{formatCurrency(totalCost)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t border-neutral-200">
                        <span>Total</span>
                        <span>{formatCurrency(totalCost)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700">
                    🏔️ Hot springs access included<br />
                    📧 Email confirmation required<br />
                    ❌ Free cancellation until check-in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}