
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FilterOptions } from '@/types/cafe';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';

interface CafeFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const CafeFilters = ({ filters, onFilterChange }: CafeFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange(localFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localFilters.searchTerm, localFilters.maxDistance]);

  const handleAmenityChange = (amenity: string) => {
    const newAmenities = localFilters.amenities.includes(amenity)
      ? localFilters.amenities.filter(a => a !== amenity)
      : [...localFilters.amenities, amenity];
    
    const newFilters = {
      ...localFilters,
      amenities: newAmenities
    };
    
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search cafes by name or location..."
          value={localFilters.searchTerm}
          onChange={(e) => setLocalFilters({ ...localFilters, searchTerm: e.target.value })}
          className="pl-10"
        />
      </div>
      
      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <Filter className="h-4 w-4" />
          <span>{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </Button>
      </div>
      
      <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distance filter */}
          <div>
            <h3 className="font-medium text-sm text-antiapp-purple mb-2">Distance</h3>
            <div className="mb-2">
              <span className="text-sm text-gray-600">Max {localFilters.maxDistance} km</span>
            </div>
            <Slider
              value={[localFilters.maxDistance]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => setLocalFilters({ ...localFilters, maxDistance: value[0] })}
              className="mb-4"
            />
          </div>
          
          {/* Amenities filter */}
          <div>
            <h3 className="font-medium text-sm text-antiapp-purple mb-2">Amenities</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="wifi" 
                  checked={localFilters.amenities.includes('wifi')}
                  onCheckedChange={() => handleAmenityChange('wifi')}
                />
                <Label htmlFor="wifi" className="text-sm cursor-pointer">WiFi</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="power" 
                  checked={localFilters.amenities.includes('power')}
                  onCheckedChange={() => handleAmenityChange('power')}
                />
                <Label htmlFor="power" className="text-sm cursor-pointer">Power Outlets</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="drinks" 
                  checked={localFilters.amenities.includes('drinks')}
                  onCheckedChange={() => handleAmenityChange('drinks')}
                />
                <Label htmlFor="drinks" className="text-sm cursor-pointer">Quality Drinks</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeFilters;
