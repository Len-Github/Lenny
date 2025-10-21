// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const openFileBtn = document.getElementById('open-file-btn');
const progressSlider = document.getElementById('progress-slider');
const volumeSlider = document.getElementById('volume-slider');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const volumeText = document.getElementById('volume-text');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const iconPlay = document.querySelector('.icon-play');
const iconPause = document.querySelector('.icon-pause');
const albumArt = document.getElementById('album-art');
const albumPlaceholder = document.getElementById('album-placeholder');

// State
let isPlaying = false;
let isDraggingProgress = false;

// Format time helper
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update progress slider fill
function updateProgressSliderFill(value) {
    const percentage = value;
    progressSlider.style.background = `linear-gradient(to right, rgb(159, 140, 224) 0%, rgb(159, 140, 224) ${percentage}%, rgb(58, 55, 76) ${percentage}%, rgb(58, 55, 76) 100%)`;
}

// Update volume slider fill
function updateVolumeSliderFill(value) {
    const percentage = value;
    volumeSlider.style.background = `linear-gradient(to right, rgb(159, 140, 224) 0%, rgb(159, 140, 224) ${percentage}%, rgb(58, 55, 76) ${percentage}%, rgb(58, 55, 76) 100%)`;
}

// Open File Dialog (for Electron)
openFileBtn.addEventListener('click', async () => {
    // Check if we're in Electron
    if (window.electron) {
        const filePath = await window.electron.openFileDialog();
        if (filePath) {
            await loadAudioFile(filePath);
        }
    } else {
        // Fallback for browser testing
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                await loadAudioFile(url, file, file.name);
            }
        };
        input.click();
    }
});

// Load Audio File
async function loadAudioFile(filePath, file = null, fileName = null) {
    audioPlayer.src = filePath;
    
    // Try to extract metadata in Electron
    if (window.electron && window.electron.getMetadata) {
        try {
            const metadata = await window.electron.getMetadata(filePath);
            
            // Update song info
            songTitle.textContent = metadata.title;
            songArtist.textContent = metadata.artist;
            
            // Update album art
            if (metadata.albumArt) {
                albumArt.src = metadata.albumArt;
                albumArt.style.display = 'block';
                albumPlaceholder.style.display = 'none';
            } else {
                // No album art, show placeholder
                albumArt.style.display = 'none';
                albumPlaceholder.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error loading metadata:', error);
            // Fallback to filename
            setFallbackInfo(filePath, fileName);
        }
    } else if (file) {
        // Browser mode - try to extract metadata using jsmediatags
        try {
            await loadMetadataFromFile(file);
        } catch (error) {
            console.error('Error loading metadata in browser:', error);
            setFallbackInfo(filePath, fileName);
        }
    } else {
        // Fallback to filename
        setFallbackInfo(filePath, fileName);
    }
    
    audioPlayer.load();
}

// Fallback info when metadata extraction fails
function setFallbackInfo(filePath, fileName) {
    if (fileName) {
        const name = fileName.replace(/\.[^/.]+$/, '');
        songTitle.textContent = name;
        songArtist.textContent = 'Unknown Artist';
    } else {
        songTitle.textContent = filePath.split('/').pop().replace(/\.[^/.]+$/, '');
        songArtist.textContent = 'Unknown Artist';
    }
    albumArt.style.display = 'none';
    albumPlaceholder.style.display = 'flex';
}

// Load metadata from file in browser (using jsmediatags if available)
async function loadMetadataFromFile(file) {
    // This is a placeholder for browser-based metadata extraction
    // You would need to include jsmediatags library for this to work in browser
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    songTitle.textContent = fileName;
    songArtist.textContent = 'Unknown Artist';
    albumArt.style.display = 'none';
    albumPlaceholder.style.display = 'flex';
}

// Play/Pause Toggle
playBtn.addEventListener('click', () => {
    if (!audioPlayer.src) {
        return;
    }

    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
});

// Stop Button
stopBtn.addEventListener('click', () => {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    isPlaying = false;
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
});

// Audio Events
audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
});

audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
});

audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
    progressSlider.max = audioPlayer.duration;
});

audioPlayer.addEventListener('timeupdate', () => {
    if (!isDraggingProgress) {
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
        progressSlider.value = audioPlayer.currentTime;
        updateProgressSliderFill(percentage);
    }
});

audioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
    audioPlayer.currentTime = 0;
});

// Progress Slider
progressSlider.addEventListener('mousedown', () => {
    isDraggingProgress = true;
});

progressSlider.addEventListener('mouseup', () => {
    isDraggingProgress = false;
});

progressSlider.addEventListener('input', (e) => {
    if (audioPlayer.src) {
        const percentage = (e.target.value / audioPlayer.duration) * 100 || 0;
        updateProgressSliderFill(percentage);
        currentTimeEl.textContent = formatTime(e.target.value);
    }
});

progressSlider.addEventListener('change', (e) => {
    if (audioPlayer.src) {
        audioPlayer.currentTime = e.target.value;
    }
});

// Volume Slider
volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value;
    audioPlayer.volume = volume / 100;
    volumeText.textContent = `${volume}%`;
    updateVolumeSliderFill(volume);
});

// Initialize volume
audioPlayer.volume = 0.7;
updateVolumeSliderFill(70);
updateProgressSliderFill(0);

// Window control buttons
document.getElementById('minimize-btn').addEventListener('click', () => {
    if (window.electronAPI) {
        window.electronAPI.minimize();
    }
});

document.getElementById('close-btn').addEventListener('click', () => {
    if (window.electronAPI) {
        window.electronAPI.close();
    }
});
