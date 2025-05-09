
import { Link } from 'react-router-dom';
import { CafeType } from '@/types/cafe';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Wifi, Power, Coffee } from 'lucide-react';

interface CafeListProps {
  cafes: CafeType[];
}

const CafeList = ({ cafes }: CafeListProps) => {
  if (cafes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">No cafes match your search criteria.</p>
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
            </div>
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold text-antiapp-purple">{cafe.name}</h3>

              {/* USDC Rate and Commission */}
              {typeof cafe.usdc_per_hour === 'number' && cafe.usdc_per_hour !== null && (
                <div className="mt-1 text-gray-700 text-sm">
                  <span className="font-semibold">USDC Rate:</span> {cafe.usdc_per_hour.toFixed(2)} USDC/hr
                  <span className="mx-2">|</span>
                  <span className="font-semibold">Total (incl. 10%):</span> {(cafe.usdc_per_hour * 1.1).toFixed(2)} USDC/hr
                </div>
              )}

              <div className="flex items-center mt-2 text-gray-600 text-sm">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{cafe.location}</span>
              </div>
              
              <div className="flex items-center mt-1 text-gray-600 text-sm">
                <Clock className="h-3 w-3 mr-1" />
                <span>Today: {cafe.hours?.weekdays || 'Not specified'}</span>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
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
              
              <p className="mt-3 text-sm text-gray-500 line-clamp-2">{cafe.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default CafeList;
