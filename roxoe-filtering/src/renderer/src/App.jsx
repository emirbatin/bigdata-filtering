import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LoginView from './views/LoginView'
import AdminView from './views/AdminView'
import ProtectedRoute from './utils/ProtectedRoute'
import AdminRoute from './utils/AdminRoute'
import DataTableView from './views/DataTableView'
import UploadFileView from './views/UploadDataView'
import UserManagementView from './views/UserManagementView'

function App() {
  return (
    <Router>
      <Routes>
        {/* Herkesin erişebileceği login sayfası */}
        <Route path="/login" element={<LoginView />} />
        <Route path="/" element={<LoginView/>} />

        {/* ProtectedRoute ile sadece giriş yapmış kullanıcıların erişebileceği rota */}
        <Route path="/data" element={<ProtectedRoute element={<DataTableView />} />} />

        {/* Sadece admin kullanıcılarının erişebileceği rota */}
        <Route path="/admin" element={<AdminRoute element={<AdminView />} />} />
        <Route path="/uploadfile" element={<AdminRoute element={<UploadFileView />} />} />
        <Route path="/usermanagement" element={<AdminRoute element={<UserManagementView />} />} />
        <Route path="/settings" element={<AdminRoute element={<AdminView />} />} />
      </Routes>
    </Router>
  )
}

export default App
