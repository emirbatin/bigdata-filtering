import React, { useState } from 'react'
import { Alert, AlertTitle, AlertDescription } from '../components/Alert'
import { CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const LoginView = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, alertInfo } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    await login(username, password)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Giriş Yap</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-600">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 px-4 py-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Kullanıcı adınızı girin"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-600">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 px-4 py-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Şifrenizi girin"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
          >
            Giriş Yap
          </button>
        </form>
        <div className='mt-6'>
          {alertInfo.show && (
            <Alert variant={alertInfo.type} className="mb-4">
              {alertInfo.type === 'default' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>{alertInfo.type === 'default' ? 'Başarılı' : 'Hata'}</AlertTitle>
              <AlertDescription>{alertInfo.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginView
