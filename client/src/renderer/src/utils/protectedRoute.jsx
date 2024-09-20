import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAdmin, userData, fetchUserData, error } = useAuthContext();
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Eğer token varsa ve userData boşsa fetchUserData'yı çağır
    if (token && !userData) {
      fetchUserData();
    }
  }, [token, userData, fetchUserData]);

  if (error) {
    // Eğer hata varsa login sayfasına yönlendir
    return <Navigate to="/" state={{ from: location, error: error }} replace />;
  }

  if (!token || !userData) {
    // Token yoksa veya kullanıcı verisi yoksa login sayfasına yönlendir
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && userData.permission !== 'admin') {
    // Eğer admin yetkisi gerektiriyorsa ve kullanıcı admin değilse yetkisiz sayfaya yönlendir
    return <Navigate to="/NoAccess" state={{ from: location }} replace />;
  }

  // Kullanıcı giriş yapmış ve gerekli yetkiye sahipse içeriği göster
  return children;
};

export default ProtectedRoute;
