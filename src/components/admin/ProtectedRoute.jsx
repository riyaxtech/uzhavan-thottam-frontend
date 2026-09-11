import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D2A1A] flex flex-col items-center justify-center p-6 text-white">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-[#D4891A]/30 flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-8 h-8 text-[#D4891A]" />
          </div>
          <Loader2 className="w-16 h-16 text-[#D4891A] animate-spin absolute inset-0 -m-0 opacity-80" />
        </div>
        <h2 className="text-xl font-playfair font-semibold text-[#F5E8CF] mb-2 tracking-wide">
          Verifying Admin Access
        </h2>
        <p className="text-sm text-white/60">
          Securing session and authenticating credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
