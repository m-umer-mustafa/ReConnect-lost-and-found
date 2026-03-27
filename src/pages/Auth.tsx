import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Auth: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the page the user intended to visit before authentication
      navigate(location.state?.from?.pathname || '/');
    }
  }, [isAuthenticated, location]);

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
    <div className="min-h-screen graph-paper-bg px-4 py-6 md:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:gap-8 lg:grid-cols-2 lg:items-center">
        <section className="hidden lg:block space-y-6 animate-fade-in">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
              Secure Community Access
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome to ReConnect
            </h1>
            <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
              A calm, trusted space to report, track, and reclaim lost belongings with confidence.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-card dark:border-slate-800 dark:bg-slate-900/90">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Fast Item Reporting</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Create detailed lost and found posts in minutes.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-card dark:border-slate-800 dark:bg-slate-900/90">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Verified Claims</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Use structured claims to ensure secure ownership recovery.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-card dark:border-slate-800 dark:bg-slate-900/90">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Real-Time Updates</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Stay informed through live status and notifications.</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur-sm sm:p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900/95">
            <AuthForm onSuccess={() => navigate(location.state?.from?.pathname || '/')} />
          </div>
        </section>
      </div>
    </div>
  );
};