import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
    <div className="container mx-auto max-w-lg p-4">
      <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
        &larr; Back
      </Button>
      <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>
      <div className="mb-8 space-y-2">
        <div>
          <span className="font-semibold">Email:</span> {user?.email}
        </div>
        <div>
          <span className="font-semibold">User Type:</span> {profile?.role || 'User'}
        </div>
        {/* Wallet info (customize as needed) */}
        {profile?.wallet && (
          <div>
            <span className="font-semibold">Wallet:</span> {profile.wallet}
          </div>
        )}
        {/* Payment info placeholder */}
        {profile?.payment && (
          <div>
            <span className="font-semibold">Payment:</span> {profile.payment}
          </div>
        )}
      </div>
      <div className="border-t pt-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password (min. 6 characters)"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
