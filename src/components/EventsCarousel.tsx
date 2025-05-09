import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import events from './eventsData';

export default function EventsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (event: typeof events[0]) => {
    toast.success(`Registered for ${event.title}!  -${event.price} AntiCoins`);
  };

  // Embla navigation helpers
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((idx: number) => emblaApi && emblaApi.scrollTo(idx), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    emblaApi.on('select', onSelect);
    onSelect();
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi]);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-extrabold text-antiapp-purple mb-4 text-center tracking-tight">Events & Happenings</h2>
      <div className="relative">
        {/* Carousel viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {events.map((event, idx) => (
              <div
                key={event.id}
                className="min-w-[85vw] sm:min-w-[320px] max-w-xs bg-white rounded-2xl shadow-xl border border-antiapp-purple/10 flex flex-col overflow-hidden relative cursor-pointer transition-transform hover:scale-105"
                onClick={() => navigate(`/events/${event.id}`)}
                tabIndex={0}
                role="button"
                aria-label={`View event: ${event.title}`}
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
                  <div className="text-sm text-gray-700 mb-4 flex-1">{event.description}</div>
                  <Button
                    className="w-full bg-antiapp-purple hover:bg-antiapp-teal text-white font-bold mt-auto"
                    onClick={e => { e.stopPropagation(); handleRegister(event); }}
                  >
                    Register
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Navigation Arrows */}
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-antiapp-teal/80 hover:text-white transition disabled:opacity-40"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous event"
          style={{ minWidth: 36 }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-antiapp-teal/80 hover:text-white transition disabled:opacity-40"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Next event"
          style={{ minWidth: 36 }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        </button>
        {/* Pagination Dots */}
        <div className="flex justify-center mt-3 gap-2">
          {events.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full ${selectedIndex === idx ? 'bg-antiapp-teal' : 'bg-gray-300'} transition border-2 border-white focus:outline-none`}
              style={{ minWidth: 12 }}
              onClick={() => scrollTo(idx)}
              aria-label={`Go to event ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

