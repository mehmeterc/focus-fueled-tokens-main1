
export interface CafeType {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  distance: number; // in kilometers
  amenities: string[]; // 'wifi', 'power', 'drinks', etc.
  hours: {
    weekdays: string;
    weekends: string;
  };
  capacity: {
    total: number;
    available: number;
  };
  usdc_per_hour: number | null; // USDC price per hour (nullable)
  qrCodeUrl?: string; // Optional URL for cafe-specific QR code
}


export interface FilterOptions {
  searchTerm: string;
  amenities: string[];
  maxDistance: number;
}
