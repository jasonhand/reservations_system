import { useState, useEffect } from 'react';
import { Reservation } from '../types';
import { formatCurrency, formatDate } from '../utils/api';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

interface AdminStats {
  totalReservations: number;
  reservationsByStatus: Array<{ status: string; count: number }>;
  currentMonthRevenue: number;
  upcomingCheckIns: number;
  siteTypePopularity: Array<{ type: string; bookings: number }>;
  recentActivity: Array<{
    id: string;
    guest_name: string;
    site_name: string;
    status: string;
    created_at: string;
  }>;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
      loadDashboardData(token);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        setAuthToken(data.data.token);
        localStorage.setItem('admin_token', data.data.token);
        setIsAuthenticated(true);
        loadDashboardData(data.data.token);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (token: string) => {
    try {
      setLoading(true);
      
      // Load stats and reservations in parallel
      const [statsResponse, reservationsResponse] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/reservations', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [statsData, reservationsData] = await Promise.all([
        statsResponse.json(),
        reservationsResponse.json(),
      ]);

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (reservationsData.success) {
        setReservations(reservationsData.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    if (!authToken) return;

    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setReservations(prev => 
          prev.map(res => 
            res.id === reservationId 
              ? { ...res, status: newStatus as any }
              : res
          )
        );
        
        // Reload stats
        loadDashboardData(authToken);
      } else {
        setError(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Failed to update reservation status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setAuthToken(null);
    setReservations([]);
    setStats(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-accent-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-secondary-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-accent-100 text-accent-700';
      case 'pending':
        return 'bg-secondary-100 text-secondary-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="card p-8">
            <h1 className="text-2xl font-heading font-bold text-center mb-6">
              Admin Login
            </h1>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className="input-field"
                  placeholder="admin@pineridgehotsprings.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="input-field"
                  placeholder="Enter password"
                  required
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-6 text-center text-sm text-neutral-600">
              Demo credentials:<br />
              Email: admin@pineridgehotsprings.com<br />
              Password: admin123
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-width py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-heading font-bold">Admin Dashboard</h1>
            <button onClick={handleLogout} className="btn-outline">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container-width py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-600">Total Reservations</p>
                  <p className="text-2xl font-bold">{stats.totalReservations}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-600">This Month Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.currentMonthRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <Users className="h-6 w-6 text-accent-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-600">Upcoming Check-ins</p>
                  <p className="text-2xl font-bold">{stats.upcomingCheckIns}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-neutral-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-neutral-600">Confirmed</p>
                  <p className="text-2xl font-bold">
                    {stats.reservationsByStatus.find(s => s.status === 'confirmed')?.count || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reservations Table */}
        <div className="card">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-heading font-semibold">Recent Reservations</h2>
              <div className="flex items-center space-x-4">
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="input-field text-sm"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {reservations
                  .filter(res => !filters.status || res.status === filters.status)
                  .map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {reservation.guestName}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {reservation.guestEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{reservation.siteName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {formatDate(reservation.checkIn)}
                      </div>
                      <div className="text-sm text-neutral-500">
                        to {formatDate(reservation.checkOut)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {reservation.guests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {formatCurrency(reservation.totalCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusIcon(reservation.status)}
                        <span className="ml-1 capitalize">{reservation.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {reservation.status === 'pending' && (
                          <button
                            onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                            className="text-accent-600 hover:text-accent-900"
                          >
                            Confirm
                          </button>
                        )}
                        {reservation.status !== 'cancelled' && (
                          <button
                            onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}