import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authServices'; 
import AccessDenied from '../views/AccessDeniedView';

const ProtectedRoute = ({ element }) => {
  const isUserAuthenticated = isAuthenticated(); 

  if (!isUserAuthenticated) {
    return <AccessDenied message="Bu sayfaya erişmek için giriş yapmalısınız." redirectPath="/login" /> 
  }

  return element;
};

export default ProtectedRoute;
