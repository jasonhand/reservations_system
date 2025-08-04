import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Reservation } from '../types';
import { apiClient, formatCurrency, formatDate } from '../utils/api';
import { CheckCircle, Mail, Calendar, MapPin, Users, AlertCircle } from 'lucide-react';

export default function ConfirmationPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (reservationId) {
      loadReservation(reservationId);
    }
  }, [reservationId]);

  useEffect(() => {
    if (token && reservation && reservation.status === 'pending') {
      verifyReservation(token);
    }
  }, [token, reservation]);

  const loadReservation = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getReservation(id);
      
      if (response.success && response.data) {
        setReservation(response.data);
      } else {
        setError(response.error || 'Reservation not found');
      }
    } catch (err) {
      setError('Failed to load reservation');
    } finally {
      setLoading(false);
    }
  };

  const verifyReservation = async (verificationToken: string) => {
    try {
      setVerifying(true);
      const response = await apiClient.verifyReservation(verificationToken);
      
      if (response.success && response.data) {
        setReservation(response.data);
        setVerified(true);
      } else {
        setError(response.error || 'Failed to verify reservation');
      }
    } catch (err) {
      setError('Failed to verify reservation');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-neutral-600">Loading your reservation...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-4">
            Reservation Not Found
          </h1>
          <p className="text-neutral-600 mb-6">
            {error || 'We couldn\'t find the reservation you\'re looking for.'}
          </p>
          <Link to="/sites" className="btn-primary">
            Make New Reservation
          </Link>
        </div>
      </div>
    );
  }

  const nights = Math.ceil(
    (new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) 
    / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-width">
        <div className="max-w-2xl mx-auto">
          {/* Status Header */}
          <div className="text-center mb-8">
            {verifying ? (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-2">
                  Verifying Your Reservation
                </h1>
                <p className="text-neutral-600">Please wait while we confirm your booking...</p>
              </>
            ) : reservation.status === 'confirmed' || verified ? (
              <>
                <CheckCircle className="h-16 w-16 text-accent-600 mx-auto mb-4" />
                <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-2">
                  Reservation Confirmed!
                </h1>
                <p className="text-neutral-600">
                  Your mountain adventure is all set. We can't wait to welcome you!
                </p>
              </>
            ) : (
              <>
                <Mail className="h-16 w-16 text-secondary-600 mx-auto mb-4" />
                <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-2">
                  Check Your Email
                </h1>
                <p className="text-neutral-600">
                  We've sent a confirmation email to <strong>{reservation.guestEmail}</strong>. 
                  Please click the link in the email to confirm your reservation.
                </p>
              </>
            )}
          </div>

          {/* Reservation Details */}
          <div className="card p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold">Reservation Details</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                reservation.status === 'confirmed' 
                  ? 'bg-accent-100 text-accent-700' 
                  : 'bg-secondary-100 text-secondary-700'
              }`}>
                {reservation.status === 'confirmed' ? '✅ Confirmed' : '⏰ Pending'}
              </span>
            </div>

            <div className="space-y-6">
              {/* Confirmation Number */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-600 mb-1">Confirmation Number</p>
                <p className="font-mono text-lg font-semibold text-neutral-900">
                  {reservation.id}
                </p>
              </div>

              {/* Site Information */}
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-neutral-900">{reservation.siteName}</h3>
                  <p className="text-neutral-600 capitalize">
                    {(reservation as any).site_type || 'Site'}
                  </p>
                </div>
              </div>

              {/* Dates and Guests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-6 w-6 text-primary-600 mt-1" />
                  <div>
                    <p className="font-semibold text-neutral-900">Check-in</p>
                    <p className="text-neutral-600">{formatDate(reservation.checkIn)}</p>
                    <p className="text-sm text-neutral-500">3:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-6 w-6 text-primary-600 mt-1" />
                  <div>
                    <p className="font-semibold text-neutral-900">Check-out</p>
                    <p className="text-neutral-600">{formatDate(reservation.checkOut)}</p>
                    <p className="text-sm text-neutral-500">11:00 AM</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-primary-600 mt-1" />
                <div>
                  <p className="font-semibold text-neutral-900">Guests & Duration</p>
                  <p className="text-neutral-600">{reservation.guests} guests • {nights} nights</p>
                </div>
              </div>

              {/* Guest Information */}
              <div className="border-t border-neutral-200 pt-6">
                <h4 className="font-semibold text-neutral-900 mb-3">Guest Information</h4>
                <div className="space-y-2">
                  <p><span className="text-neutral-600">Name:</span> {reservation.guestName}</p>
                  <p><span className="text-neutral-600">Email:</span> {reservation.guestEmail}</p>
                  <p><span className="text-neutral-600">Phone:</span> {reservation.guestPhone}</p>
                  {reservation.specialRequests && (
                    <div>
                      <p className="text-neutral-600 mb-1">Special Requests:</p>
                      <p className="bg-neutral-50 p-3 rounded text-sm">{reservation.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="border-t border-neutral-200 pt-6">
                <h4 className="font-semibold text-neutral-900 mb-3">Cost Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">
                      {formatCurrency(reservation.totalCost / nights)} × {nights} nights
                    </span>
                    <span>{formatCurrency(reservation.totalCost)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-neutral-200">
                    <span>Total</span>
                    <span>{formatCurrency(reservation.totalCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-heading font-semibold mb-4">What's Next?</h3>
            <div className="space-y-4">
              {reservation.status === 'pending' && !verified && (
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-secondary-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Check Your Email</p>
                    <p className="text-sm text-neutral-600">
                      Click the confirmation link to finalize your reservation.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <span className="text-lg mt-0.5">🏔️</span>
                <div>
                  <p className="font-medium">Prepare for Your Stay</p>
                  <p className="text-sm text-neutral-600">
                    Pack warm clothes and don't forget your swimsuit for the hot springs!
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-lg mt-0.5">📱</span>
                <div>
                  <p className="font-medium">Stay in Touch</p>
                  <p className="text-sm text-neutral-600">
                    Call us at (555) SPRINGS if you have any questions or need to make changes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="text-center space-y-4">
            <Link to="/sites" className="btn-primary">
              Make Another Reservation
            </Link>
            <div>
              <Link to="/" className="text-primary-600 hover:text-primary-700">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}