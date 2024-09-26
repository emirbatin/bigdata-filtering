import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  useEffect(() => {
    ipcRenderer.on('update_available', () => {
      setUpdateAvailable(true);
    });

    ipcRenderer.on('update_downloaded', () => {
      setUpdateDownloaded(true);
    });

    return () => {
      ipcRenderer.removeAllListeners('update_available');
      ipcRenderer.removeAllListeners('update_downloaded');
    };
  }, []);

  const restartApp = () => {
    ipcRenderer.send('restart_app');
  };

  if (updateDownloaded) {
    return (
      <div>
        <h2>Güncelleme hazır!</h2>
        <p>Yeni bir güncelleme indirildi. Uygulamayı yeniden başlatarak güncellemeleri yükleyebilirsiniz.</p>
        <button onClick={restartApp}>Yeniden Başlat</button>
      </div>
    );
  }

  if (updateAvailable) {
    return (
      <div>
        <h2>Güncelleme mevcut</h2>
        <p>Yeni bir güncelleme indiriliyor...</p>
      </div>
    );
  }

  return null;
};

export default UpdateNotification;