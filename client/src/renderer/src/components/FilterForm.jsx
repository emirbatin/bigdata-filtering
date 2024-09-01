import React, { useEffect, useState } from 'react';
import CustomButton from './CustomButton';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const FilterForm = () => {
  const [permission, setPermission] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and fetch user role
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1])); // Decode JWT token to get user data
      setPermission(user.permission); // Set the user role
    }
  }, []);

  const handleFilterClick = () => {
    console.log('Filter button clicked');
  };

  const handleAdminClick = () => {
    navigate('/Admin');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with filter inputs */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col p-6 flex-grow ml-64 transition-margin duration-300 ease-in-out">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Filtre Tablosu</h1>
          <div className="flex space-x-4">
            <CustomButton 
              label="Filter" 
              onClick={handleFilterClick} 
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" 
            />
            <CustomButton 
              label="Last 100" 
              onClick={handleFilterClick} 
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" 
            />
            {permission === 'admin' && (
              <CustomButton 
                label="Admin Panel" 
                onClick={handleAdminClick} 
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105" 
              />
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto">
          {/* Placeholder for main content */}
          <div className="text-center text-gray-600">
            <p className="text-lg">Görüntülenecek veri yok. Aramanızı başlatmak için kenar çubuğundaki filtreleri kullanın.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterForm;
