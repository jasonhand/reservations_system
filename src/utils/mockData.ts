import { Site, ApiResponse } from '../types';

// Mock sites data for development when backend is not available
export const mockSites: Site[] = [
  {
    id: 'campsite-1',
    name: 'Riverside Retreat',
    type: 'campsite',
    capacity: 4,
    price: 45.00,
    amenities: ['Fire pit', 'Picnic table', 'Water access', 'Hot springs access', 'Restroom nearby', 'Trash pickup'],
    description: 'A peaceful campsite nestled along the mountain stream with easy access to natural hot springs. Perfect for families who love the sound of flowing water.',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Stream-side location', 'Shaded area', '24/7 hot springs access', 'Wildlife viewing'],
    size: '20x30 ft'
  },
  {
    id: 'campsite-2',
    name: 'Mountain View Base',
    type: 'campsite',
    capacity: 6,
    price: 50.00,
    amenities: ['Fire pit', 'Picnic table', 'Electric hookup', 'Hot springs access', 'Bear box', 'Level tent pad'],
    description: 'Spacious campsite with stunning mountain vistas and convenient electric hookup. Great for larger groups seeking comfort in nature.',
    images: [
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Panoramic mountain views', 'Electric hookup', 'Large flat area', 'Easy vehicle access'],
    size: '25x35 ft'
  },
  {
    id: 'campsite-3',
    name: 'Forest Haven',
    type: 'campsite',
    capacity: 4,
    price: 40.00,
    amenities: ['Fire pit', 'Picnic table', 'Hot springs access', 'Privacy screen', 'Food storage locker', 'Lantern hook'],
    description: 'Secluded forest campsite offering maximum privacy among towering pine trees. Ideal for couples and small families seeking tranquility.',
    images: [
      'https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Complete privacy', 'Forest setting', 'Quiet location', 'Natural shade'],
    size: '20x25 ft'
  },
  {
    id: 'campsite-4',
    name: 'Stargazer\'s Point',
    type: 'campsite',
    capacity: 5,
    price: 48.00,
    amenities: ['Fire pit', 'Picnic table', 'Hot springs access', 'Clear sky view', 'Wind shelter', 'Gravel pad'],
    description: 'Elevated campsite with minimal light pollution, perfect for astronomy enthusiasts. Features a comfortable gravel pad and natural wind protection.',
    images: [
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Dark sky location', 'Elevated position', 'Wind protection', 'Easy setup'],
    size: '22x30 ft'
  },
  {
    id: 'cabin-1',
    name: 'Cozy Pine Cabin',
    type: 'cabin',
    capacity: 4,
    price: 120.00,
    amenities: ['Full kitchen', 'Private bathroom', 'Fireplace', 'Hot springs access', 'WiFi', 'Heating', 'Coffee maker', 'Linens provided'],
    description: 'Charming one-bedroom cabin with rustic charm and modern amenities. Features a full kitchen and cozy fireplace for romantic getaways.',
    images: [
      '/cabin_pics/cabin-01.jpg',
      '/cabin_pics/cabin-02.jpg',
      '/cabin_pics/cabin-03.jpg'
    ],
    features: ['Wood-burning fireplace', 'Full kitchen', 'Private deck', 'Mountain views'],
    size: '600 sq ft',
    bedrooms: 1,
    bathrooms: 1
  },
  {
    id: 'cabin-2',
    name: 'Family Lodge',
    type: 'cabin',
    capacity: 8,
    price: 180.00,
    amenities: ['Full kitchen', 'Two bathrooms', 'Living room', 'Hot springs access', 'WiFi', 'Heating', 'Washer/dryer', 'Game room', 'BBQ grill'],
    description: 'Spacious three-bedroom family lodge perfect for group retreats. Features a game room and large living area for gathering.',
    images: [
      '/cabin_pics/cabin-04.jpg',
      '/cabin_pics/cabin-05.jpg',
      '/cabin_pics/cabin-06.jpg'
    ],
    features: ['Large living area', 'Game room', 'Full laundry', 'Private BBQ area'],
    size: '1200 sq ft',
    bedrooms: 3,
    bathrooms: 2
  },
  {
    id: 'cabin-3',
    name: 'Mountain View Retreat',
    type: 'cabin',
    capacity: 6,
    price: 150.00,
    amenities: ['Full kitchen', 'Private bathroom', 'Hot tub', 'Hot springs access', 'WiFi', 'Heating', 'Panoramic windows', 'Deck'],
    description: 'Two-bedroom cabin with breathtaking mountain views and private hot tub. Floor-to-ceiling windows showcase the stunning landscape.',
    images: [
      '/cabin_pics/cabin-07.jpg',
      '/cabin_pics/cabin-08.jpg',
      '/cabin_pics/cabin-09.jpg'
    ],
    features: ['Private hot tub', 'Panoramic windows', 'Large deck', 'Premium views'],
    size: '900 sq ft',
    bedrooms: 2,
    bathrooms: 1
  },
  {
    id: 'cabin-4',
    name: 'Rustic Charm Lodge',
    type: 'cabin',
    capacity: 5,
    price: 135.00,
    amenities: ['Kitchenette', 'Private bathroom', 'Wood stove', 'Hot springs access', 'WiFi', 'Heating', 'Reading nook', 'Covered porch'],
    description: 'Authentic log cabin with traditional wood stove and cozy reading nook. Perfect blend of rustic charm and essential comforts.',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520637736862-4d197d17c93a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Authentic log construction', 'Wood-burning stove', 'Reading nook', 'Covered porch'],
    size: '750 sq ft',
    bedrooms: 2,
    bathrooms: 1
  },
  {
    id: 'premium-1',
    name: 'Luxury Glamping Tent',
    type: 'premium',
    capacity: 4,
    price: 200.00,
    amenities: ['King bed', 'Private bathroom', 'Mini fridge', 'Hot springs access', 'WiFi', 'Heating', 'Luxury linens', 'Coffee service', 'Concierge service'],
    description: 'Luxurious safari-style tent with hotel-quality amenities and stunning mountain views. Experience glamping at its finest.',
    images: [
      '/cabin_pics/cabin-10.jpg',
      '/cabin_pics/cabin-11.jpg',
      '/cabin_pics/cabin-12.jpg'
    ],
    features: ['Safari-style tent', 'Hotel amenities', 'Premium location', 'Concierge service'],
    size: '400 sq ft',
    bedrooms: 1,
    bathrooms: 1
  },
  {
    id: 'premium-2',
    name: 'Executive Mountain Suite',
    type: 'premium',
    capacity: 6,
    price: 350.00,
    amenities: ['Master suite', 'Two bathrooms', 'Full kitchen', 'Hot springs access', 'WiFi', 'Fireplace', 'Private hot tub', 'Concierge service', 'Daily housekeeping'],
    description: 'Ultimate luxury cabin with premium amenities, private hot tub, and dedicated concierge service. The pinnacle of mountain hospitality.',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520637736862-4d197d17c93a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Master suite', 'Private hot tub', 'Concierge service', 'Daily housekeeping'],
    size: '1400 sq ft',
    bedrooms: 2,
    bathrooms: 2
  }
];

export class MockApiClient {
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getSites(): Promise<ApiResponse<Site[]>> {
    await this.delay();
    return {
      success: true,
      data: mockSites
    };
  }

  async getSite(id: string): Promise<ApiResponse<Site>> {
    await this.delay();
    const site = mockSites.find(s => s.id === id);
    
    if (!site) {
      return {
        success: false,
        error: 'Site not found'
      };
    }

    return {
      success: true,
      data: site
    };
  }

  async getAvailableSites(): Promise<ApiResponse<Site[]>> {
    await this.delay();
    // Return all sites as available for demo
    return {
      success: true,
      data: mockSites
    };
  }

  async createReservation(): Promise<ApiResponse<any>> {
    await this.delay();
    return {
      success: false,
      error: 'Mock mode: Reservations cannot be created without backend server. Please run `npm run dev` in a separate terminal to start the backend server.'
    };
  }

  async getReservation(): Promise<ApiResponse<any>> {
    await this.delay();
    return {
      success: false,
      error: 'Mock mode: Backend server required for reservations.'
    };
  }

  async verifyReservation(): Promise<ApiResponse<any>> {
    await this.delay();
    return {
      success: false,
      error: 'Mock mode: Backend server required for reservations.'
    };
  }

  async cancelReservation(): Promise<ApiResponse<any>> {
    await this.delay();
    return {
      success: false,
      error: 'Mock mode: Backend server required for reservations.'
    };
  }

  async getReservations(): Promise<ApiResponse<any>> {
    await this.delay();
    return {
      success: false,
      error: 'Mock mode: Backend server required for admin functions.'
    };
  }

  async updateReservationStatus(): Promise<ApiResponse<any>> {
    await this.delay();
    return {
      success: false,
      error: 'Mock mode: Backend server required for admin functions.'
    };
  }
}