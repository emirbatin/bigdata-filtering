import React, { useEffect, useState, useCallback } from 'react'
import { Database, LogOut, UserPlus, Users, ClipboardList, Shield, CodeXml } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  logout as performLogout,
  getCurrentUser,
  checkTokenValidity
} from '../services/authServices' // logout fonksiyonu ve current user

const AdminView = () => {
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate()

  const menuItems = [
    {
      icon: Database,
      label: 'Veri Tablosu',
      description: 'Verilerinizi inceleyin, filtreleyin ve filtrelenmiş verileri indirin.',
      route: '/Data'
    },
    {
      icon: ClipboardList,
      label: 'Veri Yükle',
      description: 'Verilerinizi birden fazla dosya seçerek yükleyin ve sisteme entegre edin.',
      route: '/UploadFile'
    },
    {
      icon: CodeXml,
      label: 'Scriptler',
      description:
        'Büyük verisetleri üzerinde farklı işlemler ve düzenlemeler yapmak için özel geliştirilmiş scriptleri kullanın.',
      route: '/Settings'
    },
    {
      icon: Users,
      label: 'Kullanıcıları Yönet',
      description: 'Mevcut kullanıcıları yönetin, bilgileri güncelleyin ve ayarları yapılandırın.',
      route: '/UserManagement'
    }
  ]
  const validateTokenAndLoadUser = useCallback(async () => {
    try {
      const isValid = await checkTokenValidity();
      if (!isValid) {
        performLogout();
        navigate('/login');
        return;
      }
      
      const user = getCurrentUser();
      if (user) {
        setUserData(user);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error validating token or loading user:', error);
      performLogout();
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    validateTokenAndLoadUser();
  }, [validateTokenAndLoadUser]);

  const logout = () => {
    performLogout();
    navigate('/login');
  };

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center"><isLoading/></div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{userData.username.charAt(0).toUpperCase() + userData.username.slice(1)}</span>
            <button className="p-2 rounded-full bg-red-600 hover:bg-red-500" onClick={logout}>
              <LogOut className="h-5 w-5 text-white" />
            </button>
          </div>
        </header>
        <main className="flex flex-col justify-center items-center min-h-[70vh]">
          <div className="flex flex-col max-w-screen-md items-center">
            <h2 className="text-3xl font-bold mb-4">{userData.fullName}</h2>
            <p className="text-gray-600 mb-8">Admin Paneline Hoşgeldin</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(item.route)}
                  className="cursor-pointer bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center mb-4">
                    <item.icon className="h-8 w-8 text-orange-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">{item.label}</h3>
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminView
