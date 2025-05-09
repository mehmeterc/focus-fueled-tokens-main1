import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import events, { Event } from '../components/eventsData';
import PageLayout from '../components/PageLayout';

export default function RegisteredEvents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      toast.error('Please log in to view your registered events');
      navigate('/login');
      return;
    }

    const fetchRegisteredEvents = async () => {
      setLoading(true);
      try {
        // Get all event registrations for the current user
        const { data, error } = await supabase
          .from('event_registrations')
          .select('event_id')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data && data.length > 0) {
          // Convert string IDs to numbers and find matching events
          const eventIds = data.map(reg => parseInt(reg.event_id));
          const userEvents = events.filter(event => eventIds.includes(event.id));
          setRegisteredEvents(userEvents);
        } else {
          setRegisteredEvents([]);
        }
      } catch (error: any) {
        console.error('Error fetching registered events:', error);
        toast.error(`Failed to load your registered events: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredEvents();
  }, [user, navigate]);

  const handleCancelRegistration = async (eventId: number) => {
    if (!user) return;

    try {
      // Delete the registration
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId.toString());

      if (error) throw error;

      // Update the UI
      setRegisteredEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Event registration cancelled successfully');

      // Refund AntiCoins (in a real app, this would be a transaction)
      const event = events.find(e => e.id === eventId);
      if (event) {
        const { error: refundError } = await supabase
          .from('profiles')
          .select('anti_coin_balance')
          .eq('id', user.id)
          .single();

        if (!refundError) {
          // Add the event price back to the user's balance
          await supabase
            .from('profiles')
            .update({ 
              anti_coin_balance: supabase.rpc('increment', { 
                amount: event.price 
              }) 
            })
            .eq('id', user.id);
        }
      }
    } catch (error: any) {
      console.error('Error cancelling registration:', error);
      toast.error(`Failed to cancel registration: ${error.message}`);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-antiapp-purple mb-6">My Registered Events</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-antiapp-purple"></div>
          </div>
        ) : registeredEvents.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">You haven't registered for any events yet</h2>
            <p className="text-gray-500 mb-6">Browse our upcoming events and register to participate!</p>
            <Button 
              onClick={() => navigate('/cafes')}
              className="bg-antiapp-purple hover:bg-antiapp-purple/90"
            >
              Explore Events
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registeredEvents.map(event => (
              <div 
                key={event.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden border border-antiapp-purple/10 flex flex-col"
              >
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="h-48 w-full object-cover"
                />
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-antiapp-teal/10 text-antiapp-teal px-2 py-0.5 rounded text-xs font-semibold">
                      {event.date} {event.time}
                    </span>
                    <span className="bg-antiapp-purple/10 text-antiapp-purple px-2 py-0.5 rounded text-xs font-semibold">
                      {event.price} <span className="font-bold">¢</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-antiapp-purple mb-1">{event.title}</h3>
                  <div className="text-xs text-gray-500 mb-2">By {event.organizer} @ {event.location}</div>
                  <p className="text-sm text-gray-600 mb-4 flex-1">{event.description}</p>
                  
                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="outline"
                      className="flex-1 border-antiapp-purple text-antiapp-purple hover:bg-antiapp-purple/10"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleCancelRegistration(event.id)}
                    >
                      Cancel Registration
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
