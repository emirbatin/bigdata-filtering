import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater' // Güncellemeleri kontrol etmek için eklendi
import icon from '../../resources/icon.png?asset'

let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    scrollBounce: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer based on electron-vite CLI.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Uygulama hazır olduğunda çalışacak
app.whenReady().then(() => {
  createWindow()

  // Güncellemeleri kontrol et ve kullanıcılara bildir
  autoUpdater.checkForUpdatesAndNotify()

  // Güncelleme mevcut olduğunda renderer sürecine mesaj gönder
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available')
  })

  // Güncelleme indirildiğinde renderer sürecine mesaj gönder
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded')
  })

  // Kullanıcı uygulamayı yeniden başlatmak istediğinde
  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall()
  })

  // macOS'te uygulama yeniden etkinleştirildiğinde pencereyi yeniden oluştur
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Tüm pencereler kapatıldığında uygulamayı kapat (macOS hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
