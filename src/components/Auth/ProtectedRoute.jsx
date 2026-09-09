import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 dark:text-stone-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to sign in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If authenticated, render the children
  return children;
};

export default ProtectedRoute;