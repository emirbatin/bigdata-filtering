import React, { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  useEffect(() => {
    window.api.on('update_available', () => {
      setUpdateAvailable(true);
    });
    window.api.on('update_downloaded', () => {
      setUpdateDownloaded(true);
    });
    return () => {
      window.api.removeAllListeners('update_available');
      window.api.removeAllListeners('update_downloaded');
    };
  }, []);

  const restartApp = () => {
    window.api.send('restart_app');
  };

  if (updateDownloaded) {
    return (
      <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
          <RefreshCw className="w-5 h-5 mr-2 text-green-500" />
          Güncelleme hazır!
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Yeni bir güncelleme indirildi. Uygulamayı yeniden başlatarak güncellemeyi yükleyebilirsiniz.
        </p>
        <button
          onClick={restartApp}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
        >
          Yeniden Başlat
        </button>
      </div>
    );
  }

  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
          <Download className="w-5 h-5 mr-2 text-blue-500" />
          Güncelleme mevcut
        </h2>
        <p className="text-sm text-gray-600">
          Yeni bir güncelleme indiriliyor...
        </p>
      </div>
    );
  }

  return null;
};

export default UpdateNotification;