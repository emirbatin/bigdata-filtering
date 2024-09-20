import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LoginView from './views/LoginView'
import AdminView from './views/AdminView'
import UploadFileView from './views/UploadFileView'
import DataTableView from './views/DataTableView'
import NoAccess from './components/NoAccess'
import ProtectedRoute from './utils/protectedRoute'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/Admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/UploadFile"
          element={
            <ProtectedRoute requireAdmin={true}>
              <UploadFileView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DataTable"
          element={
            <ProtectedRoute>
              <DataTableView />
            </ProtectedRoute>
          }
        />
        <Route path="/NoAccess" element={<NoAccess />} />
        <Route path="/" element={<LoginView />} />
      </Routes>
    </AuthProvider>
  )
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
)

export default AppWrapper
