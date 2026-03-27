import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLostFound } from '@/context/LostFoundContext';
import { useAuth } from '@/context/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';

export const Home: React.FC = () => {
  const { items } = useLostFound();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const stats = {
    totalItems: items.length,
    lostItems: items.filter(item => item.type === 'lost' && item.status !== 'claimed').length,
    foundItems: items.filter(item => item.type === 'found' && item.status !== 'claimed').length,
    claimedItems: items.filter(item => item.status === 'claimed').length,
  };

  const handleReportClick = () => {
    if (isAuthenticated) {
      navigate('/report');
    } else {
      setShowAuthDialog(true);
    }
  };

  return (
    <div className="min-h-screen">
      <AuthRequiredDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)}
        action="report an item"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 md:py-20">
        <div className="container mx-auto px-4">
          <div className="neo-page-shell dark:shadow-none relative mx-auto max-w-5xl space-y-6 md:space-y-8 text-center">
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-6xl dark:text-slate-100">
                Lost Something?
              </h1>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-5xl dark:text-slate-100">
                We'll Help You Find It
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg md:text-xl dark:text-slate-400">
                ReConnect is a community-driven platform that helps reunite people with their lost belongings.
                Report, search, and recover items with ease.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button asChild variant="hero" size="xl" className="group">
                <Link to="/browse">
                  <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Browse Lost Items
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="group" onClick={handleReportClick}>
                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                Report an Item
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            <div className="glass-card dark:shadow-none neo-interactive p-6 text-center group">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-primary/10 dark:border-slate-700 dark:bg-primary/20">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.totalItems}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Items</div>
            </div>

            <div className="glass-card dark:shadow-none neo-interactive p-6 text-center group">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-lost/40 bg-lost/20">
                <Clock className="h-6 w-6 text-lost" />
              </div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.lostItems}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Lost Items</div>
            </div>

            <div className="glass-card dark:shadow-none neo-interactive p-6 text-center group">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-found/40 bg-found/20">
                <Plus className="h-6 w-6 text-found" />
              </div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.foundItems}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Found Items</div>
            </div>

            <div className="glass-card dark:shadow-none neo-interactive p-6 text-center group">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-pending/40 bg-pending/20">
                <CheckCircle className="h-6 w-6 text-pending" />
              </div>
              <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.claimedItems}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Reunited</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="neo-page-shell dark:shadow-none mx-auto max-w-5xl">
            <div className="mb-10 text-center md:mb-12">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl dark:text-slate-100">How It Works</h2>
              <p className="text-base text-slate-600 md:text-xl dark:text-slate-400">
                Simple steps to reunite with your belongings
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3 md:gap-8">
              <div className="glass-card dark:shadow-none neo-interactive p-5 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  <span className="text-2xl font-semibold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Report Your Item</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Create a detailed report with photos, description, and location where you lost or found the item.
                </p>
              </div>

              <div className="glass-card dark:shadow-none neo-interactive p-5 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  <span className="text-2xl font-semibold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Browse & Match</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Search through reported items and use our filters to find potential matches for your lost belongings.
                </p>
              </div>

              <div className="glass-card dark:shadow-none neo-interactive p-5 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  <span className="text-2xl font-semibold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Get Connected</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Submit a claim with proof of ownership and connect directly with the person who found your item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="neo-panel dark:shadow-none neo-interactive mx-auto max-w-2xl space-y-5 p-6 md:space-y-6 md:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl dark:text-slate-100">
              Ready to Get Started?
            </h2>
            <p className="text-base text-slate-600 md:text-xl dark:text-slate-400">
              Join our community and help make losing something a thing of the past.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="xl" className="group">
                <Link to="/report">
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                  Report an Item
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="group">
                <Link to="/browse">
                  <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Browse Items
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};