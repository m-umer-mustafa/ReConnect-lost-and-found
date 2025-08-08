import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/context/AuthContext';

export const Auth: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero content */}
        <div className="hidden lg:block space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold gradient-text animate-fade-in">
              ReConnect
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-in">
              Bringing lost items back home, one connection at a time.
            </p>
          </div>
          
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Report Lost or Found Items</h3>
                <p className="text-muted-foreground text-sm">
                  Easily report items you've lost or found with detailed descriptions and photos.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Smart Matching System</h3>
                <p className="text-muted-foreground text-sm">
                  Our system helps match lost items with found items automatically.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Secure Communication</h3>
                <p className="text-muted-foreground text-sm">
                  Connect safely with other users through our verified claim system.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex items-center justify-center">
          <AuthForm onSuccess={() => {}} />
        </div>
      </div>
    </div>
  );
};