
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRDisplay from '@/components/QRDisplay';
import { Loader2, Coffee, MapPin, Plus } from 'lucide-react';
import { useMerchantSessionHistory } from '@/hooks/useMerchantSessionHistory';
import MerchantSessionHistoryTable from '@/components/MerchantSessionHistoryTable';

const MerchantDashboard = () => {
  // Inline USDC rate editing state
  const [editingCafeId, setEditingCafeId] = useState<string | null>(null);
  const [editUsdcValue, setEditUsdcValue] = useState<string>('');

  // USDC update mutation
  const updateUsdcMutation = useMutation({
    mutationFn: async ({ cafeId, usdc_per_hour }: { cafeId: string; usdc_per_hour: number | null }) => {
      const { error } = await supabase
        .from('cafes')
        .update({ usdc_per_hour })
        .eq('id', cafeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-cafes'] });
      queryClient.invalidateQueries({ queryKey: ['cafes'] });
      toast('USDC rate updated');
      setEditingCafeId(null);
      setEditUsdcValue('');
    },
    onError: (error: any) => {
      toast('Failed to update USDC rate', { description: error.message });
    }
  });

  // Edit handlers
  const handleEditUsdcRate = (cafeId: string, currentValue: number | null) => {
    setEditingCafeId(cafeId);
    setEditUsdcValue(currentValue !== null && typeof currentValue === 'number' ? currentValue.toString() : '');
  };
  const handleCancelEditUsdcRate = () => {
    setEditingCafeId(null);
    setEditUsdcValue('');
  };
  const handleSaveUsdcRate = (cafeId: string) => {
    const value = editUsdcValue.trim();
    const parsed = value === '' ? null : Number(value);
    if (parsed !== null && (isNaN(parsed) || parsed < 0)) {
      toast('Please enter a valid non-negative number for USDC rate.');
      return;
    }
    updateUsdcMutation.mutate({ cafeId, usdc_per_hour: parsed });
  };

  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCafe, setSelectedCafe] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  
  // New cafe form state
  const [newCafe, setNewCafe] = useState({
    name: '',
    location: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    weekday_hours: '8:00 AM - 8:00 PM',
    weekend_hours: '9:00 AM - 6:00 PM',
    total_capacity: 50,
    available_capacity: 50,
    distance: 0,
    amenities: ['wifi', 'power', 'drinks'],
    usdc_per_hour: '0'
  });

  // Fetch merchant's cafes using React Query
  const { 
    data: cafes = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['merchant-cafes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('cafes')
        .select('*')
        .eq('merchant_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !authLoading,
  });

  // Only redirect if not loading and we know the user is not a merchant
  useEffect(() => {
    if (!authLoading && user && profile && profile.role !== 'merchant') {
      navigate('/cafes');
      toast("Access denied", {
        description: 'You need merchant access to view this page'
      });
    }
  }, [user, profile, authLoading, navigate]);

  // Create cafe mutation
  const createCafeMutation = useMutation({
    mutationFn: async (cafeData: any) => {
      const { data, error } = await supabase
        .from('cafes')
        .insert(cafeData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-cafes'] });
      queryClient.invalidateQueries({ queryKey: ['cafes'] });
      toast("Cafe created", {
        description: 'Your cafe has been successfully created'
      });
      
      // Reset form
      setNewCafe({
        name: '',
        location: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Y2FmZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
        weekday_hours: '8:00 AM - 8:00 PM',
        weekend_hours: '9:00 AM - 6:00 PM',
        total_capacity: 50,
        available_capacity: 50,
        distance: 0,
        amenities: ['wifi', 'power', 'drinks']
      });
    },
    onError: (error: any) => {
      toast("Failed to create cafe", {
        description: error.message
      });
    }
  });

  const handleCreateCafe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    createCafeMutation.mutate({
      ...newCafe,
      usdc_per_hour: newCafe.usdc_per_hour !== '' ? Number(newCafe.usdc_per_hour) : null,
      merchant_id: user.id
    });
  };

  const handleShowQR = (cafeId: string) => {
    setSelectedCafe(cafeId);
    setShowQR(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCafe({
      ...newCafe,
      [name]: value
    });
  };

  // Show loading state during authentication check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-antiapp-purple" />
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show sign-in prompt if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-antiapp-purple">Please sign in</h2>
            <p className="mt-2 text-gray-600">You need to sign in as a merchant to view this page.</p>
            <Button 
              className="mt-4 bg-antiapp-teal hover:bg-antiapp-teal/90"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-antiapp-purple mb-8">Merchant Dashboard</h1>
          
          <Tabs defaultValue="cafes" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="cafes">My Cafes</TabsTrigger>
              <TabsTrigger value="add">Add New Cafe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cafes">
              {error ? (
                <div className="text-center py-12 bg-red-50 rounded-lg">
                  <p className="text-red-600 font-semibold">Failed to load cafes. Please try again later.</p>
                  <p className="mt-2 text-gray-500">{error.message}</p>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-antiapp-purple" aria-label="Loading cafes" />
                </div>
              ) : cafes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cafes.map((cafe) => (
                    <Card key={cafe.id} className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-antiapp-teal/20">
                      <div className="relative h-48">
                        <img 
                          src={cafe.image} 
                          alt={cafe.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl text-antiapp-purple">{cafe.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center mt-1 text-gray-600 text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{cafe.location}</span>
                        </div>
                        {editingCafeId === cafe.id ? (
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editUsdcValue}
                              onChange={e => setEditUsdcValue(e.target.value)}
                              className="w-24"
                              autoFocus
                            />
                            <Button size="sm" className="bg-antiapp-teal hover:bg-antiapp-teal/90" onClick={() => handleSaveUsdcRate(cafe.id)} disabled={updateUsdcMutation.isPending}>
                              {updateUsdcMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEditUsdcRate} className="border-antiapp-teal text-antiapp-teal hover:bg-antiapp-teal/10">Cancel</Button>
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-gray-700 flex items-center gap-2">
                            <span className="font-semibold">USDC Rate:</span> {typeof cafe.usdc_per_hour === 'number' ? cafe.usdc_per_hour.toFixed(2) : 'N/A'} USDC/hr
                            <Button size="sm" variant="outline" className="border-antiapp-teal text-antiapp-teal hover:bg-antiapp-teal/10 ml-2" onClick={() => handleEditUsdcRate(cafe.id, cafe.usdc_per_hour)}>
                              Edit
                            </Button>
                          </div>
                        )}
                        <div className="mt-4 flex space-x-2">
                          <Button 
                            onClick={() => handleShowQR(cafe.id)}
                            className="bg-antiapp-purple hover:bg-antiapp-purple/90"
                            aria-label={`Generate QR Code for ${cafe.name}`}
                          >
                            Generate QR Code
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-antiapp-teal text-antiapp-teal hover:bg-antiapp-teal/10"
                            onClick={() => navigate(`/cafe/${cafe.id}`)}
                            aria-label={`View details for ${cafe.name}`}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Coffee className="h-12 w-12 mx-auto text-gray-400" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No cafes yet</h3>
                  <p className="mt-2 text-gray-500">You haven't added any cafes to your account.</p>
                  <Button 
                    className="mt-4 bg-antiapp-teal hover:bg-antiapp-teal/90"
                    onClick={() => document.querySelector('[value="add"]')?.dispatchEvent(new MouseEvent('click'))}
                    aria-label="Add your first cafe"
                  >
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Add Your First Cafe
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="add">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Cafe</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCafe} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Cafe Name</label>
                      <Input
                        id="name"
                        name="name"
                        value={newCafe.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                      <Input
                        id="location"
                        name="location"
                        value={newCafe.location}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newCafe.description}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="weekday_hours" className="block text-sm font-medium text-gray-700">Weekday Hours</label>
                        <Input
                          id="weekday_hours"
                          name="weekday_hours"
                          value={newCafe.weekday_hours}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="weekend_hours" className="block text-sm font-medium text-gray-700">Weekend Hours</label>
                        <Input
                          id="weekend_hours"
                          name="weekend_hours"
                          value={newCafe.weekend_hours}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="usdc_per_hour" className="block text-sm font-medium text-gray-700">USDC Rate per Hour</label>
                      <Input
                        id="usdc_per_hour"
                        name="usdc_per_hour"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newCafe.usdc_per_hour}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="e.g. 3.50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Set the hourly rate in USDC (e.g. 3.50). Users will see a 10% commission added at checkout.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="total_capacity" className="block text-sm font-medium text-gray-700">Total Capacity</label>
                        <Input
                          id="total_capacity"
                          name="total_capacity"
                          type="number"
                          value={newCafe.total_capacity.toString()}
                          onChange={handleInputChange}
                          required
                          min="1"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="available_capacity" className="block text-sm font-medium text-gray-700">Available Capacity</label>
                        <Input
                          id="available_capacity"
                          name="available_capacity"
                          type="number"
                          value={newCafe.available_capacity.toString()}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-antiapp-teal hover:bg-antiapp-teal/90"
                      disabled={createCafeMutation.isPending}
                    >
                      {createCafeMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Create Cafe
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {showQR && selectedCafe && (
        <QRDisplay 
          cafeId={selectedCafe} 
          cafeName={cafes.find(cafe => cafe.id === selectedCafe)?.name || "Cafe"} 
          onClose={() => setShowQR(false)} 
        />
      )}
      
      {/* Merchant session/payment history section */}
      <div className="container mx-auto my-12">
        <Card>
          <CardHeader>
            <CardTitle>Session & Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Fetch and show all sessions for all cafes owned by the merchant */}
            {user && (
              (() => {
                const { history, isLoading, error } = useMerchantSessionHistory(user.id);
                if (isLoading) return <div className="py-8 flex items-center"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading session history...</div>;
                if (error) return <div className="text-red-500">Error loading session history: {error}</div>;
                return <MerchantSessionHistoryTable history={history} />;
              })()
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default MerchantDashboard;
