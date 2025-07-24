document.addEventListener('DOMContentLoaded', () => {
    // Seleção de elementos do DOM
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

    // Variáveis de estado do player
    let playlist = []; // Array para armazenar os objetos de música
    let currentSongIndex = -1; // Índice da música atual na playlist (-1 significa nenhuma selecionada)
    let isPlaying = false; // Estado de reprodução (true: tocando, false: pausado)

    console.log('DOM Content Loaded. Initializing player.'); // Mensagem de inicialização

    // --- Funções Auxiliares ---

    // Função para formatar o tempo (ex: 0:00, 1:23)
    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // --- Funções do Player ---

    // Função para carregar uma música na tag <audio>
    const loadSong = (index) => {
        console.log(`Attempting to load song at index: ${index}`);
        if (index >= 0 && index < playlist.length) {
            currentSongIndex = index;
            const song = playlist[currentSongIndex];

            audioPlayer.src = song.url; // Define a URL da música para o player
            
            // Atualiza informações da música no card
            songTitle.textContent = song.name;
            songArtist.textContent = song.artist || 'Artista Desconhecido';
            albumArt.src = song.albumArt || 'assets/default-album-art.png'; // Garante o ícone/capa padrão

            // Remove a classe 'active' de todos os itens da playlist
            document.querySelectorAll('.playlist-item').forEach(item => {
                item.classList.remove('active');
            });
            // Adiciona a classe 'active' ao item da playlist atualmente selecionado
            const activePlaylistItem = document.querySelector(`.playlist-item[data-index="${currentSongIndex}"]`);
            if (activePlaylistItem) {
                activePlaylistItem.classList.add('active');
            }

            // Garante que os controles de progresso e volume estejam visíveis
            progressBarContainer.style.opacity = 1;
            volumeSlider.style.opacity = 1;

            // Se o player estava tocando antes de carregar uma nova música, tenta tocar novamente
            if (isPlaying) {
                audioPlayer.play().catch(error => {
                    console.error('Autoplay blocked during loadSong:', error);
                    isPlaying = false; // Define como pausado se o autoplay falhar
                    updatePlayPauseButton(); // Atualiza o botão
                    // Pode adicionar um feedback visual aqui para o usuário
                });
            } else {
                audioPlayer.load(); // Apenas carrega a música sem tocar
                updatePlayPauseButton(); // Garante que o botão mostre o estado correto
            }
            console.log(`Song loaded: ${song.name}`);
        } else {
            // Caso não haja música para carregar ou o índice seja inválido
            console.log('No song to load or index out of bounds. Resetting player state.');
            currentSongIndex = -1;
            audioPlayer.src = ''; // Limpa a fonte do player
            songTitle.textContent = 'Nenhuma Música Selecionada';
            songArtist.textContent = 'Artista Desconhecido';
            albumArt.src = 'assets/default-album-art.png'; // Garante o ícone/capa padrão
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

    // Função para atualizar o estado do botão play/pause
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

    // Função para tocar ou pausar a música
    const togglePlayPause = () => {
        console.log('Toggle Play/Pause called.');
        if (playlist.length === 0) {
            alert('Por favor, adicione músicas à playlist primeiro!');
            return;
        }

        if (currentSongIndex === -1) {
            // Se nenhuma música estiver selecionada, carrega a primeira e tenta tocar
            loadSong(0);
            isPlaying = true; // Assume que vai tocar
            audioPlayer.play().catch(error => {
                console.error('Autoplay blocked on initial play:', error);
                isPlaying = false; // Se falhou, define como pausado
                updatePlayPauseButton();
                // feedback para o usuário
            });
        } else {
            if (audioPlayer.paused) { // Se estiver pausado, tenta tocar
                isPlaying = true;
                audioPlayer.play().catch(error => {
                    console.error('Autoplay blocked:', error);
                    isPlaying = false; // Se falhou, define como pausado
                    updatePlayPauseButton();
                    // feedback para o usuário
                });
            } else { // Se estiver tocando, pausa
                isPlaying = false;
                audioPlayer.pause();
            }
        }
        updatePlayPauseButton(); // Sempre atualiza o botão após a tentativa
        console.log(`Playback state: ${isPlaying ? 'Playing' : 'Paused'}`);
    };

    // Função para tocar a próxima música na playlist
    const playNextSong = () => {
        console.log('Next song clicked.');
        if (playlist.length > 0) {
            let nextIndex = currentSongIndex + 1;
            if (nextIndex >= playlist.length) {
                nextIndex = 0; // Volta para o início da playlist se for a última música
            }
            // Garante que o estado seja de tocando ao passar para a próxima música
            isPlaying = true; 
            loadSong(nextIndex);
        } else {
            console.log('Playlist is empty, cannot play next song.');
            loadSong(-1); // Reseta o player se não houver mais músicas
        }
    };

    // Função para tocar a música anterior na playlist
    const playPrevSong = () => {
        console.log('Previous song clicked.');
        if (playlist.length > 0) {
            let prevIndex = currentSongIndex - 1;
            if (prevIndex < 0) {
                prevIndex = playlist.length - 1; // Volta para o final da playlist se for a primeira
            }
            // Garante que o estado seja de tocando ao voltar para a música anterior
            isPlaying = true; 
            loadSong(prevIndex);
        } else {
            console.log('Playlist is empty, cannot play previous song.');
            loadSong(-1); // Reseta o player se não houver mais músicas
        }
    };

    // Função para renderizar a playlist na interface
    const renderPlaylist = () => {
        console.log('Rendering playlist...');
        playlistList.innerHTML = ''; // Limpa a lista atual no HTML

        if (playlist.length === 0) {
            // Se a playlist está vazia, exibe a mensagem "Adicione músicas para começar!"
            console.log('Playlist is empty. Displaying empty message.');
            const emptyMessage = document.createElement('li');
            emptyMessage.classList.add('empty-playlist-message');
            emptyMessage.textContent = 'Adicione músicas para começar!';
            playlistList.appendChild(emptyMessage);
        } else {
            // Se há músicas, itera sobre elas e as adiciona à lista
            console.log(`Rendering ${playlist.length} songs.`);
            // Remove a mensagem de playlist vazia se houver músicas
            const existingEmptyMessage = document.querySelector('.empty-playlist-message');
            if (existingEmptyMessage) {
                existingEmptyMessage.remove();
            }

            playlist.forEach((song, index) => {
                const listItem = document.createElement('li');
                listItem.classList.add('playlist-item');
                if (index === currentSongIndex) {
                    listItem.classList.add('active'); // Marca a música atual como ativa
                }
                listItem.setAttribute('data-index', index); // Adiciona o índice como atributo de dado para fácil acesso

                // Ícone para música local
                const icon = '<i class="fas fa-music local-icon"></i>';

                // Cria o conteúdo do item da playlist
                listItem.innerHTML = `
                    ${icon}
                    <span>${song.name} - ${song.artist || 'Desconhecido'}</span>
                    <span class="duration">${formatTime(song.duration)}</span>
                `;
                playlistList.appendChild(listItem);
            });
        }
    };

    // --- Event Listeners ---

    // Event Listener para o input de arquivo (quando o usuário seleciona arquivos)
    fileInput.addEventListener('change', (event) => {
        console.log('File input change event fired.');
        const files = event.target.files; // Obtém os arquivos selecionados
        console.log('Selected files:', files);

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
                    console.log(`Added to playlist: ${songName}`);
                } else {
                    console.warn(`Skipping non-audio file: ${file.name} (${file.type})`);
                }
            });
            renderPlaylist();

            if (currentSongIndex === -1 && playlist.length > 0) {
                loadSong(0); // Carrega a primeira música, mas não inicia o play automaticamente
            }
            console.log('Playlist updated after file selection.');
        } else {
            console.log('No files selected or files array is empty.');
        }
    });

    // Event Listener para tocar uma música da playlist ao clicar nela
    playlistList.addEventListener('click', (event) => {
        const listItem = event.target.closest('.playlist-item');
        if (listItem) {
            const index = parseInt(listItem.dataset.index);
            console.log(`Playlist item clicked. Index: ${index}`);
            if (index !== currentSongIndex) {
                // Se clicou em uma música diferente, carrega e toca
                isPlaying = true; // Assume que a intenção é tocar
                loadSong(index);
            } else if (index === currentSongIndex) {
                // Se clicou na mesma música, alterna play/pause
                togglePlayPause();
            }
        }
    });

    // Event Listeners para os botões de controle do player
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevSong);
    nextBtn.addEventListener('click', playNextSong);

    // Event Listener para atualização do tempo do áudio
    audioPlayer.addEventListener('timeupdate', () => {
        if (!isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = `${progress}%`;
            currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
        }
    });

    // Event Listener quando os metadados da música são carregados
    audioPlayer.addEventListener('loadedmetadata', () => {
        console.log(`Metadata loaded for current song. Duration: ${audioPlayer.duration}`);
        totalTimeSpan.textContent = formatTime(audioPlayer.duration);

        const activePlaylistItemDurationSpan = document.querySelector(`.playlist-item[data-index="${currentSongIndex}"] .duration`);
        if (activePlaylistItemDurationSpan) {
            activePlaylistItemDurationSpan.textContent = formatTime(audioPlayer.duration);
        }
        if (currentSongIndex !== -1 && playlist[currentSongIndex]) {
            playlist[currentSongIndex].duration = audioPlayer.duration;
        }
    });

    // Event Listener quando a música termina
    audioPlayer.addEventListener('ended', () => {
        console.log('Current song ended. Playing next song.');
        playNextSong(); // Toca a próxima música automaticamente
    });

    // Event Listener para controle de volume
    volumeSlider.addEventListener('input', () => {
        audioPlayer.volume = volumeSlider.value;
        console.log(`Volume set to: ${audioPlayer.volume}`);
    });

    // Event Listener para pular na música clicando na barra de progresso
    progressBarContainer.addEventListener('click', (event) => {
        if (audioPlayer.duration > 0) {
            const width = progressBarContainer.clientWidth;
            const clickX = event.offsetX;
            const duration = audioPlayer.duration;
            audioPlayer.currentTime = (clickX / width) * duration;
            console.log(`Seeked to: ${formatTime(audioPlayer.currentTime)}`);
        } else {
            console.log('Cannot seek, song duration not available.');
        }
    });

    // --- Atalhos de Teclado ---
    document.addEventListener('keydown', (event) => {
        const seekAmount = 5; // Pular 5 segundos

        if (playlist.length === 0 || currentSongIndex === -1) {
            // Não faz nada se a playlist estiver vazia ou nenhuma música selecionada
            return;
        }

        switch (event.key) {
            case 'ArrowLeft': // Tecla de seta para a esquerda
                event.preventDefault(); // Evita rolagem da página
                audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - seekAmount);
                console.log(`Rewound by ${seekAmount}s to: ${formatTime(audioPlayer.currentTime)}`);
                break;
            case 'ArrowRight': // Tecla de seta para a direita
                event.preventDefault(); // Evita rolagem da página
                audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + seekAmount);
                console.log(`Forwarded by ${seekAmount}s to: ${formatTime(audioPlayer.currentTime)}`);
                break;
            case ' ': // Barra de espaço
                event.preventDefault(); // Evita rolagem da página
                togglePlayPause();
                break;
            // Adicionar outros atalhos aqui se necessário (ex: 'm' para mute)
        }
    });

    // Renderiza a playlist inicial (geralmente vazia) ao carregar a página
    renderPlaylist();
    console.log('Player initialized.');
});