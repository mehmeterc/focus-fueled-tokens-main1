
import { CafeType } from '@/types/cafe';

export const mockCafes: CafeType[] = [
  {
    id: 'cafe-1',
    name: 'Urban Brew',
    location: '123 Main St, Cityville',
    description: 'A modern café with minimalist design and ample workspace. Featuring local artisanal coffee and pastries.',
    image: '/lovable-uploads/4bb51d33-fa97-4a23-8530-6182ffc98507.png',
    distance: 1.2,
    amenities: ['wifi', 'power', 'drinks'],
    hours: {
      weekdays: '7:00 AM - 8:00 PM',
      weekends: '8:00 AM - 6:00 PM'
    },
    capacity: {
      total: 30,
      available: 12
    }
  },
  {
    id: 'cafe-2',
    name: 'The Coffee Station',
    location: '456 Oak Ave, Townsburg',
    description: 'Cozy atmosphere with comfortable seating and dedicated workspaces. Known for specialty teas and organic coffee options.',
    image: '/lovable-uploads/578940f1-eb81-4dbc-9671-d9ef3435efe9.png',
    distance: 2.8,
    amenities: ['wifi', 'power'],
    hours: {
      weekdays: '6:30 AM - 7:00 PM',
      weekends: '7:00 AM - 5:00 PM'
    },
    capacity: {
      total: 25,
      available: 8
    }
  },
  {
    id: 'cafe-3',
    name: 'Bean & Book',
    location: '789 Maple Rd, Villageton',
    description: 'Charming café with bookshelf-lined walls and quiet study areas. Serves fair-trade coffee and homemade baked goods.',
    image: '/lovable-uploads/1cb7a52e-49f0-4ba8-9188-16739163a343.png',
    distance: 3.5,
    amenities: ['wifi', 'drinks'],
    hours: {
      weekdays: '8:00 AM - 9:00 PM',
      weekends: '9:00 AM - 7:00 PM'
    },
    capacity: {
      total: 20,
      available: 15
    }
  },
  {
    id: 'cafe-4',
    name: 'The Grind House',
    location: '321 Pine St, Metropolis',
    description: 'Industrial-style café with large communal tables and private booths. Famous for their single-origin coffee selection.',
    image: '/lovable-uploads/4bb51d33-fa97-4a23-8530-6182ffc98507.png',
    distance: 4.2,
    amenities: ['power', 'drinks'],
    hours: {
      weekdays: '7:00 AM - 10:00 PM',
      weekends: '8:00 AM - 8:00 PM'
    },
    capacity: {
      total: 40,
      available: 22
    }
  },
  {
    id: 'cafe-5',
    name: 'Café Solstice',
    location: '555 Sunny Blvd, Beachside',
    description: 'Bright and airy café with outdoor seating and ocean views. Specializes in cold brews and refreshing beverages.',
    image: '/lovable-uploads/578940f1-eb81-4dbc-9671-d9ef3435efe9.png',
    distance: 5.7,
    amenities: ['wifi', 'power', 'drinks'],
    hours: {
      weekdays: '6:00 AM - 6:00 PM',
      weekends: '7:00 AM - 7:00 PM'
    },
    capacity: {
      total: 35,
      available: 10
    }
  },
  {
    id: 'cafe-6',
    name: 'Study Hub',
    location: '222 College Way, Universitytown',
    description: 'Student-friendly café with quiet study zones and group collaboration spaces. Affordable menu with student discounts.',
    image: '/lovable-uploads/1cb7a52e-49f0-4ba8-9188-16739163a343.png',
    distance: 6.3,
    amenities: ['wifi', 'power'],
    hours: {
      weekdays: '7:30 AM - 11:00 PM',
      weekends: '8:00 AM - 10:00 PM'
    },
    capacity: {
      total: 50,
      available: 30
    }
  }
];
