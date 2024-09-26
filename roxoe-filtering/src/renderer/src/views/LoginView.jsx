import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '../components/Alert';
import { CheckCircle, XCircle } from 'lucide-react';
import { login, getCurrentUser, isAuthenticated } from '../services/authServices';

const LoginView = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localAlert, setLocalAlert] = useState({ show: false, type: 'default', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Eğer kullanıcı zaten giriş yapmışsa, yetkisine göre yönlendir
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      if (user.permission === 'admin') {
        navigate('/admin');
      } else {
        navigate('/data');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalAlert({ show: false, type: 'default', message: '' });

    // Backend login işlemi için authService'i kullanıyoruz
    const result = await login(username, password);

    if (result.success) {
      setLocalAlert({ show: true, type: 'default', message: 'Başarıyla giriş yaptınız' });

      // Kullanıcının token ve bilgilerini saklıyoruz
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data));

      // Kullanıcının yetkisine göre yönlendirme yapıyoruz
      const isAdmin = result.data.permission === 'admin';
      setTimeout(() => {
        navigate(isAdmin ? '/admin' : '/data');
      }, 1500);
    } else {
      setLocalAlert({ show: true, type: 'error', message: result.message });
    }

    setIsLoading(false);
  };

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
              className="mt-1 px-4 py-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="mt-1 px-4 py-2 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Şifrenizi girin"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <div className="mt-6">
          {localAlert.show && (
            <Alert variant={localAlert.type} className="mb-4">
              {localAlert.type === 'default' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>{localAlert.type === 'default' ? 'Başarılı' : 'Hata'}</AlertTitle>
              <AlertDescription>{localAlert.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;
