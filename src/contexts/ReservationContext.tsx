import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import { Site, BookingFormData, DateRange } from '../types';

interface ReservationState {
  selectedSite: Site | null;
  dateRange: DateRange;
  guests: number;
  bookingData: Partial<BookingFormData>;
  loading: boolean;
  error: string | null;
}

type ReservationAction =
  | { type: 'SET_SELECTED_SITE'; payload: Site | null }
  | { type: 'SET_DATE_RANGE'; payload: DateRange }
  | { type: 'SET_GUESTS'; payload: number }
  | { type: 'SET_BOOKING_DATA'; payload: Partial<BookingFormData> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_BOOKING' };

const initialState: ReservationState = {
  selectedSite: null,
  dateRange: { startDate: null, endDate: null },
  guests: 2,
  bookingData: {},
  loading: false,
  error: null,
};

function reservationReducer(state: ReservationState, action: ReservationAction): ReservationState {
  switch (action.type) {
    case 'SET_SELECTED_SITE':
      return { ...state, selectedSite: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_GUESTS':
      return { ...state, guests: action.payload };
    case 'SET_BOOKING_DATA':
      return { ...state, bookingData: { ...state.bookingData, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_BOOKING':
      return { ...initialState };
    default:
      return state;
  }
}

interface ReservationContextType {
  state: ReservationState;
  dispatch: React.Dispatch<ReservationAction>;
  setSelectedSite: (site: Site | null) => void;
  setDateRange: (dateRange: DateRange) => void;
  setGuests: (guests: number) => void;
  setBookingData: (data: Partial<BookingFormData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetBooking: () => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reservationReducer, initialState);

  const setSelectedSite = useCallback((site: Site | null) => {
    dispatch({ type: 'SET_SELECTED_SITE', payload: site });
  }, []);

  const setDateRange = useCallback((dateRange: DateRange) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: dateRange });
  }, []);

  const setGuests = useCallback((guests: number) => {
    dispatch({ type: 'SET_GUESTS', payload: guests });
  }, []);

  const setBookingData = useCallback((data: Partial<BookingFormData>) => {
    dispatch({ type: 'SET_BOOKING_DATA', payload: data });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const resetBooking = useCallback(() => {
    dispatch({ type: 'RESET_BOOKING' });
  }, []);

  const contextValue: ReservationContextType = useMemo(() => ({
    state,
    dispatch,
    setSelectedSite,
    setDateRange,
    setGuests,
    setBookingData,
    setLoading,
    setError,
    resetBooking,
  }), [state, setSelectedSite, setDateRange, setGuests, setBookingData, setLoading, setError, resetBooking]);

  return (
    <ReservationContext.Provider value={contextValue}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
}