import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import events from '../components/eventsData';
import { useAntiCoinBalance } from '../hooks/useAntiCoinBalance';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const event = events.find(e => e.id === Number(id));
  const [registering, setRegistering] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { balance, loading: balanceLoading, fetchBalance } = useAntiCoinBalance(user?.id);

  useEffect(() => {
    checkRegistrationStatus();
  }, [user, event]);

  const checkRegistrationStatus = async () => {
    if (!user || !event) return;
    
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', String(event.id))
        .maybeSingle();
      
      if (error) throw error;
      setAlreadyRegistered(!!data);
    } catch (error) {
      console.error('Failed to check registration status:', error);
    }
  };

  if (!event) {
    return (
      <PageLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-antiapp-purple mb-4">Event Not Found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </PageLayout>
    );
  }

  const handleOpenModal = () => {
    if (!user) {
      toast.error('You must be signed in to register for events.');
      return;
    }
    
    if (alreadyRegistered) {
      toast.info('You are already registered for this event.');
      return;
    }
    
    fetchBalance();
    setShowConfirmModal(true);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setRegistering(false);
  };

  const handleConfirm = async () => {
    if (registering) return; 
    
    if (!user) {
      toast.error('You must be signed in to register for events.');
      setShowConfirmModal(false);
      return;
    }
    
    if (balanceLoading) {
      toast.error("Still loading your balance. Please try again in a moment.");
      return;
    }
    
    if (balance === null) {
      toast.error("Could not retrieve your balance. Please refresh the page and try again.");
      return;
    }
    
    if (typeof balance === 'number' && balance < event.price) {
      toast.error(`Insufficient AntiCoins. You need ${event.price} AntiCoins, but have ${balance}.`);
      return;
    }
    
    setRegistering(true);
    
    try {
      // 1. First check if already registered (prevent race conditions)
      const { data: existingReg, error: checkError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', String(event.id)) // Ensure consistent string format
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking registration:', checkError);
        throw new Error('Failed to verify existing registration');
      }
      
      if (existingReg) {
        setAlreadyRegistered(true);
        toast.info('You are already registered for this event.');
        setShowConfirmModal(false);
        setRegistering(false);
        return;
      }

      // 2. Create registration record FIRST to ensure we don't double-charge the user
      // Only deduct balance if registration succeeds
      const { error: regErr } = await supabase
      .from('event_registrations')
      .insert([{
        user_id: user.id,
        event_id: String(event.id),
        registered_at: new Date().toISOString()
        // Using registered_at which is the correct column name in the database schema
      }]);
      
      if (regErr) {
        console.error('Registration insert failed:', regErr);
        throw new Error(`Couldn't create registration: ${regErr.message}`);
      }
      
      // Now deduct balance - if this fails, it's okay as user is already registered
      // which is better than charging them but not registering them
      const newBalance = Number(balance) - event.price;
      const { error: balanceErr } = await supabase
        .from('profiles')
        .update({ anti_coin_balance: newBalance })
        .eq('id', user.id);
        
      if (balanceErr) {
        console.error('Balance update failed:', balanceErr);
        toast.error('Registration completed but balance update failed. Please report this to support.');
        // Don't throw error here - we want to complete the registration flow
      }
      
      // If we got here, registration was successful
      setAlreadyRegistered(true);
      setRegistrationSuccess(true);
      
      // Refresh the balance after successful registration
      fetchBalance();
      
      toast.success(`Successfully registered for ${event.title}!`);
      
      // Close modal after success
      setShowConfirmModal(false);
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle specific known errors
      if (error.message?.includes('insufficient')) {
        toast.error('Insufficient AntiCoins to complete this registration.');
      } else if (error.message?.includes('already registered')) {
        toast.info('You are already registered for this event.');
        setAlreadyRegistered(true);
      } else {
        toast.error(`Registration failed: ${error.message || 'Please try again'}`);
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <PageLayout customBackUrl="/cafes">
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="overflow-hidden rounded-lg shadow-lg bg-white">
            <div className="relative">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-80 object-cover"
              />
            </div>
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
                disabled={registering || alreadyRegistered || balanceLoading}
              >
                {!user ? (
                  <>Sign in to Register ({event.price} <span className="font-bold">¢</span>)</>
                ) : alreadyRegistered ? (
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
            </div>
          </div>
        </div>
      </div>

      <AlertDialog 
        open={showConfirmModal} 
        onOpenChange={(open) => {
          if (!open) {
            handleCancel();
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg font-bold text-antiapp-purple">Confirm Registration</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You are about to register for <span className="font-semibold">"{event.title}"</span>.<br/>
              This will cost <span className="font-semibold">{event.price} AntiCoins</span>.<br/>
              Your current balance is: <span className="font-semibold">{balanceLoading ? 'Loading...' : (typeof balance === 'number' ? `${balance} AntiCoins` : 'Unknown')}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 text-center">
            Do you want to proceed with this registration?
          </div>
          <AlertDialogFooter className="flex gap-3 sm:gap-4">
            <AlertDialogCancel 
              onClick={handleCancel} 
              disabled={registering}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300"
            >
              Cancel
            </AlertDialogCancel>
            <button 
              onClick={handleConfirm}
              disabled={registering || balanceLoading || balance === null || (typeof balance === 'number' && balance < event.price)}
              className="flex-1 justify-center flex items-center px-4 py-2 rounded-md font-medium text-white
                bg-antiapp-purple hover:bg-antiapp-purple/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {registering ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Confirm Registration'
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}