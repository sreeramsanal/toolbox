import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/30 flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold font-mono text-dark-text mb-2">404</h1>
      <p className="text-sm text-dark-text-secondary mb-6">
        The requested utility route does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
};
