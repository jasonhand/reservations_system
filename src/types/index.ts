export interface Site {
  id: string;
  name: string;
  type: 'campsite' | 'cabin' | 'premium';
  capacity: number;
  price: number;
  amenities: string[];
  description: string;
  images: string[];
  features: string[];
  size?: string;
  bedrooms?: number;
  bathrooms?: number;
}

export interface Reservation {
  id: string;
  siteId: string;
  siteName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalCost: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  verificationToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFormData {
  siteId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
}

export interface AvailabilityQuery {
  checkIn: string;
  checkOut: string;
  guests: number;
  siteType?: 'campsite' | 'cabin' | 'premium';
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ReservationSummary {
  site: Site;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalCost: number;
  guestInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
}

export interface DayAvailability {
  date: string;
  reservedSites: number;
  availableSites: number;
  status: 'available' | 'partial' | 'full';
}

export interface AvailabilityOverview {
  totalSites: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  availability: DayAvailability[];
}

export interface SiteAvailability {
  siteId: string;
  siteName: string;
  totalDays: number;
  availableDays: number;
  unavailableDays: number;
}

export interface SiteDayAvailability {
  date: string;
  available: boolean;
  reservation: {
    guestName: string;
    status: string;
    checkIn: string;
    checkOut: string;
  } | null;
}

export interface SiteCalendarData {
  siteId: string;
  siteName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  availability: SiteDayAvailability[];
}