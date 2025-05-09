
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CafeType } from '@/types/cafe';
import { MapPin, Clock, Wifi, Power, Coffee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fetchCafe = async (id: string) => {
  const { data, error } = await supabase
    .from('cafes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    location: data.location,
    description: data.description,
    image: data.image,
    distance: data.distance,
    amenities: data.amenities,
    hours: {
      weekdays: data.weekday_hours,
      weekends: data.weekend_hours,
    },
    capacity: {
      total: data.total_capacity,
      available: data.available_capacity,
    },
    usdc_per_hour: data.usdc_per_hour ?? null
  } as CafeType;
};

const CafeDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: cafe, isLoading, error } = useQuery({
    queryKey: ['cafe', id],
    queryFn: () => fetchCafe(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching cafe:', error);
      toast('Failed to load cafe details', {
        description: (error as Error).message,
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-antiapp-purple rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cafe details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-antiapp-purple">Cafe not found</h2>
            <p className="mt-2 text-gray-600">The cafe you're looking for doesn't exist or has been removed.</p>
            <Link to="/cafes">
              <Button className="mt-4 bg-antiapp-teal hover:bg-antiapp-teal/90">Back to Cafes</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Link to="/cafes" className="text-antiapp-teal hover:text-antiapp-teal/80">
              ← Back to Cafes
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={cafe.image} 
                alt={cafe.name} 
                className="w-full h-80 object-cover"
              />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-antiapp-purple">{cafe.name}</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{cafe.location}</span>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-medium text-antiapp-purple">About</h3>
                <p className="mt-2 text-gray-700">{cafe.description}</p>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-lg font-medium text-antiapp-purple">Hours</h3>
                <div className="mt-2 flex items-start">
                  <Clock className="h-4 w-4 mr-2 mt-1" />
                  <div>
                    <p className="text-gray-700">Monday - Friday: {cafe.hours.weekdays}</p>
                    <p className="text-gray-700">Weekends: {cafe.hours.weekends}</p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-lg font-medium text-antiapp-purple">Amenities</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cafe.amenities?.includes('wifi') && (
                    <div className="flex items-center px-3 py-1 bg-antiapp-peach/30 rounded-full">
                      <Wifi className="h-4 w-4 mr-1" />
                      <span className="text-sm">Fast WiFi</span>
                    </div>
                  )}
                  {cafe.amenities?.includes('power') && (
                    <div className="flex items-center px-3 py-1 bg-antiapp-peach/30 rounded-full">
                      <Power className="h-4 w-4 mr-1" />
                      <span className="text-sm">Power Outlets</span>
                    </div>
                  )}
                  {cafe.amenities?.includes('drinks') && (
                    <div className="flex items-center px-3 py-1 bg-antiapp-peach/30 rounded-full">
                      <Coffee className="h-4 w-4 mr-1" />
                      <span className="text-sm">Great Drinks</span>
                    </div>
                  )}
                </div>
              </div>
              
              {typeof cafe.usdc_per_hour === 'number' && cafe.usdc_per_hour !== null && (
                <div className="mb-4 mt-4 p-4 bg-gray-50 rounded-lg border border-antiapp-teal/20">
                  <div className="text-md text-gray-700">
                    <span className="font-semibold">Base Rate:</span> {cafe.usdc_per_hour.toFixed(2)} USDC/hr
                  </div>
                  <div className="text-md text-gray-700">
                    <span className="font-semibold">Platform Commission (10%):</span> {(cafe.usdc_per_hour * 0.1).toFixed(2)} USDC/hr
                  </div>
                  <div className="text-md text-gray-900 mt-1">
                    <span className="font-semibold">Total per Hour:</span> {(cafe.usdc_per_hour * 1.1).toFixed(2)} USDC/hr
                  </div>
                  <div className="text-xs text-gray-500 mt-1">You will see the total with commission at checkout.</div>
                </div>
              )}
              <div className="mt-6 flex space-x-4">
                <Link to={`/checkin/${cafe.id}`}>
                  <Button className="bg-antiapp-teal hover:bg-antiapp-teal/90">Check In</Button>
                </Link>
                <a href={`https://maps.google.com/?q=${cafe.location}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-antiapp-teal text-antiapp-teal hover:bg-antiapp-teal/10">
                    Get Directions
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CafeDetail;
