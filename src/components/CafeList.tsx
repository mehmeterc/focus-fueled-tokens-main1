
import { Link } from 'react-router-dom';
import { CafeType } from '@/types/cafe';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Wifi, Power, Coffee, Users, Timer, Coins, ArrowRight } from 'lucide-react';

interface CafeListProps {
  cafes: CafeType[];
}

const CafeList = ({ cafes }: CafeListProps) => {
  if (cafes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">No workspaces match your search criteria.</p>
        <p className="text-gray-500">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {cafes.map((cafe) => (
        <Link to={`/cafe/${cafe.id}`} key={cafe.id}>
          <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-antiapp-teal/20">
            <div className="relative h-48">
              <img 
                src={cafe.image} 
                alt={cafe.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-antiapp-teal">
                  {cafe.distance} km away
                </Badge>
              </div>
              {/* Workspace Availability Badge */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-white">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">{cafe.capacity?.available || 0}/{cafe.capacity?.total || 0} Available</span>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Open Now
                  </Badge>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold text-antiapp-purple">{cafe.name}</h3>
              
              {/* Focus Earning Rate - Highlight */}
              {typeof cafe.usdc_per_hour === 'number' && cafe.usdc_per_hour !== null && (
                <div className="mt-2 p-2 bg-yellow-100 rounded-md border border-yellow-300">
                  <div className="flex items-center">
                    <Timer className="h-4 w-4 text-yellow-700 mr-1" />
                    <span className="text-sm font-medium text-yellow-800">Focus Rate:</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      <Coins className="h-3 w-3 text-yellow-700 mr-1" />
                      <span className="text-sm">Pay: {cafe.usdc_per_hour.toFixed(2)} USDC/hr</span>
                    </div>
                    <span className="text-xs">→</span>
                    <div className="flex items-center">
                      <span className="text-xs font-semibold text-green-700">Earn: {Math.floor(cafe.usdc_per_hour / 2)} AntiCoins/hr</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center mt-3 text-gray-600 text-sm">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{cafe.location}</span>
              </div>
              
              <div className="flex items-center mt-1 text-gray-600 text-sm">
                <Clock className="h-3 w-3 mr-1" />
                <span>Today: {cafe.hours?.weekdays || 'Not specified'}</span>
              </div>
              
              {/* Workspace Amenities */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Workspace Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {cafe.amenities && Array.isArray(cafe.amenities) && cafe.amenities.includes('wifi') && (
                    <div className="flex items-center px-2 py-1 bg-antiapp-peach/30 rounded-full">
                      <Wifi className="h-3 w-3 mr-1" />
                      <span className="text-xs">WiFi</span>
                    </div>
                  )}
                  {cafe.amenities && Array.isArray(cafe.amenities) && cafe.amenities.includes('power') && (
                    <div className="flex items-center px-2 py-1 bg-antiapp-peach/30 rounded-full">
                      <Power className="h-3 w-3 mr-1" />
                      <span className="text-xs">Power</span>
                    </div>
                  )}
                  {cafe.amenities && Array.isArray(cafe.amenities) && cafe.amenities.includes('drinks') && (
                    <div className="flex items-center px-2 py-1 bg-antiapp-peach/30 rounded-full">
                      <Coffee className="h-3 w-3 mr-1" />
                      <span className="text-xs">Drinks</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500 line-clamp-1">{cafe.description}</p>
                <ArrowRight className="h-4 w-4 text-antiapp-purple" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default CafeList;
