# Music Player - Electron App

A beautiful, minimalistic music player with a purple dark theme built with Electron, HTML, CSS, and JavaScript.

## Features

- 🎵 Play local audio files (MP3, WAV, OGG, FLAC, M4A, AAC)
- 🎨 Beautiful purple gradient design
- 🌙 Dark mode interface
- 🔊 Volume control
- ⏯️ Play/Pause/Stop controls
- 📊 Progress bar with time display
- 💿 Automatic album cover extraction from audio files
- 🎼 Displays song title and artist from metadata

## Setup Instructions

### 1. Install Node.js
Make sure you have Node.js installed on your computer. Download it from [nodejs.org](https://nodejs.org/)

### 2. Install Dependencies
Open a terminal/command prompt in the `electron` folder and run:

```bash
npm install
```

This will install Electron and all necessary dependencies.

### 3. Run the Application

To start the music player, run:

```bash
npm start
```

For development mode with logging:

```bash
npm run dev
```

## How to Use

1. Click the **download/folder icon** button to open a file dialog
2. Select an audio file from your computer
3. Click the large **play button** in the center to play the music
4. Use the **square button** to stop playback
5. Adjust volume using the slider at the bottom
6. Drag the progress bar to seek to different parts of the song

## File Structure

```
electron/
├── index.html      # Main HTML structure
├── styles.css      # All styling (purple theme)
├── script.js       # JavaScript functionality
├── main.js         # Electron main process
├── preload.js      # Electron preload script for security
├── package.json    # Project configuration
└── README.md       # This file
```

## Packaging for Distribution

To create an executable app for distribution:

### Install electron-builder

```bash
npm install --save-dev electron-builder
```

### Add to package.json

Add these scripts to `package.json`:

```json
"scripts": {
  "start": "electron .",
  "dev": "electron . --enable-logging",
  "build": "electron-builder"
},
"build": {
  "appId": "com.musicplayer.app",
  "productName": "Music Player",
  "directories": {
    "output": "dist"
  },
  "win": {
    "target": "nsis",
    "icon": "icon.ico"
  },
  "mac": {
    "target": "dmg",
    "icon": "icon.icns"
  },
  "linux": {
    "target": "AppImage",
    "icon": "icon.png"
  }
}
```

### Build

```bash
npm run build
```

This will create platform-specific installers in the `dist` folder.

## Customization

### Colors
All colors are defined in `styles.css`. The main purple color is `rgb(159, 140, 224)`. You can change this and other colors to customize the theme.

### Window Size
Edit `main.js` and change the `width` and `height` in the `createWindow()` function.

## Browser Testing

You can also test the UI in a web browser by simply opening `index.html` in your browser. The file dialog will use the browser's file picker instead of Electron's native dialog.

## Troubleshooting

**App won't start:**
- Make sure you ran `npm install`
- Check that Node.js is properly installed
- Try deleting `node_modules` folder and running `npm install` again

**No sound:**
- Check your system volume
- Make sure the audio file format is supported
- Try a different audio file

**File dialog doesn't open:**
- Make sure all files (main.js, preload.js) are in the same directory
- Check the console for errors (run with `npm run dev`)

## License

MIT
