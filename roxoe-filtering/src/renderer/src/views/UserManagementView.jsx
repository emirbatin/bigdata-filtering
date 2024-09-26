import React, { useState, useEffect, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { getAllUsers, createUser, deactivateUser, editUser, activateUser } from '../services/authServices'
import CustomButton from '../components/CustomButton'
import CustomIconButton from '../components/CustomIconButton'
import Modal from '../components/Modal'
import { Loader2, Plus, Edit, Trash2, Users, User, UserCheck,ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const UserManagementView = () => {
  const [users, setUsers] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setTableLoading(true)
    try {
      const response = await getAllUsers()
      setUsers(response.data)
    } catch (error) {
      showToast('Failed to fetch users', 'error')
    } finally {
      setTableLoading(false)
    }
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setTempPassword('')
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setTempPassword('')
    setShowModal(true)
  }

  const handleDeactivateUser = async (userId) => {
    try {
      await deactivateUser(userId)
      fetchUsers()
      showToast('User deactivated successfully')
    } catch (error) {
      showToast('Failed to deactivate user', 'error')
    }
  }

  const handleActivateUser = async (userId) => {
    try {
      await activateUser(userId)
      fetchUsers()
      showToast('User activated successfully')
    } catch (error) {
      showToast('Failed to activate user', 'error')
    }
  }

  const handleSaveUser = async (userData) => {
    try {
      let response;
      if (selectedUser) {
        response = await editUser(selectedUser._id, userData)
        showToast('User updated successfully')
        setShowModal(false)
      } else {
        response = await createUser(userData)
        setTempPassword(response.tempPassword)
        showToast('User created successfully')
        setShowModal(false)
        setTimeout(() => setShowModal(true), 0)
      }
      fetchUsers()
    } catch (error) {
      showToast(selectedUser ? 'Failed to update user' : 'Failed to create user', 'error')
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'User',
        field: 'username',
        cellRenderer: (params) => (
          <div className={`flex items-center space-x-3 h-full ${params.data.status === 'inactive' ? 'opacity-50' : ''}`}>
            {params.data.profilePhoto ? (
              <img
                src={params.data.profilePhoto}
                alt={`${params.value}'s avatar`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium text-sm leading-tight">{params.value}</span>
              <span className="text-xs text-gray-500 leading-tight">{params.data.fullName}</span>
            </div>
          </div>
        ),
        flex: 2,
        minWidth: 200,
        cellClass: 'ag-cell-center-content'
      },
      {
        headerName: 'Permission',
        field: 'permission',
        cellRenderer: (params) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              params.value === 'admin'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {params.value}
          </span>
        ),
        flex: 1,
        minWidth: 120,
        cellClass: 'ag-cell-center-content'
      },
      {
        headerName: 'Status',
        field: 'status',
        cellRenderer: (params) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              params.value === 'inactive'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {params.value}
          </span>
        ),
        flex: 1,
        minWidth: 120,
        cellClass: 'ag-cell-center-content'
      },
      {
        headerName: 'Actions',
        field: 'actions',
        cellRenderer: (params) => (
          <div className="flex items-center space-x-3 h-full">
            <CustomIconButton
              onClick={() => handleEditUser(params.data)}
              className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100"
              icon={Edit}
              iconSize={18}
              disabled={params.data.status === 'inactive'}
            />
            {params.data.status === 'active' ? (
              <CustomIconButton
                onClick={() => handleDeactivateUser(params.data._id)}
                className="p-1 bg-red-50 text-red-600 hover:bg-red-100"
                icon={Trash2}
                iconSize={18}
              />
            ) : (
              <CustomIconButton
                onClick={() => handleActivateUser(params.data._id)}
                className="p-1 bg-green-50 text-green-600 hover:bg-green-100"
                icon={UserCheck}
                iconSize={18}
              />
            )}
          </div>
        ),
        flex: 1,
        minWidth: 100,
        maxWidth: 120,
        cellClass: 'ag-cell-center-content'
      }
    ],
    []
  )

  const handleGoBack = () => {
    navigate('/Admin')
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
          <div>
          <CustomButton
            label="Kullanıcı Ekle"
            onClick={handleAddUser}
            icon={Plus}
            className="bg-green-600 text-white hover:bg-green-700 mr-4"
          />
         <CustomButton
            label="Geri Dön"
            onClick={handleGoBack}
            icon={ArrowLeft}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          />
          </div>
          
        </header>
        <div className="ag-theme-alpine w-full rounded-lg overflow-hidden shadow-lg">
          {tableLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : (
            <AgGridReact
              columnDefs={columnDefs}
              rowData={users}
              pagination
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              animateRows
              domLayout='autoHeight'
              rowHeight={60}
              headerHeight={48}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
            />
          )}
        </div>
      </div>
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setTempPassword('')
        }}
        onSave={handleSaveUser}
        user={selectedUser}
        tempPassword={tempPassword}
      />
      {toast.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md ${
          toast.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        } shadow-lg`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default UserManagementView