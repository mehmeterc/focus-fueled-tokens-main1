import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import events from '@/components/eventsData';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const event = events.find(e => e.id === Number(id));
  const [registering, setRegistering] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-antiapp-purple mb-4">Event Not Found</h1>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const handleRegister = () => {
    setRegistering(true);
    // Registration logic will be handled in the carousel/modal for now
    setTimeout(() => setRegistering(false), 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button className="mb-4 text-antiapp-purple hover:text-antiapp-teal font-medium flex items-center gap-1" onClick={() => navigate(-1)}>
          &#8592; Back
        </button>
        <div className="bg-white rounded-2xl shadow-xl border border-antiapp-purple/10 overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-64 object-cover" />
          <div className="p-6">
            <h1 className="text-3xl font-bold text-antiapp-purple mb-2">{event.title}</h1>
            <div className="flex items-center gap-4 mb-2">
              <span className="bg-antiapp-teal/10 text-antiapp-teal px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                {event.date} {event.time}
              </span>
              <span className="bg-antiapp-purple/10 text-antiapp-purple px-2 py-0.5 rounded text-xs font-semibold">
                {event.price} <span className="font-bold">¢</span>
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-4">By {event.organizer} @ {event.location}</div>
            <div className="text-lg text-gray-800 mb-6">{event.description}</div>
            <Button
              className="w-full bg-antiapp-purple hover:bg-antiapp-teal text-white font-bold"
              onClick={handleRegister}
              disabled={registering}
            >
              {registering ? 'Registering...' : `Register for ${event.price} AntiCoins`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
