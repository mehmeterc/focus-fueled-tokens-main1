
import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QRDisplay from '@/components/QRDisplay';
import QRScanner from '@/components/QRScanner';
import SessionTracker from '@/components/SessionTracker';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Coin from '@/components/Coin';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, LogOut, Timer, Coins } from 'lucide-react';

interface Cafe {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  merchant_id: string;
  usdc_per_hour?: number; // Optional for backward compatibility
}

const CheckIn = () => {
  const { id } = useParams<{ id: string }>();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [progressToNextCoin, setProgressToNextCoin] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeType, setQrCodeType] = useState<'check-in' | 'check-out'>('check-in');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerType, setScannerType] = useState<'check-in' | 'check-out'>('check-in');
  const [currentCheckInId, setCurrentCheckInId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCafeOwner, setIsCafeOwner] = useState(false);
  const { toast: toastHook } = useToast();
  const { user, profile, isMerchant, isCommunity } = useAuth();

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Force component to use the latest code by adding a version marker
  const APP_VERSION = 'v2.0.1'; // Increment this whenever making changes to earn calculations
  
  useEffect(() => {
    if (id) {
      console.log(`CheckIn page loaded for cafe: ${id} (${APP_VERSION})`);
      // Clear any cached session data that might contain old text
      sessionStorage.removeItem('antiapp_checkin_text');
      fetchCafeData();
      checkExistingCheckIn();
    }
    
    // Force refresh if the page has been cached
    const lastRefresh = sessionStorage.getItem('last_checkin_refresh');
    const now = Date.now().toString();
    if (!lastRefresh || Date.now() - parseInt(lastRefresh) > 60000) {
      sessionStorage.setItem('last_checkin_refresh', now);
    }
  }, [id, user, APP_VERSION]);

  async function fetchCafeData() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cafes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching cafe:', error);
        toast.error("Could not load cafe information");
        return;
      }

      setCafe(data);
      
      // Check if the current user is the owner of this cafe
      if (user && data.merchant_id === user.id) {
        setIsCafeOwner(true);
      } else {
        setIsCafeOwner(false);
      }
      
      console.log("Cafe data loaded:", data, "User is owner:", data.merchant_id === user?.id);
    } catch (error) {
      console.error('Error in fetchCafeData:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkExistingCheckIn() {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('cafe_id', id)
        .eq('user_id', user.id)
        .is('check_out_time', null)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // No rows returned
          console.error('Error checking existing check-in:', error);
        }
        console.log("No existing check-in found");
        return;
      }

      if (data) {
        // User is already checked in
        console.log("User is already checked in:", data);
        setIsCheckedIn(true);
        setCurrentCheckInId(data.id);
        const startTime = new Date(data.check_in_time);
        setSessionStartTime(startTime);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(diffInSeconds);
        
        // Update earned coins
        const coins = calculateEarnedCoins(diffInSeconds);
        setEarnedCoins(coins);
        
        // Update progress to next coin
        const progress = calculateProgressToNextCoin(diffInSeconds);
        setProgressToNextCoin(progress);
      }
    } catch (error) {
      console.error('Error in checkExistingCheckIn:', error);
    }
  }

  // Calculate Anti coins earned based on time and USDC rate
  const calculateEarnedCoins = (seconds: number) => {
    if (!cafe?.usdc_per_hour) return 0;
    
    // 1 Anti coin for every 2 USDC spent
    const usdcPerSecond = cafe.usdc_per_hour / 3600; // USDC per second
    const secondsFor1AntiCoin = 2 / usdcPerSecond; // Seconds needed for 1 Anti coin
    
    return Math.floor(seconds / secondsFor1AntiCoin);
  };

  // Calculate progress to next Anti coin (0-100)
  const calculateProgressToNextCoin = (seconds: number) => {
    if (!cafe?.usdc_per_hour) return 0;
    
    const usdcPerSecond = cafe.usdc_per_hour / 3600;
    const secondsFor1AntiCoin = 2 / usdcPerSecond;
    
    const totalCoins = seconds / secondsFor1AntiCoin;
    const fractionPart = totalCoins - Math.floor(totalCoins);
    
    return Math.min(Math.floor(fractionPart * 100), 100);
  };

  // Calculate minutes until next coin
  const calculateMinutesToNextCoin = (seconds: number) => {
    if (!cafe?.usdc_per_hour) return 0;
    
    const usdcPerSecond = cafe.usdc_per_hour / 3600;
    const secondsFor1AntiCoin = 2 / usdcPerSecond;
    
    const totalCoins = seconds / secondsFor1AntiCoin;
    const fractionPart = totalCoins - Math.floor(totalCoins);
    const secondsRemaining = (1 - fractionPart) * secondsFor1AntiCoin;
    
    return Math.ceil(secondsRemaining / 60);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isCheckedIn && sessionStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
        setElapsedTime(diff);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCheckedIn, sessionStartTime]);

  const handleCheckIn = async (qrValue: string, cafeId: string) => {
    try {
      // Verify the cafe ID matches
      if (cafeId !== id) {
        toast.error('The scanned QR code is for a different cafe');
        return;
      }

      // Insert a new check-in record
      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          cafe_id: cafeId,
          user_id: user?.id,
          check_in_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating check-in:', error);
        toast.error('Unable to check in. Please try again.');
        return;
      }

      setIsCheckedIn(true);
      setSessionStartTime(new Date());
      setCurrentCheckInId(data.id);
      
      toast.success(`You're now checked in at ${cafe?.name}. Timer started!`);
    } catch (error) {
      console.error('Error in handleCheckIn:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleCheckOut = async (qrValue: string, cafeId: string) => {
    // Only allow check-out via a valid QR code for this cafe
    if (!isCheckedIn || !sessionStartTime || !currentCheckInId) return;
    if (cafeId !== id) {
      toast.error('The scanned QR code is for a different cafe');
      return;
    }
    if (!qrValue.startsWith('antiapp://check-out/')) {
      toast.error('Invalid QR code. Please scan the official check-out QR code.');
      return;
    }
    try {
      const durationInSeconds = elapsedTime;
      const durationInMinutes = Math.floor(durationInSeconds / 60);
      const earnedCoins = Math.floor(durationInMinutes / 5); // 1 coin per 5 minutes

      // Calculate payment
      let usdcPaid = 0;
      let commission = 0;
      let total = 0;
      if (cafe && typeof cafe.usdc_per_hour === 'number') {
        usdcPaid = (durationInMinutes / 60) * cafe.usdc_per_hour;
        commission = usdcPaid * 0.1; // 10% commission
        total = usdcPaid + commission;
      }

      // Update the check-in record with check-out time and payment info
      const { error } = await supabase
        .from('check_ins')
        .update({
          check_out_time: new Date().toISOString(),
          duration: durationInSeconds,
          coins_earned: earnedCoins,
          usdc_paid: usdcPaid,
          commission: commission,
          total: total
        })
        .eq('id', currentCheckInId);

      if (error) {
        console.error('Error updating check-out:', error);
        toastHook({
          title: "Check-out Failed",
          description: "Unable to check out. Please try again.",
          variant: "destructive",
        });
        return;
      }
      setIsCheckedIn(false);
      setSessionStartTime(null);
      setCurrentCheckInId(null);
      toastHook({
        title: "Successfully Checked Out",
        description: `Session ended! You spent ${total.toFixed(2)} USDC for your ${durationInMinutes} minutes of focus.`,
      });
    } catch (error) {
      console.error('Error in handleCheckOut:', error);
      toastHook({
        title: "Check-out Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQRScan = (result: string, cafeId: string, scanType: 'check-in' | 'check-out') => {
    setShowQRScanner(false);
    // Only allow check-in or check-out via valid QR scan
    if (scanType === 'check-in') {
      handleCheckIn(result, cafeId);
    } else if (scanType === 'check-out') {
      handleCheckOut(result, cafeId);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showQRCodeDisplay = (type: 'check-in' | 'check-out') => {
    setQrCodeType(type);
    setShowQRCode(true);
  };

  const showQRScannerModal = (type: 'check-in' | 'check-out') => {
    setScannerType(type);
    setShowQRScanner(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-antiapp-purple rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cafe information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-antiapp-purple">Cafe not found</h2>
            <p className="mt-2 text-gray-600">The cafe you're looking for doesn't exist or has been removed.</p>
            <Link to="/cafes">
              <Button className="mt-4 bg-antiapp-teal hover:bg-antiapp-teal/90">Back to Cafes</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Render different views based on user role and status
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow" ref={(el) => {
        // Direct DOM fix to catch any stubborn cached text that still appears
        if (el) {
          setTimeout(() => {
            const allParagraphs = el.querySelectorAll('p');
            allParagraphs.forEach(p => {
              if (p.innerText && (
                p.innerText.includes('1 Anti coin for every 5 minutes') ||
                p.innerText.includes('You\'ll earn 1 Anti')
              )) {
                console.log('Found and removing stubborn text:', p.innerText);
                // Replace with the correct calculation from cafe data
                if (cafe?.usdc_per_hour) {
                  const minutesFor1Coin = (2 / cafe.usdc_per_hour * 60).toFixed(1);
                  p.innerText = `Earn Anti coins based on focus time (1 coin per ${minutesFor1Coin} min)`;
                } else {
                  p.style.display = 'none'; // Hide if we can't calculate
                }
              }
            });
          }, 100); // Small delay to ensure DOM is fully loaded
        }
      }}>
      
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-4">
            <Link to={`/cafe/${cafe.id}`} className="text-antiapp-teal hover:text-antiapp-teal/80">
              ← Back to {cafe.name}
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-antiapp-purple mb-2">
                {/* Show different title based on user role and ownership */}
                {isMerchant() && isCafeOwner 
                  ? 'Cafe Management Dashboard'
                  : isCheckedIn
                    ? 'Current Check-in Session'
                    : 'Check In at ' + cafe.name}
              </h1>
              <p className="text-gray-600">
                {isMerchant() && isCafeOwner
                  ? `Track activity and manage check-ins at ${cafe.name}`
                  : isCheckedIn 
                    ? `You're currently checked in at ${cafe.name}`
                    : `Ready to focus at ${cafe.name}? Check in to start earning Anti coins!`}
              </p>
            </div>
            
            {/* Merchant view */}
            {isMerchant() && isCafeOwner && (
              <div className="text-center">
                <div className="mb-6">
                  <img 
                    src={cafe.image} 
                    alt={cafe.name} 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                
                {/* Display session tracker for merchants */}
                <SessionTracker 
                  cafeId={cafe.id} 
                  onShowQRCode={showQRCodeDisplay} 
                />
              </div>
            )}
            
            {/* Community user view */}
            {isCommunity() && (
              <div className="text-center">
                {isCheckedIn ? (
                  // User is already checked in - show session timer
                  <>
                    <div className="mb-6 flex justify-center">
                      <Coin size="lg" className="animate-coin-spin" />
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-lg font-semibold text-antiapp-purple">Session Time</p>
                      <p className="text-3xl font-bold text-antiapp-teal" key="v2-timer-text">{formatTime(elapsedTime)}</p>
                    </div>
                    
                    <div className="text-center py-6">
                      <div className="flex justify-center items-center bg-yellow-50 rounded-lg p-4 shadow-inner">
                        <div className="flex items-center">
                          <Coins className="h-5 w-5 text-yellow-600 mr-2" />
                          <div>
                            <div className="text-base font-medium">Earned Anti Coins: <span className="text-xl text-yellow-700 font-bold">{earnedCoins}</span></div>
                            <div className="text-xs text-gray-600 mt-1">Rate: {cafe?.usdc_per_hour ? `1 Anti coin per ${(2 / cafe.usdc_per_hour * 60).toFixed(1)} minutes` : 'Rate not set'}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress to next coin */}
                      <div className="mt-4 mb-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress to next Anti coin</span>
                          <span>{calculateMinutesToNextCoin(elapsedTime)} min remaining</span>
                        </div>
                        <Progress value={progressToNextCoin} className="h-2">
                          <div 
                            className="absolute h-full bg-green-500 transition-all duration-500 ease-in-out" 
                            style={{width: `${progressToNextCoin}%`, animation: progressToNextCoin > 95 ? 'pulse 1.5s infinite' : 'none'}}
                          />
                        </Progress>
                      </div>
                      
                      <style jsx>{`
                        @keyframes pulse {
                          0% { opacity: 0.7; }
                          50% { opacity: 1; }
                          100% { opacity: 0.7; }
                        }
                      `}</style>
                    </div>
                    
                    {cafe && typeof cafe.usdc_per_hour === 'number' && (
                      <div className="mb-4 p-3 bg-antiapp-teal/10 rounded-lg text-center">
                        <div className="text-md text-gray-700 mb-1 font-semibold">Live Session Spend</div>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                          <span>USDC: <span className="font-bold">{((elapsedTime / 60) / 60 * cafe.usdc_per_hour).toFixed(2)}</span></span>
                          <span>Commission: <span className="font-bold">{(((elapsedTime / 60) / 60 * cafe.usdc_per_hour) * 0.1).toFixed(2)}</span></span>
                          <span>Total: <span className="font-bold">{(((elapsedTime / 60) / 60 * cafe.usdc_per_hour) * 1.1).toFixed(2)}</span></span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Updates live as you focus</div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                      <Button 
                        onClick={() => showQRScannerModal('check-out')} 
                        className="bg-antiapp-coral hover:bg-antiapp-coral/90 flex items-center justify-center gap-2"
                      >
                        <QrCode size={18} />
                        Scan Check-Out QR Code
                      </Button>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">
                      Ask the cafe staff to show you the check-out QR code
                    </p>
                  </>
                ) : (
                  // User needs to check in
                  <>
                    <div className="mb-6">
                      <img 
                        src={cafe.image} 
                        alt={cafe.name} 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg mb-6">
                      <h3 className="font-semibold text-lg mb-2">How to Check In</h3>
                      <ol className="text-left text-gray-600 space-y-2">
                        <li>1. Find the AntiApp QR code displayed at the cafe</li>
                        <li>2. Click "Scan QR Code" below and point your camera at the code</li>
                        <li>3. Once checked in, focus on your work and earn Anti coins</li>
                        <li>4. When you're done, scan the check-out QR code to claim your coins</li>
                      </ol>
                    </div>
                    
                    <Button 
                      onClick={() => showQRScannerModal('check-in')} 
                      className="w-full bg-antiapp-teal hover:bg-antiapp-teal/90 flex items-center justify-center gap-2"
                    >
                      <QrCode size={18} />
                      Scan Check-In QR Code
                    </Button>
                  </>
                )}
              </div>
            )}
            
            {/* Not owned cafe and merchant user */}
            {isMerchant() && !isCafeOwner && (
              <div className="text-center p-6">
                <p className="text-lg text-gray-700 mb-4">
                  You don't own this cafe, so you can't manage check-ins for it.
                </p>
                <Link to="/merchant-dashboard">
                  <Button className="mr-2 bg-antiapp-purple hover:bg-antiapp-purple/90">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to="/cafes">
                  <Button variant="outline" className="border-antiapp-teal text-antiapp-teal hover:bg-antiapp-teal/10">
                    Browse Cafes
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* QR Code Modal for merchants */}
        {showQRCode && isMerchant() && (
          <QRDisplay 
            cafeId={cafe.id}
            cafeName={cafe.name}
            onClose={() => setShowQRCode(false)}
            type={qrCodeType} 
          />
        )}
        
        {/* QR Scanner Modal for community users */}
        {showQRScanner && isCommunity() && (
          <QRScanner 
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
            expectedType={scannerType}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CheckIn;
