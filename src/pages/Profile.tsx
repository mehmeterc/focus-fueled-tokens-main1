import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Change password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      toast.error(`Failed to update password: ${updateError.message}`);
    } else {
      setSuccess('Password updated successfully!');
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="container mx-auto max-w-lg p-4 bg-gradient-to-br from-antiapp-purple/10 to-antiapp-teal/5 rounded-lg shadow-lg mt-8">
      {/* Branded Back Button */}
      <button
        className="flex items-center gap-2 text-antiapp-purple hover:text-antiapp-teal font-medium mb-4 transition-colors"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <ArrowLeft size={22} />
        Back
      </button>
      <h1 className="text-3xl font-extrabold mb-6 text-center text-antiapp-purple tracking-tight">Profile</h1>
      <div className="mb-8 space-y-3 bg-white/70 rounded-lg p-4 border border-antiapp-purple/10">
        <div>
          <span className="font-semibold text-antiapp-purple">Email:</span> {user?.email}
        </div>
        <div>
          <span className="font-semibold text-antiapp-purple">User Type:</span> {profile?.role || 'User'}
        </div>
        {/* Wallet info (customize as needed) */}
        {profile && 'wallet' in profile && profile.wallet && (
          <div>
            <span className="font-semibold text-antiapp-purple">Wallet:</span> {profile.wallet}
          </div>
        )}
        {/* Payment info placeholder */}
        {profile && 'payment' in profile && profile.payment && (
          <div>
            <span className="font-semibold text-antiapp-purple">Payment:</span> {profile.payment}
          </div>
        )}
      </div>
      <div className="border-t border-antiapp-purple/20 pt-6 mt-6">
        <h2 className="text-xl font-bold mb-4 text-antiapp-purple">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label htmlFor="new-password" className="text-antiapp-purple">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password (min. 6 characters)"
              className="focus:border-antiapp-teal focus:ring-antiapp-teal"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password" className="text-antiapp-purple">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              className="focus:border-antiapp-teal focus:ring-antiapp-teal"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-antiapp-purple hover:bg-antiapp-teal text-white font-bold shadow-md">
            {loading ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
