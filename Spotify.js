document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeSpan = document.getElementById('current-time');
    const totalTimeSpan = document.getElementById('total-time');
    const albumArt = document.getElementById('album-art');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const fileInput = document.getElementById('file-input');
    const playlistList = document.getElementById('playlist-list');

    let playlist = [];
    let currentSongIndex = -1;
    let isPlaying = false;

    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const loadSong = (index) => {
        if (index >= 0 && index < playlist.length) {
            currentSongIndex = index;
            const song = playlist[currentSongIndex];

            audioPlayer.src = song.url;
            songTitle.textContent = song.name;
            songArtist.textContent = song.artist || 'Artista Desconhecido';
            albumArt.src = song.albumArt || 'assets/default-album-art.png';

            document.querySelectorAll('.playlist-item').forEach(item => {
                item.classList.remove('active');
            });
            const activePlaylistItem = document.querySelector(`.playlist-item[data-index="${currentSongIndex}"]`);
            if (activePlaylistItem) {
                activePlaylistItem.classList.add('active');
            }

            progressBarContainer.style.opacity = 1;
            volumeSlider.style.opacity = 1;

            if (isPlaying) {
                audioPlayer.play().catch(error => {
                    console.error('Autoplay blocked during loadSong:', error);
                    isPlaying = false;
                    updatePlayPauseButton();
                });
            } else {
                audioPlayer.load();
                updatePlayPauseButton();
            }
        } else {
            currentSongIndex = -1;
            audioPlayer.src = '';
            songTitle.textContent = 'Nenhuma Música Selecionada';
            songArtist.textContent = 'Artista Desconhecido';
            albumArt.src = 'assets/default-album-art.png';
            isPlaying = false;
            updatePlayPauseButton();
            progressBar.style.width = '0%';
            currentTimeSpan.textContent = '0:00';
            totalTimeSpan.textContent = '0:00';
            document.querySelectorAll('.playlist-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    };

    const updatePlayPauseButton = () => {
        if (isPlaying) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playPauseBtn.classList.remove('play');
            playPauseBtn.classList.add('pause');
        } else {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            playPauseBtn.classList.remove('pause');
            playPauseBtn.classList.add('play');
        }
    };

    const togglePlayPause = () => {
        if (playlist.length === 0) {
            alert('Por favor, adicione músicas à playlist primeiro!');
            return;
        }

        if (currentSongIndex === -1) {
            loadSong(0);
            isPlaying = true;
            audioPlayer.play().catch(error => {
                console.error('Autoplay blocked on initial play:', error);
                isPlaying = false;
                updatePlayPauseButton();
            });
        } else {
            if (audioPlayer.paused) {
                isPlaying = true;
                audioPlayer.play().catch(error => {
                    console.error('Autoplay blocked:', error);
                    isPlaying = false;
                    updatePlayPauseButton();
                });
            } else {
                isPlaying = false;
                audioPlayer.pause();
            }
        }
        updatePlayPauseButton();
    };

    const playNextSong = () => {
        if (playlist.length > 0) {
            let nextIndex = currentSongIndex + 1;
            if (nextIndex >= playlist.length) {
                nextIndex = 0;
            }
            isPlaying = true;
            loadSong(nextIndex);
        } else {
            loadSong(-1);
        }
    };

    const playPrevSong = () => {
        if (playlist.length > 0) {
            let prevIndex = currentSongIndex - 1;
            if (prevIndex < 0) {
                prevIndex = playlist.length - 1;
            }
            isPlaying = true;
            loadSong(prevIndex);
        } else {
            loadSong(-1);
        }
    };

    const renderPlaylist = () => {
        playlistList.innerHTML = '';

        if (playlist.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.classList.add('empty-playlist-message');
            emptyMessage.textContent = 'Adicione músicas para começar!';
            playlistList.appendChild(emptyMessage);
        } else {
            const existingEmptyMessage = document.querySelector('.empty-playlist-message');
            if (existingEmptyMessage) {
                existingEmptyMessage.remove();
            }

            playlist.forEach((song, index) => {
                const listItem = document.createElement('li');
                listItem.classList.add('playlist-item');
                if (index === currentSongIndex) {
                    listItem.classList.add('active');
                }
                listItem.setAttribute('data-index', index);

                const icon = '<i class="fas fa-music local-icon"></i>';

                listItem.innerHTML = `
                    ${icon}
                    <span>${song.name} - ${song.artist || 'Desconhecido'}</span>
                    <span class="duration">${formatTime(song.duration)}</span>
                `;
                playlistList.appendChild(listItem);
            });
        }
    };

    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;

        if (files.length > 0) {
            Array.from(files).forEach(file => {
                if (file.type.startsWith('audio/')) {
                    const url = URL.createObjectURL(file);
                    const fileName = file.name.split('.').slice(0, -1).join('.');
                    let songName = fileName;
                    let songArtist = 'Artista Desconhecido';

                    if (fileName.includes(' - ')) {
                        const parts = fileName.split(' - ');
                        songArtist = parts[0].trim();
                        songName = parts.slice(1).join(' - ').trim();
                    }

                    playlist.push({
                        type: 'local',
                        name: songName,
                        artist: songArtist,
                        url: url,
                        file: file,
                        duration: 0
                    });
                }
            });
            renderPlaylist();

            if (currentSongIndex === -1 && playlist.length > 0) {
                loadSong(0);
            }
        }
    });

    playlistList.addEventListener('click', (event) => {
        const listItem = event.target.closest('.playlist-item');
        if (listItem) {
            const index = parseInt(listItem.dataset.index);
            if (index !== currentSongIndex) {
                isPlaying = true;
                loadSong(index);
            } else if (index === currentSongIndex) {
                togglePlayPause();
            }
        }
    });

    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevSong);
    nextBtn.addEventListener('click', playNextSong);

    audioPlayer.addEventListener('timeupdate', () => {
        if (!isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = `${progress}%`;
            currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
        }
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeSpan.textContent = formatTime(audioPlayer.duration);

        const activePlaylistItemDurationSpan = document.querySelector(`.playlist-item[data-index="${currentSongIndex}"] .duration`);
        if (activePlaylistItemDurationSpan) {
            activePlaylistItemDurationSpan.textContent = formatTime(audioPlayer.duration);
        }
        if (currentSongIndex !== -1 && playlist[currentSongIndex]) {
            playlist[currentSongIndex].duration = audioPlayer.duration;
        }
    });

    audioPlayer.addEventListener('ended', () => {
        playNextSong();
    });

    volumeSlider.addEventListener('input', () => {
        audioPlayer.volume = volumeSlider.value;
    });

    progressBarContainer.addEventListener('click', (event) => {
        if (audioPlayer.duration > 0) {
            const width = progressBarContainer.clientWidth;
            const clickX = event.offsetX;
            const duration = audioPlayer.duration;
            audioPlayer.currentTime = (clickX / width) * duration;
        }
    });

    document.addEventListener('keydown', (event) => {
        const seekAmount = 5;

        if (playlist.length === 0 || currentSongIndex === -1) {
            return;
        }

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - seekAmount);
                break;
            case 'ArrowRight':
                event.preventDefault();
                audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + seekAmount);
                break;
            case ' ':
                event.preventDefault();
                togglePlayPause();
                break;
        }
    });

    renderPlaylist();
});
