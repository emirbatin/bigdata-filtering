// src/preload/index.js

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  send: (channel, data) => {
    let validChannels = ['restart_app'] // İzin verilen kanallar
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  on: (channel, func) => {
    let validChannels = ['update_available', 'update_downloaded'] // İzin verilen kanallar
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  }
}

console.log('Preload script is loaded'); // Preload'ın yüklendiğini doğrulamak için log ekliyoruz

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api) // IPC fonksiyonlarını expose ediyoruz
    console.log('contextBridge is used with context isolation enabled');
  } catch (error) {
    console.error('Error exposing APIs with contextBridge:', error);
  }
} else {
  window.electron = electronAPI
  window.api = api
  console.log('contextBridge is not used, directly exposing APIs to window');
}
