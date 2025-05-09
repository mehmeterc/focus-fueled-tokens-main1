import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import events from '../components/eventsData';
import { useAntiCoinBalance } from '../hooks/useAntiCoinBalance';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const event = events.find(e => e.id === Number(id));
  const [registering, setRegistering] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const { balance, loading: balanceLoading } = useAntiCoinBalance(user?.id);

  useEffect(() => {
    // If the modal is closed, ensure registering is false
    if (!showConfirmModal) {
      setRegistering(false);
    }
  }, [showConfirmModal]);

  // Check if already registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (!user || !event) return;
      const { data, error } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', event.id)
        .maybeSingle();
      if (data) setAlreadyRegistered(true);
      else setAlreadyRegistered(false);
    };
    checkRegistration();
  }, [user, event]);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-antiapp-purple mb-4">Event Not Found</h1>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const handleOpenModal = () => {
    setRegistering(true); // Show loading state on button
    setShowConfirmModal(true);
  };

  const handleRegistrationCancel = () => {
    setRegistering(false);
    setShowConfirmModal(false);
  };

  const handleRegistrationConfirm = async () => {
    if (!user) {
      toast.error('You must be signed in to register.');
      setRegistering(false);
      setShowConfirmModal(false);
      return;
    }
    
    if (balanceLoading) {
      toast.error("Still loading your AntiCoin balance. Please try again in a moment.");
      setRegistering(false);
      setShowConfirmModal(false);
      return;
    }
    
    if (balance === null) {
      toast.error("Could not retrieve your AntiCoin balance. Please try again.");
      setRegistering(false);
      setShowConfirmModal(false);
      return;
    }
    
    if (typeof balance === 'number' && balance < event.price) {
      toast.error('Insufficient AntiCoins to register for this event.');
      setRegistering(false);
      setShowConfirmModal(false);
      return;
    }
    
    // Keep modal open until registration is complete to show processing state
    // Check again if already registered (race condition prevention)
    try {
      const { data: existing, error: checkErr } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', event.id.toString())
        .maybeSingle();

      if (checkErr) throw checkErr;

      if (existing) {
        toast.info('You are already registered for this event.');
        setAlreadyRegistered(true);
        setShowConfirmModal(false);
        setRegistering(false);
        return;
      }

      // Deduct AntiCoins (should use a transaction ideally)
      const newBalance = Number(balance) - event.price;
      const { error: balanceErr } = await supabase
        .from('profiles')
        .update({ anti_coin_balance: newBalance })
        .eq('id', user.id);

      if (balanceErr) throw balanceErr;

      // Create registration
      const { error: regErr } = await supabase
        .from('event_registrations')
        .insert([{ 
          user_id: user.id, 
          event_id: event.id.toString(), 
          registration_date: new Date().toISOString() 
        }]);

      if (regErr) throw regErr;

      // Success!
      toast.success(`Successfully registered for ${event.title}! -${event.price} AntiCoins`);
      setAlreadyRegistered(true);
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(`Registration failed: ${error.message || 'Please try again.'}`);
    } finally {
      setShowConfirmModal(false);
      setRegistering(false);
    }
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
              className="w-full bg-antiapp-purple hover:bg-antiapp-purple/90 text-white font-bold py-3"
              onClick={handleOpenModal}
              disabled={registering || alreadyRegistered || !user || balanceLoading}
            >
              {alreadyRegistered ? (
                'Already Registered'
              ) : registering ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>Register ({event.price} <span className="font-bold">¢</span>)</>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              {typeof balance === 'number' && balance < event.price && 'Insufficient AntiCoins!'}
              {balanceLoading && 'Loading your balance...'}
            </p>

            <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full bg-antiapp-purple hover:bg-antiapp-teal text-white font-bold"
                  onClick={handleOpenModal}
                  disabled={registering || alreadyRegistered || !user}
                >
                  {alreadyRegistered ? 'Registered' : (!user ? "Sign in to Register" : (registering && !showConfirmModal ? 'Processing...' : `Register for ${event.price} AntiCoins`))}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Registration</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to register for "{event.title}". This will cost {event.price} AntiCoins.
                    Your current balance is: {balanceLoading ? 'Loading...' : (typeof balance === 'number' ? `${balance} AntiCoins` : 'Unknown')}.
                    Do you want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleRegistrationCancel} disabled={registering}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleRegistrationConfirm} 
                    disabled={registering || balanceLoading || balance === null || (typeof balance === 'number' && balance < event.price)}
                    className="bg-antiapp-purple hover:bg-antiapp-purple/90"
                  >
                    {registering ? 'Processing...' : 'Confirm Registration'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
        </div>
      </div>
    </div>
  );
}
