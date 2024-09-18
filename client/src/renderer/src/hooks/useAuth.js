import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'default' })
  const navigate = useNavigate()

  const fetchUserData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('Token bulunamadı, kullanıcı doğrulanamıyor.')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Kullanıcı verisi alınamadı')
      }

      const data = await response.json()
      setIsAdmin(data.permission === 'admin')
    } catch (error) {
      console.error('Kullanıcı verisi alınırken hata oluştu:', error)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/login', {
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

        setTimeout(() => {
          navigate('/FilterForm')
        }, 2000)

        return true
      } else {
        setAlertInfo({
          show: true,
          message: data.message || 'Giriş başarısız. Tekrar deneyin.',
          type: 'destructive'
        })
        return false
      }
    } catch (error) {
      console.error('Error during login:', error)
      setAlertInfo({
        show: true,
        message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
        type: 'destructive'
      })
      return false
    }
  }

  const logout = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/logout', { method: 'POST' })
      if (response.ok) {
        console.log('Başarıyla çıkış yaptınız.')
        localStorage.removeItem('token') // Token ve yetki bilgilerini temizle
        localStorage.removeItem('permission')
        navigate('/')
      } else {
        console.log('Çıkış işlemi başarısız.')
      }
    } catch (error) {
      console.log('Çıkış işlemi sırasında hata oluştu.')
    }
  }

  return { isAdmin, login, logout, alertInfo, fetchUserData }
}
