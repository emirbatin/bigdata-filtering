const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const { electronApp, optimizer, is } = require('@electron-toolkit/utils')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          click: () => {
            console.log('Open clicked')
          }
        },
        {
          label: 'Save',
          click: () => {
            console.log('Save clicked')
          }
        },
        {
          label: 'Export',
          click: () => {
            console.log('Save clicked')
          }
        },
        {
          label: 'Import',
          click: () => {
            console.log('Save clicked')
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
