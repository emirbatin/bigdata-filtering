import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Backend URL Ayarı (Geliştirme ve Üretim İçin)
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : 'https://api.yourdomain.com';

// Custom APIs for renderer
const api = {
  send: (channel, data) => {
    let validChannels = ['restart_app', 'custom_action'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`Channel '${channel}' is not permitted.`);
    }
  },
  on: (channel, func) => {
    let validChannels = ['update_available', 'update_downloaded', 'custom_event'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    } else {
      console.warn(`Channel '${channel}' is not permitted for listening.`);
    }
  },
  removeAllListeners: (channel) => {
    let validChannels = ['update_available', 'update_downloaded'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    } else {
      console.warn(`Channel '${channel}' is not permitted for removing listeners.`);
    }
  }
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', {
      getApiUrl: () => API_URL,
      send: api.send,
      on: api.on,
      removeAllListeners: api.removeAllListeners,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('contextBridge is used with context isolation enabled');
    }
  } catch (error) {
    console.error('Error exposing APIs with contextBridge:', error);
  }
} else {
  window.electron = electronAPI;
  window.api = {
    getApiUrl: () => API_URL,
    send: api.send,
    on: api.on,
    removeAllListeners: api.removeAllListeners,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('contextBridge is not used, directly exposing APIs to window');
  }
}
