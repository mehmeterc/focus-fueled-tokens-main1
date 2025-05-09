import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { Timer, Play, Pause, StopCircle, Coffee, Coins, Clock, CheckCircle } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

export default function FocusTimer() {
  const { cafeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cafe, setCafe] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionTime, setSessionTime] = useState(0); // in seconds
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to use the Focus Timer');
      navigate('/login');
      return;
    }

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
        
        // Calculate earned coins (1 AntiCoin per 2 USDC paid)
        if (cafe?.usdc_per_hour) {
          // Convert hourly USDC rate to AntiCoins per second
          const usdc_per_second = cafe.usdc_per_hour / 3600; // USDC per second
          const anticoins_per_second = usdc_per_second / 2; // 1 AntiCoin per 2 USDC
          setEarnedCoins(Math.floor(elapsedSeconds * anticoins_per_second));
        }
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
    
    try {
      setLoading(true);
      
      // Create a focus session record
      const { error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          cafe_id: cafeId,
          start_time: new Date().toISOString(),
          status: 'active'
        });
        
      if (error) throw error;
      
      setCheckedIn(true);
      startTimeRef.current = Date.now();
      setSessionTime(0);
      startTimer();
      
      toast.success('Checked in successfully! Focus timer started.');
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckOut = async () => {
    if (!user || !cafeId) return;
    
    try {
      setLoading(true);
      pauseTimer();
      
      // Update the focus session with end time
      const { error: sessionError } = await supabase
        .from('focus_sessions')
        .update({
          end_time: new Date().toISOString(),
          duration_seconds: sessionTime,
          earned_coins: earnedCoins,
          status: 'completed'
        })
        .eq('user_id', user.id)
        .eq('cafe_id', cafeId)
        .is('end_time', null);
        
      if (sessionError) throw sessionError;
      
      // Add coins to user's balance
      if (earnedCoins > 0) {
        // Get current balance
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('anti_coin_balance')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        const currentBalance = profileData?.anti_coin_balance || 0;
        const newBalance = currentBalance + earnedCoins;
        
        // Update balance
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ anti_coin_balance: newBalance })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
      }
      
      toast.success(`Focus session completed! You earned ${earnedCoins} AntiCoins.`);
      setCheckedIn(false);
      setSessionTime(0);
      setEarnedCoins(0);
      startTimeRef.current = null;
      
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
        
        {loading ? (
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
                            {cafe.usdc_per_hour ? `${Math.floor(cafe.usdc_per_hour / 2)} coins/hr rate` : 'Rate not set'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-yellow-600">{earnedCoins}</div>
                    </div>
                  </div>
                  
                  {!checkedIn ? (
                    <Button 
                      onClick={handleCheckIn} 
                      disabled={loading} 
                      className="w-full h-12 bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Check In & Start Focus
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
