import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const useFetchUserData = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('Token bulunamadı.')
      return
    }
    try {
      const response = await fetch('/api/v1/user/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()
      setIsAdmin(data.permission === 'admin')
    } catch (error) {
      console.error('Veri çekme hatası:', error)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/v1/user/logout', { method: 'POST' })
      if (response.ok) {
        navigate('/')
      }
    } catch (error) {
      console.error('Çıkış hatası:', error)
    }
  }

  return { isAdmin, fetchUserData, handleLogout }
}

export default useFetchUserData
