import { Site, Reservation, BookingFormData, AvailabilityQuery, ApiResponse, SiteCalendarData, SiteDayAvailability, AvailabilityOverview, SiteAvailability } from '../types';
import { MockApiClient, mockSites } from './mockData';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Production (Netlify)
  if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('pineridgehotsprings')) {
    return '/.netlify/functions/api';
  }
  
  // Development with backend server
  if (window.location.hostname === 'localhost' && window.location.port === '3000') {
    return 'http://localhost:3001/api';
  }
  
  // Fallback
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private mockClient = new MockApiClient();
  private useMockData = false;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // If we've already determined to use mock data, skip the network request
    if (this.useMockData) {
      throw new Error('Backend server not available - using mock data');
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server error: ${response.status}. Expected JSON response but got ${contentType || 'unknown content type'}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // If it's a network error in development, switch to mock mode
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('🔧 Backend server not running - switching to mock data mode. To enable full functionality, run: npm run dev:backend');
        this.useMockData = true;
        throw new Error('Backend server not available - using mock data');
      }
      
      // Provide helpful error messages based on the error type
      let errorMessage = 'An unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Sites
  async getSites(): Promise<ApiResponse<Site[]>> {
    // Try the API first
    const apiResult = await this.tryApiRequest<Site[]>('/sites');
    
    // If API failed and we're in development, use mock data
    if (!apiResult.success && window.location.hostname === 'localhost') {
      console.log('API failed, using mock data for sites');
      return this.mockClient.getSites();
    }
    
    return apiResult;
  }

  private async tryApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      return await this.request<T>(endpoint, options);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API request failed'
      };
    }
  }

  async getSite(id: string): Promise<ApiResponse<Site>> {
    const apiResult = await this.tryApiRequest<Site>(`/sites/${id}`);
    
    if (!apiResult.success && window.location.hostname === 'localhost') {
      console.log('API failed, using mock data for site:', id);
      return this.mockClient.getSite(id);
    }
    
    return apiResult;
  }

  async getAvailableSites(query: AvailabilityQuery): Promise<ApiResponse<Site[]>> {
    const searchParams = new URLSearchParams({
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      guests: query.guests.toString(),
      ...(query.siteType && { siteType: query.siteType }),
    });

    const apiResult = await this.tryApiRequest<Site[]>(`/sites/available?${searchParams}`);
    
    if (!apiResult.success && window.location.hostname === 'localhost') {
      console.log('API failed, using mock data for available sites');
      return this.mockClient.getAvailableSites();
    }
    
    return apiResult;
  }

  async getAvailabilityOverview(startDate: string, endDate: string): Promise<ApiResponse<AvailabilityOverview>> {
    const searchParams = new URLSearchParams({
      startDate,
      endDate
    });

    try {
      return await this.request<AvailabilityOverview>(`/sites/availability/overview?${searchParams}`);
    } catch (error) {
      if (this.useMockData) {
        // Return mock data for development
        return {
          success: true,
          data: {
            totalSites: 10,
            dateRange: { startDate, endDate },
            availability: []
          }
        };
      }
      throw error;
    }
  }

  async getIndividualSiteAvailability(startDate: string, endDate: string): Promise<ApiResponse<Record<string, SiteAvailability>>> {
    try {
      const response = await this.request<Record<string, SiteAvailability>>(
        `/sites/individual-availability?startDate=${startDate}&endDate=${endDate}`
      );
      return response;
    } catch (error) {
      if (this.useMockData) {
        console.warn('🔧 Backend server not running - switching to mock data mode. To enable full functionality, start the backend server.');
        
        // Create mock individual site availability data
        const mockData: Record<string, SiteAvailability> = {};
        const sites = mockSites;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        sites.forEach((site: Site) => {
          // Mock some random availability
          const unavailableDays = Math.floor(Math.random() * (totalDays / 3));
          mockData[site.id] = {
            siteId: site.id,
            siteName: site.name,
            totalDays,
            availableDays: totalDays - unavailableDays,
            unavailableDays
          };
        });
        
        return {
          success: true,
          data: mockData
        };
      }
      throw error;
    }
  }

  // Reservations
  async createReservation(bookingData: BookingFormData): Promise<ApiResponse<Reservation>> {
    try {
      return await this.request<Reservation>('/reservations', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    } catch (error) {
      if (this.useMockData) {
        return this.mockClient.createReservation();
      }
      throw error;
    }
  }

  async getReservation(id: string): Promise<ApiResponse<Reservation>> {
    try {
      return await this.request<Reservation>(`/reservations/${id}`);
    } catch (error) {
      if (this.useMockData) {
        return this.mockClient.getReservation();
      }
      throw error;
    }
  }

  async verifyReservation(token: string): Promise<ApiResponse<Reservation>> {
    try {
      return await this.request<Reservation>('/reservations/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      if (this.useMockData) {
        return this.mockClient.verifyReservation();
      }
      throw error;
    }
  }

  async cancelReservation(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await this.request<{ message: string }>(`/reservations/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (this.useMockData) {
        return this.mockClient.cancelReservation();
      }
      throw error;
    }
  }

  async getSiteReservations(siteId: string, status?: string): Promise<ApiResponse<Reservation[]>> {
    try {
      const queryParams = status ? `?status=${status}` : '';
      return await this.request<Reservation[]>(`/reservations/site/${siteId}${queryParams}`);
    } catch (error) {
      if (this.useMockData) {
        // Return mock data for development
        return {
          success: true,
          data: []
        };
      }
      throw error;
    }
  }

  async getSiteCalendar(siteId: string, startDate: string, endDate: string): Promise<ApiResponse<SiteCalendarData>> {
    try {
      const searchParams = new URLSearchParams({
        startDate,
        endDate
      });
      return await this.request<SiteCalendarData>(`/sites/${siteId}/availability/calendar?${searchParams}`);
    } catch (error) {
      if (this.useMockData) {
        // Return mock calendar data for development
        const start = new Date(startDate);
        const end = new Date(endDate);
        const availability: SiteDayAvailability[] = [];
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          // Mock some random reservations (20% chance of being reserved)
          const isReserved = Math.random() < 0.2;
          availability.push({
            date: dateStr,
            available: !isReserved,
            reservation: isReserved ? {
              guestName: 'Mock Guest',
              status: 'confirmed',
              checkIn: dateStr,
              checkOut: new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            } : null
          });
        }
        
        return {
          success: true,
          data: {
            siteId,
            siteName: 'Mock Site',
            dateRange: { startDate, endDate },
            availability
          }
        };
      }
      throw error;
    }
  }

  // Admin
  async getReservations(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Reservation[]>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.startDate) searchParams.append('startDate', params.startDate);
      if (params?.endDate) searchParams.append('endDate', params.endDate);

      const query = searchParams.toString();
      return await this.request<Reservation[]>(`/admin/reservations${query ? `?${query}` : ''}`);
    } catch (error) {
      if (this.useMockData) {
        return this.mockClient.getReservations();
      }
      throw error;
    }
  }

  async updateReservationStatus(
    id: string,
    status: 'confirmed' | 'cancelled'
  ): Promise<ApiResponse<Reservation>> {
    try {
      return await this.request<Reservation>(`/admin/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      if (this.useMockData) {
        return this.mockClient.updateReservationStatus();
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  if (!date) {
    return 'Invalid Date';
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isDateRangeValid(startDate: Date | null, endDate: Date | null): boolean {
  if (!startDate || !endDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return startDate >= today && endDate > startDate;
}