import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; // Corrected path
import { toast } from 'sonner';
import { Timer, Play, Pause, StopCircle, Coffee, Coins, Clock, CheckCircle } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

// Solana & App-specific Hooks/Context
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useUsdcPayment } from '@/hooks/useUsdcPayment';
import { useAntiCoinContext } from '@/context/AntiCoinContext';
import { USDC_DECIMALS, DEMO_CAFE_VIRTUAL_HOURLY_RATE_USDC, ANTICOIN_USDC_EQUIVALENCE } from '@/config/solanaConfig';
// PublicKey might be needed for explicit type checks later, but hooks abstract direct use mostly.
// import { PublicKey } from '@solana/web3.js';

export default function FocusTimer() {
  const { cafeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Solana Wallet, Payment, and AntiCoin Context Hooks
  const { publicKey: solanaWalletPublicKey, connected: isSolanaWalletConnected, connect: connectSolanaWallet, connecting: isSolanaWalletConnecting } = useWallet();
  const usdcPayment = useUsdcPayment();
  const antiCoinContext = useAntiCoinContext();
  const { setVisible: setWalletModalVisible } = useWalletModal();

  const [cafe, setCafe] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionTime, setSessionTime] = useState(0); // in seconds
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [displayedRatePerHour, setDisplayedRatePerHour] = useState<number>(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionCostInUsdc, setSessionCostInUsdc] = useState(0);
  const [checkingForSession, setCheckingForSession] = useState(true); // Prevent flash of "No Workspace Selected"
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Effect to sync local earnedCoins state with AntiCoinContext for UI display
  useEffect(() => {
    if (antiCoinContext.isMining) {
      setEarnedCoins(antiCoinContext.currentReward);
    } else if (checkedIn && antiCoinContext.currentSession) {
      // If checked in but paused, show the current reward from the session
      setEarnedCoins(antiCoinContext.currentReward || 0);
    } else if (!checkedIn) {
      setEarnedCoins(0); // Reset when not checked in
    }
  }, [antiCoinContext.currentReward, antiCoinContext.isMining, checkedIn, antiCoinContext.currentSession]);

  // Effect to calculate and set the displayed AntiCoin earning rate
  useEffect(() => {
    if (cafe) {
      const cafeUsdcRate = cafe.usdc_per_hour > 0 ? cafe.usdc_per_hour : DEMO_CAFE_VIRTUAL_HOURLY_RATE_USDC;
      const effectiveCoinsPerHour = cafeUsdcRate * ANTICOIN_USDC_EQUIVALENCE;
      setDisplayedRatePerHour(effectiveCoinsPerHour);
    }
  }, [cafe]);

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to use the Focus Timer');
      navigate('/login');
      return;
    }
    
    // Check if user has an active session and redirect to it
    const checkForActiveSession = async () => {
      try {
        setCheckingForSession(true); // Start checking - hide main content while checking
        
        // Don't redirect if already on a specific cafe timer
        if (cafeId) {
          setCheckingForSession(false);
          return;
        }
        
        const { data: sessionData, error } = await supabase
          .from('check_ins')
          .select('cafe_id')
          .eq('user_id', user.id)
          .is('check_out_time', null)
          .single();
          
        if (sessionData && !error) {
          // User has an active session, redirect to it
          console.log('Active session found, redirecting to check-in page');
          // Don't set checkingForSession to false - keep loading state during navigation
          navigate(`/checkin/${sessionData.cafe_id}`);
          return;
        }
        
        // Only if no active session is found
        setCheckingForSession(false);
      } catch (err) {
        console.error('Error checking for active session:', err);
        setCheckingForSession(false); // Error case - show content
      }
    };
    
    checkForActiveSession();

    // Fetch cafe details and check-in status
    const fetchCafeAndStatus = async () => {
      try {
        setLoading(true);
        
        // Fetch cafe details
        if (cafeId) {
          const { data: cafeData, error: cafeError } = await supabase
            .from('cafes')
            .select('*')
            .eq('id', cafeId)
            .single();
            
          if (cafeError) throw cafeError;
          setCafe(cafeData);
          
          // Check if user is already checked in
          const { data: sessionData, error: sessionError } = await supabase
            .from('focus_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('cafe_id', cafeId)
            .is('end_time', null) // Active session has no end time
            .single();
            
          if (sessionData && !sessionError) {
            setCheckedIn(true);
            startTimeRef.current = new Date(sessionData.start_time).getTime();
            // Calculate elapsed time
            const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setSessionTime(elapsedSeconds);
            // Auto-start timer
            startTimer();
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load workspace data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCafeAndStatus();
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, cafeId, navigate]);
  
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      
      // Use existing start time or set new one
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - (sessionTime * 1000);
      }
      
      intervalRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
        setSessionTime(elapsedSeconds);
        // EarnedCoins calculation is now handled by AntiCoinContext and synced via useEffect
      }, 1000);
    }
  };
  
  const pauseTimer = () => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      // Keep the current sessionTime value
    }
  };
  
  const handleCheckIn = async () => {
    if (!user || !cafeId) return;

    // Check Solana wallet connection
    if (!isSolanaWalletConnected || !solanaWalletPublicKey) {
      toast.error('Please connect your Solana wallet to check in.');
      // Optionally, trigger wallet modal if you import and use useWalletModal():
      // const { setVisible } = useWalletModal(); setVisible(true);
      return;
    }

    if (!cafe) { // Ensure cafe data is loaded before attempting to use it
      toast.error('Cafe data not loaded yet. Please wait or refresh.');
      return;
    }

    
    try {
      setLoading(true);
      
      // Create a focus session record
      const { error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          cafe_id: cafeId,
          start_time: new Date().toISOString(),
          status: 'active',
          solana_wallet_address: solanaWalletPublicKey.toBase58() // Store wallet address
        })
        .select() // Fetch the inserted row, e.g., if you need its ID later
        .single();
        
      if (error) throw error;
      
      // Start AntiCoin mining session
      const cafeInfoForMining = {
        id: cafe.id,
        name: cafe.name,
        usdcRatePerHour: cafe.usdc_per_hour || 0, // Ensure it's a number, default to 0 if null/undefined
      };
      const miningStarted = antiCoinContext.startMiningSession(cafeInfoForMining);

      if (miningStarted) {
        setCheckedIn(true);
        startTimeRef.current = Date.now(); // Or use start_time from sessionInsertData for more precision
        setSessionTime(0);
        // antiCoinContext.isMining will be true now, so earnedCoins will update via effect or UI calculation
        startTimer(); // Your existing timer logic to update UI
        
        toast.success('Checked in successfully! Focus timer & AntiCoin mining started.');
      } else {
        // Mining didn't start, could be due to an existing session. The hook provides its own toast.
        // Potentially undo the Supabase check-in if starting mining is critical here.
        // For now, we'll log a warning and let the Supabase check-in stand.
        console.warn("Supabase check-in recorded, but AntiCoin mining session did not initiate (may already be active or wallet issue).");
        // To ensure UI consistency if mining is absolutely required for check-in:
        // if (sessionInsertData) { // 'sessionInsertData' would be 'data' from the supabase insert if .select().single() used
        //    await supabase.from('focus_sessions').delete().eq('id', sessionInsertData.id);
        //    toast.error("Failed to start AntiCoin mining. Check-in reverted. Please try again or check wallet.");
        //    setLoading(false); // Ensure loading state is reset
        //    return; // Exit handleCheckIn
        // }
        // If allowing check-in without mining starting (e.g. user has another session active elsewhere)
        setCheckedIn(true); // Still reflect Supabase check-in in UI for this cafe
        startTimeRef.current = Date.now(); 
        setSessionTime(0);
        startTimer();
        // The useAntiCoinMining hook should have already displayed a toast if it couldn't start.
        // Add a specific one here if you want to reinforce it from FocusTimer's perspective.
        // toast.warning('Checked in for focus time, but AntiCoin mining has an issue (e.g., already active elsewhere).');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Must be async to properly await the endMiningSession Promise
  const handleCheckOut = async () => {
    if (!user || !cafeId || !cafe) {
      toast.error('User, Cafe ID, or Cafe details are missing. Cannot check out.');
      return;
    }

    // Wallet check - important if payment is due
    // if (!isSolanaWalletConnected || !solanaWalletPublicKey) {
    //   toast.error('Please connect your Solana wallet to check out and process any payments.');
    //   // Decide if you want to block checkout or allow it for free sessions / log unpaid
    //   // return; 
    // }

    setLoading(true);
    pauseTimer(); // Stop the UI timer updates

    // 1. End AntiCoin mining session - with proper async/await
    let actualEarnedAntiCoin = 0;
    let sessionEndTime = new Date().toISOString(); // Default to now

    try {
      // Properly await the Promise from endMiningSession
      const miningSessionResult = await antiCoinContext.endMiningSession();
      
      if (miningSessionResult && miningSessionResult.sessionEnded) {
        actualEarnedAntiCoin = miningSessionResult.reward;
        sessionEndTime = new Date(miningSessionResult.endTime).toISOString();
        console.log(`AntiCoin mining session ended. Calculated reward: ${actualEarnedAntiCoin}, End time: ${sessionEndTime}`);
        // The useAntiCoinMining hook already provides a success toast for ending the session.
      }
      let solanaPaymentSignature: string | null = null; // To store payment tx signature
      const finalSessionDurationSeconds = sessionTime; // Capture current sessionTime for calculations

      if (cafe.usdc_per_hour && cafe.usdc_per_hour > 0 && finalSessionDurationSeconds > 0) {
        const hoursFraction = finalSessionDurationSeconds / 3600;
        // Ensure USDC_DECIMALS is used for rounding to avoid floating point issues for currency
        setSessionCostInUsdc(parseFloat((hoursFraction * cafe.usdc_per_hour).toFixed(USDC_DECIMALS))); 
      }
      console.log(`Session duration: ${finalSessionDurationSeconds}s. Cafe rate: ${cafe.usdc_per_hour} USDC/hr. Calculated cost for payment: ${sessionCostInUsdc} USDC.`);

      // --- PAYMENT LOGIC --- 
      if (sessionCostInUsdc > 0) {
        if (!isSolanaWalletConnected || !solanaWalletPublicKey) {
          toast.error('Payment required, but Solana wallet is not connected. Session will be marked as unpaid. Please connect wallet and settle payment later if possible.');
          // We are not returning here, so Supabase record will be updated without payment.
          // Consider if you want to block checkout entirely: setLoading(false); return;
        } else {
          toast.info(`Processing payment of ${sessionCostInUsdc} USDC...`);
          try {
            const amountLamports = BigInt(Math.round(sessionCostInUsdc * Math.pow(10, USDC_DECIMALS)));
            if (amountLamports <= 0) {
                console.log('Calculated payment amount is zero or less. Skipping payment.');
            } else {
                const paymentSignature = await usdcPayment.handlePayment(
                    amountLamports,
                    `AntiApp Focus: ${cafe.name} - ${formatTime(finalSessionDurationSeconds)}`
                );

                if (paymentSignature) {
                    solanaPaymentSignature = paymentSignature;
                    toast.success(`Payment of ${sessionCostInUsdc} USDC successful!`);
                    console.log('USDC Payment successful, signature:', solanaPaymentSignature);
                } else {
                    toast.error(`USDC Payment attempt failed. Session will be logged as unpaid/pending payment.`);
                    console.error('USDC Payment attempt failed. No signature returned from handlePayment.');
                }
            }
          } catch (paymentError: any) {
            toast.error(`USDC Payment error: ${paymentError.message}. Session will be logged as unpaid/pending payment.`);
            console.error('USDC Payment processing error caught in handleCheckOut:', paymentError);
          }
        }
      } else {
        console.log('Session cost is 0 USDC or less. No payment required.');
      }

      // 3. Update the focus session in Supabase with end time, duration, earned coins, and payment details
      const updatePayload: { [key: string]: any } = {
        end_time: sessionEndTime, // From miningSessionResult or current time if fallback
        duration_seconds: finalSessionDurationSeconds,
        earned_coins: actualEarnedAntiCoin,
        status: 'completed',
        usdc_payment_signature: solanaPaymentSignature, // null if no payment or failed
      };

      if (solanaPaymentSignature && sessionCostInUsdc > 0) {
        updatePayload.usdc_amount_paid = sessionCostInUsdc;
        updatePayload.payment_status = 'paid';
      } else if (sessionCostInUsdc > 0 && (!solanaPaymentSignature || !isSolanaWalletConnected) ){
        updatePayload.usdc_amount_paid = 0; // Or sessionCostInUsdc to show amount due
        updatePayload.payment_status = 'pending_payment'; // Or 'failed', 'unpaid'
      } else {
        updatePayload.payment_status = 'not_applicable'; // For free sessions
      }

      const { error: sessionError } = await supabase
        .from('focus_sessions')
        .update(updatePayload)
        .eq('user_id', user.id)
        .eq('cafe_id', cafeId)
        .is('end_time', null); // Crucial: only update the currently active session for this user/cafe
        
      if (sessionError) {
        console.error('Error updating Supabase session:', sessionError);
        // Even if Supabase session update fails, we might still want to credit AntiCoins if they were calculated
        // But the session record itself will be inconsistent.
        toast.error(`Failed to update session details in Supabase: ${sessionError.message}.`);
        // Not throwing error here to allow AntiCoin crediting attempt below, but this is a partial failure.
      }
      
      // 4. Add actual earned AntiCoins to user's profile balance
      if (actualEarnedAntiCoin > 0) {
        // Get current balance
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('anti_coin_balance')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        const currentBalance = profileData?.anti_coin_balance || 0;
        const newBalance = currentBalance + actualEarnedAntiCoin; // Use actualEarnedAntiCoin from mining context
        
        // Update balance
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ anti_coin_balance: newBalance })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
      }
      
      // 5. Finalize UI and provide user feedback
      if (!sessionError) { // Only show full success if Supabase session update was okay
        toast.success(`Focus session completed! You earned ${actualEarnedAntiCoin} AntiCoins.`);
      }
      
      if (solanaPaymentSignature) {
        toast.info(`Payment of ${sessionCostInUsdc} USDC processed. Tx: ${solanaPaymentSignature.substring(0, 10)}...`);
      } else if (sessionCostInUsdc > 0 && isSolanaWalletConnected) {
        toast.warning('Session ended. Payment was attempted but not confirmed.');
      } else if (sessionCostInUsdc > 0 && !isSolanaWalletConnected) {
        toast.warning('Session ended. Payment required but wallet was not connected.');
      }

      setCheckedIn(false);
      setSessionTime(0);
      setEarnedCoins(0); // Resetting UI display; true balance is in profile/context
      startTimeRef.current = null;
      setIsRunning(false); // Ensure timer is visually stopped and can be restarted fresh
      
      // antiCoinContext.clearCurrentSession(); // Ensure mining context is reset if not handled by endMiningSession()
      
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error('Failed to complete session. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-8 px-4 max-w-md">
        <h1 className="text-3xl font-bold text-antiapp-purple mb-2 text-center">Focus Timer</h1>
        <p className="text-gray-600 text-center mb-8">Where Focus Becomes Currency</p>
        
        {loading || checkingForSession ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-antiapp-purple"></div>
          </div>
        ) : (
          <>
            {cafe ? (
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-antiapp-purple to-antiapp-teal pb-8">
                  <CardTitle className="text-white text-center">
                    <div className="flex flex-col items-center">
                      <Coffee className="h-8 w-8 mb-2" />
                      <span>{cafe.name}</span>
                      <span className="text-sm font-normal mt-1">{cafe.location}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0 -mt-6">
                  <div className="bg-white rounded-lg p-4 shadow-md mb-6">
                    <div className="flex items-center justify-center mb-3">
                      <Timer className="w-6 h-6 text-antiapp-purple mr-2" />
                      <span className="text-2xl font-bold text-antiapp-purple">
                        {formatTime(sessionTime)}
                      </span>
                    </div>
                    
                    <Progress value={(sessionTime % 3600) / 36} className="h-2 mb-2" />
                    
                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span>0:00</span>
                      <span>1:00:00</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-md">
                      <div className="flex items-center">
                        <Coins className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                          <div className="text-sm font-medium">Earned AntiCoins</div>
                          <div className="text-xs text-gray-500">
                            {displayedRatePerHour > 0 ? `${Math.floor(displayedRatePerHour)} AntiCoins/hr` : 'Rate not specified'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-yellow-600">{earnedCoins.toFixed(2)}</div> {/* Display with 2 decimal places if you allow fractional coins */}
                    </div>
                    {antiCoinContext.isMining && (
                      <div className="flex items-center justify-center text-xs text-green-600 mt-1 mb-3">
                        <div className="animate-ping h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>Mining AntiCoin...</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md"> {/* Changed bg from yellow to blue for a different section visual */} 
                      <div className="flex items-center">
                         <Clock className="h-5 w-5 text-blue-600 mr-2" /> 
                         <div> 
                           <div className="text-sm font-medium">USDC Cost / Hour</div> 
                           <div className="text-xs text-gray-500">
                             {cafe.usdc_per_hour ? `${cafe.usdc_per_hour.toFixed(2)} USDC/hr` : 'Free / Not set'}
                           </div>
                         </div>
                      </div>
                      {/* Optionally display current session cost if needed here */}
                    </div>

                    {isSolanaWalletConnected && solanaWalletPublicKey && (
                      <div className="text-xs text-center text-gray-500 mt-3 mb-3">
                        Wallet: {solanaWalletPublicKey.toBase58().substring(0, 4)}...{solanaWalletPublicKey.toBase58().slice(-4)}
                      </div>
                    )}
                  </div>
                  
                  {!checkedIn ? (
                    <Button 
                      onClick={() => {
                        if (!isSolanaWalletConnected) {
                          setWalletModalVisible(true);
                        } else {
                          handleCheckIn();
                        }
                      }}
                      disabled={loading || antiCoinContext.isMining || isSolanaWalletConnecting} 
                      className="w-full h-12 bg-green-500 hover:bg-green-600 disabled:opacity-50"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {isSolanaWalletConnecting ? 'Connecting Wallet...' : 
                       !isSolanaWalletConnected ? 'Connect Wallet to Check In' : 
                       antiCoinContext.isMining ? 'Mining Active Elsewhere' : 'Check In & Start Focus'}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {isRunning ? (
                          <Button 
                            onClick={pauseTimer} 
                            className="flex-1 bg-amber-500 hover:bg-amber-600"
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </Button>
                        ) : (
                          <Button 
                            onClick={startTimer} 
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </Button>
                        )}
                        
                        <Button 
                          onClick={handleCheckOut}
                          variant="destructive" 
                          className="flex-1"
                        >
                          <StopCircle className="mr-2 h-4 w-4" />
                          End Session
                        </Button>
                      </div>
                      
                      <p className="text-xs text-center text-gray-500">
                        Check out when you're ready to leave. Your earned AntiCoins will be added to your balance.
                      </p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex flex-col text-sm text-gray-600 pt-2">
                  <div className="flex items-center mb-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Hourly Rate: {cafe.usdc_per_hour ? `${cafe.usdc_per_hour.toFixed(2)} USDC/hr` : 'Not set'}</span>
                  </div>
                  <p className="text-xs">
                    Focus on your work and earn AntiCoins for every minute of productivity.
                  </p>
                </CardFooter>
              </Card>
            ) : (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No Workspace Selected</h2>
                <p className="text-gray-500 mb-6">Please select a workspace to start focusing and earning AntiCoins.</p>
                <Button 
                  onClick={() => navigate('/cafes')}
                  className="bg-antiapp-purple hover:bg-antiapp-purple/90"
                >
                  Find Workspaces
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
