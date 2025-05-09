import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import events, { Event } from './eventsData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useAntiCoinBalance } from '../hooks/useAntiCoinBalance';

export default function EventsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user
  const { balance, loading, fetchBalance } = useAntiCoinBalance(user?.id); // Get user's AntiCoin balance
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set());
  const [loadingRegistration, setLoadingRegistration] = useState<Record<number, boolean>>({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const handleRegister = async (event: Event) => {
    if (!user) {
      toast.error('Please log in to register for events.');
      navigate('/auth'); // Redirect to auth page if not logged in
      return;
    }

    // Check if balance is still loading
    if (loading) {
      toast.info('Please wait while we check your balance...');
      return;
    }

    if (typeof balance !== 'number') {
      toast.error('Unable to retrieve your balance. Please refresh and try again.');
      return;
    }

    if (balance < event.price) {
      toast.error(`Not enough AntiCoins to register. You need ${event.price} AntiCoins.`);
      return;
    }

    // Prevent double-clicking
    if (loadingRegistration[event.id]) {
      return;
    }

    setLoadingRegistration(prev => ({ ...prev, [event.id]: true }));

    try {
      // Check if already registered
      const { data: existingRegistration, error: checkError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', event.id.toString())
        .maybeSingle();

      if (checkError) {
        console.error('Error checking registration:', checkError);
        throw new Error(`Unable to check registration status: ${checkError.message}`);
      }

      if (existingRegistration) {
        toast.info('You are already registered for this event!');
        setRegisteredEventIds(prev => new Set([...prev, event.id]));
        return;
      }

      // Deduct AntiCoins (This should ideally be a Supabase function for atomicity)
      const newBalance = balance - event.price;
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ anti_coin_balance: newBalance })
        .eq('id', user.id);

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
        throw new Error(`Failed to update your AntiCoin balance: ${balanceError.message}`);
      }

      // Create registration
      const { error: registrationError } = await supabase
        .from('event_registrations')
        .insert([{ 
          user_id: user.id, 
          event_id: event.id.toString(), 
          registration_date: new Date().toISOString() 
        }]);

      if (registrationError) {
        console.error('Error creating registration:', registrationError);
        throw new Error(`Registration failed: ${registrationError.message}`);
      }

      // Success!
      toast.success(`Successfully registered for ${event.title}! -${event.price} AntiCoins`);
      setRegisteredEventIds(prev => new Set([...prev, event.id]));
      
      // Refresh balance after successful registration
      fetchBalance();

      // Optionally navigate to the event details page
      // navigate(`/events/${event.id}`);

    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      
      // If we failed after updating the balance but before completing registration,
      // we should probably revert the balance change in a real app
      fetchBalance();
    } finally {
      setLoadingRegistration(prev => ({ ...prev, [event.id]: false }));
    }
  };

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Fetch existing registrations on mount
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching existing registrations:', error);
      } else if (data) {
        // Convert string IDs from database to numbers and add to Set
        const eventIds = data.map(r => parseInt(r.event_id));
        setRegisteredEventIds(new Set(eventIds));
      }
    };
    fetchRegistrations();
  }, [user]);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-extrabold text-antiapp-purple mb-4 text-center tracking-tight">Events & Happenings</h2>
      <div className="relative">
        {/* Carousel Arrows */}
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-antiapp-teal text-antiapp-purple hover:text-white rounded-full p-2 shadow transition disabled:opacity-30"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous slide"
          style={{ display: events.length > 1 ? undefined : 'none' }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-antiapp-teal text-antiapp-purple hover:text-white rounded-full p-2 shadow transition disabled:opacity-30"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Next slide"
          style={{ display: events.length > 1 ? undefined : 'none' }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {events.map((event, idx) => (
              <div
                key={event.id}
                className="min-w-[320px] max-w-xs bg-white rounded-2xl shadow-xl border border-antiapp-purple/10 flex flex-col overflow-hidden relative cursor-pointer transition-transform hover:scale-105"
                onClick={() => navigate(`/events/${event.id}`)}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${event.title}`}
                onKeyDown={e => { if (e.key === 'Enter') navigate(`/events/${event.id}`); }}
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-40 w-full object-cover"
                  style={{ filter: 'brightness(0.92)' }}
                />
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-antiapp-teal/10 text-antiapp-teal px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                      {event.date} {event.time}
                    </span>
                    <span className="bg-antiapp-purple/10 text-antiapp-purple px-2 py-0.5 rounded text-xs font-semibold">
                      {event.price} <span className="font-bold">¢</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-antiapp-purple mb-1">{event.title}</h3>
                  <div className="text-xs text-gray-500 mb-2">By {event.organizer} @ {event.location}</div>
                  <p className="text-sm text-gray-600 mb-3 flex-1 line-clamp-3">{event.description}</p>
                  <div className="flex flex-col gap-2 mt-4">
                    <Button
                      variant="ghost"
                      className="w-full py-2 border border-antiapp-purple text-antiapp-purple hover:bg-antiapp-purple/5"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Pagination Dots */}
        <div className="flex justify-center mt-4 gap-2">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full transition border-2 ${selectedIndex === idx ? 'bg-antiapp-teal border-antiapp-teal' : 'bg-gray-200 border-gray-300'} focus:outline-none`}
              onClick={() => scrollTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

