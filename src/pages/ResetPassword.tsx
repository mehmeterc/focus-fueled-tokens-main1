import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // On mount, check for access_token and refresh_token in the URL and set session
  useEffect(() => {
    const params = new URLSearchParams(location.hash.replace('#', '?'));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const type = params.get('type');

    if (type === 'recovery' && access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            setSessionError('Failed to establish session for password reset. Please try the link again.');
          } else {
            setSessionReady(true);
          }
        });
    } else if (window.location.search.includes('access_token')) {
      // fallback for query param style
      const searchParams = new URLSearchParams(window.location.search);
      const access_token = searchParams.get('access_token');
      const refresh_token = searchParams.get('refresh_token');
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token })
          .then(({ error }) => {
            if (error) {
              setSessionError('Failed to establish session for password reset. Please try the link again.');
            } else {
              setSessionReady(true);
            }
          });
      }
    } else {
      setSessionError('Auth session missing! Please use the password reset link from your email.');
    }
  }, [location]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message || 'Something went wrong.');
    } else {
      setMessage('Password has been reset! You can now sign in.');
      setTimeout(() => navigate('/auth'), 2000);
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
              Reset Password
            </h1>
            {sessionError && <div className="mb-4 text-center text-sm text-red-600">{sessionError}</div>}
            {sessionReady && (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <Label htmlFor="reset-password">New Password</Label>
                  <Input
                    id="reset-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-antiapp-teal hover:bg-antiapp-teal/90 text-white font-bold shadow-md"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}
            {message && <div className="mt-4 text-center text-sm text-antiapp-purple">{message}</div>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
