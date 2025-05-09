
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner'; // Added toast import
import { ArrowLeft } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'merchant' | 'community'>('community');
  const [loading, setLoading] = useState(false);
  
  // Redirect if already logged in
  if (user) {
    return <Navigate to="/cafes" />;
  }
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || 'Sign in failed. Please check your credentials.');
      } else {
        navigate('/cafes');
        toast.success('Signed in successfully!');
      }
    } catch (e: any) {
      toast.error(e.message || 'An unexpected error occurred during sign in.');
    }
    setLoading(false);
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signUp(email, password, role);
      if (error) {
        toast.error(error.message || 'Sign up failed. Please try again.');
      } else {
        toast.success('Account created! Please check your email to verify your account.');
        // Reset form fields after successful sign-up
        setEmail('');
        setPassword('');
        setRole('community');
      }
    } catch (e: any) {
      toast.error(e.message || 'An unexpected error occurred during sign up.');
    }
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <div className="bg-gradient-to-br from-antiapp-purple/10 to-antiapp-teal/5 rounded-xl shadow-xl p-8 border border-antiapp-purple/20 relative">
            {/* Branded Back Button */}
            <button
              className="absolute left-4 top-4 flex items-center gap-1 text-antiapp-purple hover:text-antiapp-teal font-medium transition-colors"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              type="button"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-3xl font-extrabold text-center text-antiapp-purple mb-8 tracking-tight">
              Welcome to AntiApp
            </h1>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email</Label>
                      <Input 
                        id="signin-email"
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="signin-password">Password</Label>
                      <Input 
                        id="signin-password"
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full"
                      />
                      <div className="text-right mt-1">
                        <a href="/forgot-password" className="text-xs text-antiapp-coral hover:underline">Forgot password?</a>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-antiapp-teal hover:bg-antiapp-teal/90 text-white font-bold shadow-md"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input 
                        id="signup-email"
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password"
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full"
                        minLength={6}
                      />
                    </div>
                    
                    <div>
                      <Label>Account Type</Label>
                      <RadioGroup 
                        value={role} 
                        onValueChange={(value) => setRole(value as 'merchant' | 'community')}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="community" id="community" />
                          <Label htmlFor="community" className="cursor-pointer">Community Member</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="merchant" id="merchant" />
                          <Label htmlFor="merchant" className="cursor-pointer">Cafe Merchant</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-antiapp-coral hover:bg-antiapp-coral/90 text-white font-bold shadow-md"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
