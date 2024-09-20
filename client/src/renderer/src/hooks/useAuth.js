import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../main'

const useUserData = () => {
  const [userData, setUserData] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Token bulunamadı, kullanıcı doğrulanamıyor.')
      setIsLoading(false)
      return null
    }
    try {
      const response = await fetch(`${API_URL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        throw new Error('Kullanıcı verisi alınamadı')
      }
      const data = await response.json()
      setIsAdmin(data.permission === 'admin')
      localStorage.setItem('permission', data.permission)
      setUserData(data)
      setError(null)
      return data
    } catch (error) {
      setError('Kullanıcı verisi alınırken hata oluştu: ' + error.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!userData) {
      fetchUserData()
    }
  }, [fetchUserData, userData])

  return { userData, isAdmin, isLoading, error, fetchUserData }
}

const useLogin = (fetchUserData) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'default' })
  const navigate = useNavigate()

  const login = async (username, password) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/v1/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('permission', data.permission)
        setAlertInfo({
          show: true,
          message: 'Giriş başarılı! Yönlendiriliyorsunuz...',
          type: 'default'
        })
        await fetchUserData()
        setTimeout(() => {
          navigate(data.permission === 'admin' ? '/Admin' : '/DataTable')
        }, 2000)
        return true
      } else {
        setError(data.message || 'Giriş başarısız. Tekrar deneyin.')
        return false
      }
    } catch (error) {
      setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error, alertInfo }
}

const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const logout = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/v1/user/logout`, {
        method: 'POST'
      })
      if (!response.ok) {
        throw new Error('Çıkış işlemi başarısız.')
      }
    } catch (error) {
      setError('Çıkış işlemi sırasında hata oluştu: ' + error.message)
    } finally {
      localStorage.clear()
      setIsLoading(false)
      navigate('/', { replace: true })
    }
  }

  return { logout, isLoading, error }
}

export const useAuth = () => {
  const {
    userData,
    isAdmin,
    isLoading: userDataLoading,
    error: userDataError,
    fetchUserData
  } = useUserData()
  const { login, isLoading: loginLoading, error: loginError, alertInfo } = useLogin(fetchUserData)
  const { logout, isLoading: logoutLoading, error: logoutError } = useLogout()

  const isLoading = userDataLoading || loginLoading || logoutLoading
  const error = userDataError || loginError || logoutError

  const checkAuthStatus = useCallback(() => {
    if (!userData) {
      fetchUserData()
    }
  }, [userData, fetchUserData])

  return {
    isAdmin,
    login,
    logout,
    alertInfo,
    fetchUserData,
    checkAuthStatus,
    userData,
    isLoading,
    error
  }
}
