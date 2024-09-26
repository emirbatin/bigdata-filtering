import React from 'react';
import { XCircle } from 'lucide-react';

const NoAccess = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <XCircle className="w-24 h-24 text-red-500 mb-8 animate-pulse" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Erişim Engellendi</h1>
      <p className="text-lg text-gray-600">Bu sayfayı görüntüleme yetkiniz yok.</p>
      <button className="mt-8 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50">
        Ana Sayfaya Dön
      </button>
    </div>
  );
};

export default NoAccess;