import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) {
      setMessage(error.message || 'Something went wrong.');
    } else {
      setMessage('Password reset email sent! Please check your inbox.');
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
              Forgot Password
            </h1>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-antiapp-teal hover:bg-antiapp-teal/90 text-white font-bold shadow-md"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </form>
            {message && <div className="mt-4 text-center text-sm text-antiapp-purple">{message}</div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
