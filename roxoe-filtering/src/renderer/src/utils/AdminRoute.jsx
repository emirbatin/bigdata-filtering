import { Navigate } from 'react-router-dom'
import { getCurrentUser, isAuthenticated } from '../services/authServices' 
import AccessDenied from '../views/AccessDeniedView'

const AdminRoute = ({ element }) => {
  const isUserAuthenticated = isAuthenticated() 
  const userData = getCurrentUser() 

  if (!isUserAuthenticated || !userData || userData.permission !== 'admin') {
    return (
      <AccessDenied
        message="Bu sayfaya erişmek için admin yetkisine sahip olmalısınız."
        redirectPath="/"
      />
    )
  }

  return element
}

export default AdminRoute
