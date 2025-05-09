
import React, { useEffect, useRef, useState } from 'react';
import { CafeType } from '@/types/cafe';
import { Link } from 'react-router-dom';

interface CafeMapProps {
  cafes: CafeType[];
}

// Google Maps type definitions
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const CafeMap = ({ cafes }: CafeMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any | null>(null);
  const [infoWindow, setInfoWindow] = useState<any | null>(null);

  useEffect(() => {
    // Load the Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        setMapLoaded(true);
      };
      
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
        delete window.initMap;
      };
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    // Initialize the map
    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 52.52, lng: 13.405 }, // Default center (Berlin)
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });
    
    setMap(newMap);
    setInfoWindow(new window.google.maps.InfoWindow());
    
  }, [mapLoaded]);

  useEffect(() => {
    if (!map || !infoWindow || !cafes.length) return;

    // Clear existing markers
    const markers: any[] = [];
    
    // Set bounds to fit all cafes
    const bounds = new window.google.maps.LatLngBounds();
    
    // Convert cafe locations to coordinates
    cafes.forEach(cafe => {
      // For this example, we're extracting coordinates from the location string
      // In a real app, you should store lat/lng in your database
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: cafe.location }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const position = results[0].geometry.location;
          
          // Create marker
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: cafe.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#6366f1',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 10,
            }
          });
          
          markers.push(marker);
          
          // Create info window content
          const content = `
            <div class="p-2">
              <h3 class="font-semibold text-base">${cafe.name}</h3>
              <p class="text-sm text-gray-600">${cafe.location}</p>
              <a href="/cafe/${cafe.id}" class="text-blue-500 text-sm">View Details</a>
            </div>
          `;
          
          // Add click listener to marker
          marker.addListener('click', () => {
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });
          
          // Extend bounds to include this marker
          bounds.extend(position);
        }
      });
    });
    
    // Fit map to all markers
    setTimeout(() => {
      if (cafes.length > 1) {
        map.fitBounds(bounds);
      } else if (cafes.length === 1) {
        // If only one cafe, set zoom level manually
        map.setZoom(14);
      }
    }, 1000); // Delay to allow geocoding to complete

    // Cleanup function to remove markers when component unmounts or cafes change
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
    
  }, [map, infoWindow, cafes]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200">
      {!mapLoaded && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="animate-spin h-8 w-8 border-t-2 border-antiapp-purple rounded-full"></div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default CafeMap;
