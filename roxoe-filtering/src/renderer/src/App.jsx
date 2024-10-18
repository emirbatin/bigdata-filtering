import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginView from './views/LoginView';
import AdminView from './views/AdminView';
import ProtectedRoute from './utils/ProtectedRoute';
import AdminRoute from './utils/AdminRoute';
import DataTableView from './views/DataTableView';
import UploadFileView from './views/UploadDataView';
import UserManagementView from './views/UserManagementView';
import UpdateNotification from './components/UpdateNotification'; // Güncelleme bileşenini içe aktarıyoruz

function App() {
  useEffect(() => {
    if (window.api) {
      console.log('API is loaded and available:', window.api);
    } else {
      console.error('API is not loaded');
    }

    if (window.electron) {
      console.log('Electron API is loaded and available:', window.electron);
    } else {
      console.error('Electron API is not loaded');
    }
  }, []);

  useEffect(() => {
    if (window.api) {
      window.api.send('restart_app', 'Testing IPC message');
      console.log('Sent a test message through IPC');
    } else {
      console.error('API is not loaded, cannot send IPC message');
    }
  }, []);

  console.log('App component is rendering'); // App bileşeninin render edildiğini kontrol etmek için log ekliyoruz

  return (
    <Router>
      <div>
        {/* Güncelleme bildirim bileşeni */}
        <UpdateNotification />

        <Routes>
          {/* Herkesin erişebileceği login sayfası */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/" element={<LoginView />} />

          {/* ProtectedRoute ile sadece giriş yapmış kullanıcıların erişebileceği rota */}
          <Route path="/data" element={<ProtectedRoute element={<DataTableView />} />} />

          {/* Sadece admin kullanıcılarının erişebileceği rota */}
          <Route path="/admin" element={<AdminRoute element={<AdminView />} />} />
          <Route path="/uploadfile" element={<AdminRoute element={<UploadFileView />} />} />
          <Route path="/usermanagement" element={<AdminRoute element={<UserManagementView />} />} />
          <Route path="/settings" element={<AdminRoute element={<AdminView />} />} />

          {/* Varsayılan olarak login sayfasına yönlendirin */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
