import axios from 'axios'
import { API_URL } from '../main'

// Login function
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/user/login`, {
      username,
      password
    })
    const { data } = response

    localStorage.setItem('token', data.token)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem(
      'user',
      JSON.stringify({
        _id: data._id,
        username: data.username,
        fullName: data.fullName,
        profilePhoto: data.profilePhoto,
        permission: data.permission
      })
    )

    return { success: true, data }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Login failed' }
  }
}

// Logout function
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  return !!token
}

// Get current user info
export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// Check token validity
export const checkTokenValidity = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    return false
  }

  try {
    const response = await axios.get(`${API_URL}/api/v1/user/check-token`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.data.valid) {
      // Update user data in localStorage if it has changed
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data.valid
  } catch (error) {
    console.error('Token validation error:', error)
    if (error.response && error.response.status === 401) {
      // Token is invalid, try to refresh it
      const refreshResult = await refreshToken()
      if (refreshResult.success) {
        return true
      }
    }
    return false
  }
}

// Refresh token
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    const response = await axios.post(`${API_URL}/api/v1/user/refresh-token`, {
      token: refreshToken
    })
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('refreshToken', response.data.refreshToken)
    return { success: true, token: response.data.token }
  } catch (error) {
    console.error('Token refresh failed:', error)
    logout() // Force logout if refresh fails
    return { success: false, message: error.response?.data?.message || 'Token refresh failed' }
  }
}

// Get all users (for admin)
export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/api/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch users' }
  }
}

// Change user password
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post(
      `${API_URL}/api/v1/user/change-password`,
      { oldPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    return { success: true, message: 'Password changed successfully' }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Password change failed' }
  }
}

// Deactivate user
export const deactivateUser = async (userId) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.put(
      `${API_URL}/api/v1/user/deactivate/${userId}`,
      { status: 'inactive' },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    return { success: true, message: 'User deactivated successfully' }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'User deactivation failed' }
  }
}

// Activate user
export const activateUser = async (userId) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.put(
      `${API_URL}/api/v1/user/activate/${userId}`,
      { status: 'active' },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    return { success: true, message: 'User activated successfully' }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'User activation failed' }
  }
}

// Create new user
export const createUser = async (userData) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post(`${API_URL}/api/v1/user/create`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return {
      success: true,
      message: 'User created successfully',
      data: response.data.user,
      tempPassword: response.data.tempPassword
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'User creation failed' }
  }
}

// Update user information
export const editUser = async (userId, userData) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.put(`${API_URL}/api/v1/user/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return {
      success: true,
      message: 'User updated successfully',
      data: response.data
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'User update failed' }
  }
}

// Add an interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshResult = await refreshToken()
      if (refreshResult.success) {
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token')
        return axios(originalRequest)
      }
    }
    return Promise.reject(error)
  }
)
