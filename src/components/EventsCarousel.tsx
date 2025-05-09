import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import events from './eventsData';

export default function EventsCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const navigate = useNavigate();

  const handleRegister = (event: typeof events[0]) => {
    toast.success(`Registered for ${event.title}!  -${event.price} AntiCoins`);
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-extrabold text-antiapp-purple mb-4 text-center tracking-tight">Events & Happenings</h2>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {events.map(event => (
            <div
              key={event.id}
              className="min-w-[320px] max-w-xs bg-white rounded-2xl shadow-xl border border-antiapp-purple/10 flex flex-col overflow-hidden relative cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate(`/events/${event.id}`)}
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
    </section>
  );
}
