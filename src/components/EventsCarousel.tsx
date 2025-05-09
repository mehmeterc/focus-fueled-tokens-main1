import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const events = [
  {
    id: 1,
    title: 'After Party by Jägermeister',
    organizer: 'Jägermeister',
    date: '12.05.2025',
    time: '22:00',
    location: 'Arena Berlin',
    price: 4,
    image: 'https://images.unsplash.com/photo-1515168833906-d2a3b82b0a97?auto=format&fit=crop&w=600&q=80',
    description: 'Exclusive after party with live DJs, neon lights, and drinks. Join the fun!'
  },
  {
    id: 2,
    title: 'Berlin Coffee Festival',
    organizer: 'Berlin Cafes',
    date: '20.05.2025',
    time: '10:00',
    location: 'Kulturbrauerei',
    price: 2,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'Taste the best coffee in the city and meet local roasters. Free samples!'
  },
  {
    id: 3,
    title: 'Vegan Brunch Meetup',
    organizer: 'Green Eats',
    date: '25.05.2025',
    time: '12:00',
    location: 'Cafe Morgenrot',
    price: 1,
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    description: 'A friendly vegan brunch for all. Bring your friends!'
  },
  {
    id: 4,
    title: 'Tech for Good Hackathon',
    organizer: 'Code Berlin',
    date: '18.05.2025',
    time: '09:00',
    location: 'Factory Berlin',
    price: 3,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    description: 'Hack for social impact! Prizes, mentors, and networking.'
  },
  {
    id: 5,
    title: 'Sunset Yoga & Chill',
    organizer: 'Urban Zen',
    date: '15.05.2025',
    time: '19:30',
    location: 'Tempelhofer Feld',
    price: 1,
    image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80',
    description: 'Outdoor yoga at sunset. Mats provided. All levels welcome.'
  },
  {
    id: 6,
    title: 'Indie Music Night',
    organizer: 'Sound Collective',
    date: '22.05.2025',
    time: '20:00',
    location: 'Cassiopeia',
    price: 2,
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    description: 'Live indie bands, craft beer, and a great crowd.'
  }
];

export default function EventsCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true });

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
              className="min-w-[320px] max-w-xs bg-white rounded-2xl shadow-xl border border-antiapp-purple/10 flex flex-col overflow-hidden relative"
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
                  onClick={() => handleRegister(event)}
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
