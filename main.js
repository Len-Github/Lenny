const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;


let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 800,
        backgroundColor: '#00000000',
        transparent: true,
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        resizable: true,
        frame: false,
        titleBarStyle: 'hidden',
        alwaysOnTop: false
    });

    mainWindow.loadFile('index.html');

    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle file dialog
ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

ipcMain.on('window-minimize', () => {
    mainWindow.minimize();
});

ipcMain.on('window-close', () => {
    mainWindow.close();
});

// Handle metadata extraction
ipcMain.handle('get-metadata', async (event, filePath) => {
    try {
        const { parseFile } = await import('music-metadata');
        const metadata = await parseFile(filePath);
        
        let albumArt = null;
        if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            const base64 = picture.data.toString('base64');
            albumArt = `data:${picture.format};base64,${base64}`;
        }
        
        return {
            title: metadata.common.title || path.basename(filePath, path.extname(filePath)),
            artist: metadata.common.artist || 'Unknown Artist',
            album: metadata.common.album || 'Unknown Album',
            albumArt: albumArt
        };
    } catch (error) {
        console.error('Error extracting metadata:', error);
        return {
            title: path.basename(filePath, path.extname(filePath)),
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            albumArt: null
        };
    }
});
