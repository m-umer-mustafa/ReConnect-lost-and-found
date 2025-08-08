import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLostFound } from '@/context/LostFoundContext';

export const Home: React.FC = () => {
  const { items } = useLostFound();

  const stats = {
    totalItems: items.length,
    lostItems: items.filter(item => item.type === 'lost' && item.status !== 'claimed').length,
    foundItems: items.filter(item => item.type === 'found' && item.status !== 'claimed').length,
    claimedItems: items.filter(item => item.status === 'claimed').length,
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-hero overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold gradient-text">
                Lost Something?
              </h1>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                We'll Help You Find It
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
              <Button asChild variant="outline" size="xl" className="group">
                <Link to="/report">
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                  Report an Item
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full float animation-delay-1000" />
        <div className="absolute top-40 right-16 w-12 h-12 bg-primary/15 rounded-full float animation-delay-2000" />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-primary/20 rounded-full float animation-delay-500" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center group hover:shadow-hover transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.totalItems}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>

            <div className="glass-card p-6 text-center group hover:shadow-hover transition-all duration-300">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-destructive" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.lostItems}</div>
              <div className="text-sm text-muted-foreground">Lost Items</div>
            </div>

            <div className="glass-card p-6 text-center group hover:shadow-hover transition-all duration-300">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-warning" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.foundItems}</div>
              <div className="text-sm text-muted-foreground">Found Items</div>
            </div>

            <div className="glass-card p-6 text-center group hover:shadow-hover transition-all duration-300">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.claimedItems}</div>
              <div className="text-sm text-muted-foreground">Reunited</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-accent/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground">
                Simple steps to reunite with your belongings
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 group">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold">Report Your Item</h3>
                <p className="text-muted-foreground">
                  Create a detailed report with photos, description, and location where you lost or found the item.
                </p>
              </div>

              <div className="text-center space-y-4 group">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold">Browse & Match</h3>
                <p className="text-muted-foreground">
                  Search through reported items and use our filters to find potential matches for your lost belongings.
                </p>
              </div>

              <div className="text-center space-y-4 group">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold">Get Connected</h3>
                <p className="text-muted-foreground">
                  Submit a claim with proof of ownership and connect directly with the person who found your item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90">
              Join our community and help make losing something a thing of the past.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="xl" className="group">
                <Link to="/report">
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                  Report an Item
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="group bg-white/10 border-white/20 text-white hover:bg-white/20">
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