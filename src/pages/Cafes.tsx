
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CafeType, FilterOptions } from '@/types/cafe';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CafeList from '@/components/CafeList';
import CafeMap from '@/components/CafeMap';
import CafeFilters from '@/components/CafeFilters';
import { toast } from 'sonner';
import { Loader2, List, Pin } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

const fetchCafes = async () => {
  const { data, error } = await supabase
    .from('cafes')
    .select('*');
  
  if (error) {
    throw error;
  }

  // Transform Supabase data to match our CafeType
  return data.map(cafe => ({
    id: cafe.id,
    name: cafe.name,
    location: cafe.location,
    description: cafe.description,
    image: cafe.image,
    distance: cafe.distance,
    amenities: cafe.amenities,
    hours: {
      weekdays: cafe.weekday_hours,
      weekends: cafe.weekend_hours,
    },
    capacity: {
      total: cafe.total_capacity,
      available: cafe.available_capacity,
    },
    usdc_per_hour: cafe.usdc_per_hour ?? null
  }));
};

const Cafes = () => {
  const { data: allCafes, isLoading, error } = useQuery({
    queryKey: ['cafes'],
    queryFn: fetchCafes,
    staleTime: 60000, // 1 minute
  });

  const [filteredCafes, setFilteredCafes] = useState<CafeType[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    amenities: [],
    maxDistance: 10,
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    if (allCafes) {
      applyFilters(allCafes, filters);
    }
  }, [allCafes, filters]);

  const applyFilters = (cafes: CafeType[], currentFilters: FilterOptions) => {
    const filtered = cafes.filter(cafe => {
      // Filter by search term
      if (
        currentFilters.searchTerm &&
        !cafe.name.toLowerCase().includes(currentFilters.searchTerm.toLowerCase()) &&
        !cafe.location.toLowerCase().includes(currentFilters.searchTerm.toLowerCase())
      ) {
        return false;
      }
      
      // Filter by amenities
      if (currentFilters.amenities.length > 0) {
        if (!currentFilters.amenities.every(amenity => cafe.amenities.includes(amenity))) {
          return false;
        }
      }
      
      // Filter by distance
      if (cafe.distance > currentFilters.maxDistance) {
        return false;
      }
      
      return true;
    });
    
    setFilteredCafes(filtered);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Show error if failed to fetch cafes
  if (error) {
    toast("Failed to load cafes", {
      description: (error as Error).message,
    });
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-antiapp-purple">Find Cafes</h1>
            
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Toggle 
                pressed={viewMode === 'list'} 
                onPressedChange={() => setViewMode('list')}
                className={`flex items-center gap-1 ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                <List className="h-4 w-4" />
                <span className="text-sm">List</span>
              </Toggle>
              <Toggle 
                pressed={viewMode === 'map'} 
                onPressedChange={() => setViewMode('map')}
                className={`flex items-center gap-1 ${viewMode === 'map' ? 'bg-white shadow' : ''}`}
              >
                <Pin className="h-4 w-4" />
                <span className="text-sm">Map</span>
              </Toggle>
            </div>
          </div>
          
          <CafeFilters filters={filters} onFilterChange={handleFilterChange} />
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-antiapp-purple" />
              <span className="ml-2 text-gray-600">Loading cafes...</span>
            </div>
          ) : (
            viewMode === 'list' ? (
              <CafeList cafes={filteredCafes} />
            ) : (
              <CafeMap cafes={filteredCafes} />
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cafes;
