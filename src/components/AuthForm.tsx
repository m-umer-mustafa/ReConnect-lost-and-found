import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSliding, setIsSliding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            toast({
              title: 'Email Not Confirmed',
              description: 'Please check your inbox and confirm your email address.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Login Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else if (data?.user) {
          toast({
            title: 'Welcome Back',
            description: "You've successfully signed in.",
          });
          onSuccess();
          navigate('/', { replace: true });
        } else {
          toast({
            title: 'Login Failed',
            description: 'Please check your email and password.',
            variant: 'destructive',
          });
        }
      } else {
        if (!formData.name.trim()) {
          toast({
            title: 'Validation Error',
            description: 'Please enter your full name.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name },
          },
        });

        const { data: existing } = await supabase
          .from('auth.users')
          .select('email')
          .eq('email', formData.email)
          .single();

        if (existing) {
          toast({ title: 'Already registered', description: 'This email is already in use.', variant: 'destructive' });
          setLoading(false);
          return;
        }

        if (error) {
          if (error.message.toLowerCase().includes('user already registered')) {
            toast({
              title: 'User Already Exists',
              description:
                'This email is already registered. Please sign in or confirm your email.',
              variant: 'destructive',
            });

            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password,
            });

            if (
              signInError &&
              signInError.message.toLowerCase().includes('email not confirmed')
            ) {
              toast({
                title: 'Email Not Confirmed',
                description: 'Please check your inbox and confirm your email address.',
              });
            }
          } else {
            toast({
              title: 'Registration Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Confirm Your Email',
            description: 'Check your inbox and confirm your email to complete signup.',
          });
          onSuccess();
          navigate('/', { replace: true });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSliding(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setFormData({ email: '', password: '', name: '' });
      setIsSliding(false);
    }, 250);
  };

  // Auth.tsx  (or App.tsx)
  <AuthForm onSuccess={() => navigate('/', { replace: true })} />

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`glass-card p-8 space-y-6 transition-all duration-500 ease-out ${
          isSliding ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
        }`}
        style={{
          minHeight: isLogin ? '420px' : '500px',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div className="text-center space-y-2 overflow-hidden">
          <div
            className={`transition-transform duration-500 ease-out ${
              isSliding ? (isLogin ? 'translate-x-full' : '-translate-x-full') : 'translate-x-0'
            }`}
          >
            <h1 className="text-3xl font-bold gradient-text">
              {isLogin ? 'Welcome Back' : 'Join ReConnect'}
            </h1>
            <p className="text-muted-foreground">
              {isLogin
                ? 'Sign in to your account to continue'
                : 'Create an account to start helping others'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="pl-10"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="pl-10 pr-10"
                placeholder="Enter your password"
                required
                minLength={6}
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
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <Button
            type="button"
            variant="link"
            onClick={toggleMode}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? 'Sign up here' : 'Sign in here'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
