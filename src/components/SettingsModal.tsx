import React, { useState } from 'react';
import { X, Eye, EyeOff, Trash2, User, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { PasswordStrengthBar } from './PasswordStrengthBar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateName = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Name cannot be empty', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: formData.name.trim() }
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Name updated successfully' });
      setFormData(prev => ({ ...prev, name: formData.name.trim() }));
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!formData.newPassword || formData.newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Password updated successfully' });
      setFormData(prev => ({ 
        ...prev, 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
      }));
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Delete user's items and claims
      await supabase.from('items').delete().eq('user_id', user?.id);
      await supabase.from('claims').delete().eq('claimer_id', user?.id);
      
      // Delete user account (this needs to be implemented via Supabase Edge Function)
      const { error } = await supabase.functions.invoke('delete-user');
      
      if (error) throw error;

      toast({ title: 'Success', description: 'Account deleted successfully' });
      logout();
      onClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg glass-card animate-scale-in max-h-[90vh] overflow-y-auto rounded-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Account Settings</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {showDeleteConfirm ? (
            /* Delete Confirmation */
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <h3 className="font-medium text-destructive mb-2">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This action cannot be undone. This will permanently delete your account and all associated data including:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                      <li>• All items you've reported</li>
                      <li>• All claims you've made</li>
                      <li>• Your profile information</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Delete Account'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Settings Form */
            <div className="space-y-6">
              {/* Update Name */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Update Name</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <Button onClick={handleUpdateName} disabled={loading} className="w-full">
                  Update Name
                </Button>
              </div>

              <Separator />

              {/* Change Password */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Change Password</h3>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className="pr-10"
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <PasswordStrengthBar password={formData.newPassword} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <Button onClick={handleUpdatePassword} disabled={loading} className="w-full">
                  Change Password
                </Button>
              </div>

              <Separator />

              {/* Delete Account */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <h3 className="font-medium text-destructive">Danger Zone</h3>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};