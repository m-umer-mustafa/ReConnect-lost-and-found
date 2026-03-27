import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-4 shadow-card sm:px-5 sm:py-5 md:flex-row dark:border-slate-800 dark:bg-slate-900/95">
          {/* Logo & Description */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-primary/10 dark:border-slate-700 dark:bg-primary/20">
              <span className="text-xs font-semibold text-primary">R</span>
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">ReConnect</span>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            <p>© {currentYear} ReConnect Lost & Found System. All rights reserved.</p>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-300">
            <Link to="/blog" className="rounded-lg px-3 py-1 font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100">Blog</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};