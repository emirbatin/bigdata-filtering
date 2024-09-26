import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const AccessDenied = ({ message, redirectPath }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectPath);
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate, redirectPath]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <AlertTriangle className="text-red-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Erişim Reddedildi</h2>
        <p className="text-gray-600 text-center mb-6">{message}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-red-500 h-2.5 rounded-full animate-shrink"></div>
        </div>
        <p className="text-sm text-gray-500 text-center">5 saniye içinde yönlendirileceksiniz...</p>
      </div>
    </div>
  );
};

export default AccessDenied;