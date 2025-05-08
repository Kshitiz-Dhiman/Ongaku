import { createContext, useEffect, useRef, useState } from 'react';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import axios from 'axios';

export const AudioPlayerData = createContext();

const AudioPlayerContext = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackTime, setTrackTime] = useState(0);

    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const [queue, setQueue] = useState([]);
    const {
        load,
        playing,
        togglePlayPause,
        getPosition,
        duration,
        volume,
        setVolume,
        seek,
        looping,
        loop
    } = useGlobalAudioPlayer();
    const queueRef = useRef([]);
    const [currentSongsList, setCurrentSongsList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const getRecommendations = async (songID) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song/recommend?id=${songID}`);
            const songData = response.data;
            setCurrentSongsList(songData.data);
            setQueue(songData.data);
            queueRef.current = songData.data;
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const playTrack = async (song, songId, addToQueue = true, songsList = null) => {
        try {
            localStorage.setItem('musicId', songId);

            // Set the current songs list
            if (songsList) {
                setCurrentSongsList(songsList);
                const index = songsList.findIndex(song => song.id === songId);
                setCurrentIndex(index);

                // Set the queue to be the remaining songs
                const remainingSongs = songsList.slice(index + 1);
                queueRef.current = remainingSongs;
                setQueue(remainingSongs);
            } else if (addToQueue) {
                // If no songsList provided, get recommendations
                await getRecommendations(songId);
                setCurrentIndex(0); // First song in recommendations
            }

            load(song, {
                autoplay: true,
                initialVolume: volume,
                crossOrigin: 'anonymous',
                format: 'mp3',
                onend: looping ? null : playNextSong, // Don't play next song if loop is enabled
                onplay: () => setIsPlaying(true)
            });
        } catch (error) {
            console.error('Error playing track:', error);
        }
    };

    const playNextSong = async () => {
        // Don't play next song if loop is enabled
        if (looping) return;

        try {
            if (currentSongsList.length > 0) {
                const nextIndex = currentIndex + 1;

                if (nextIndex < currentSongsList.length) {
                    // Play the next song in the list
                    const nextSong = currentSongsList[nextIndex];
                    setCurrentIndex(nextIndex);

                    // Update queue
                    const remainingSongs = currentSongsList.slice(nextIndex + 1);
                    queueRef.current = remainingSongs;
                    setQueue(remainingSongs);

                    // Fetch and play the song
                    const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${nextSong.id}`);
                    const songData = response.data;

                    setCurrentTrack({
                        id: songData.data.id,
                        title: songData.data.title,
                        subtitle: songData.data.artists?.primary?.map(artist => artist.name).join(", ") || songData.data.subtitle,
                        images: songData.data.images,
                        download_url: songData.data.download,
                        artists: songData.data.artists,
                        album: songData.data.album,
                        duration: songData.data.duration,
                        releaseDate: songData.data.releaseDate,
                        label: songData.data.label,
                        copyright: songData.data.copyright
                    });

                    load(songData.data.download[4].link, {
                        autoplay: true,
                        initialVolume: volume,
                        crossOrigin: 'anonymous',
                        format: 'mp3',
                        onend: looping ? null : playNextSong, // Don't play next song if loop is enabled
                        onplay: () => setIsPlaying(true)
                    });
                } else if (queueRef.current.length < 5) {
                    // If we're at the end of the list, get more recommendations
                    const lastSongId = currentSongsList[currentSongsList.length - 1].id;
                    await getRecommendations(lastSongId);
                    setCurrentIndex(0);
                    playNextSong(); // Try again with new recommendations
                }
            }
        } catch (error) {
            console.error('Error playing next song:', error);
        }
    };

    const playPreviousSong = async () => {
        // Don't play previous song if loop is enabled
        if (looping) return;

        try {
            if (currentSongsList.length > 0 && currentIndex > 0) {
                const prevIndex = currentIndex - 1;
                const prevSong = currentSongsList[prevIndex];
                setCurrentIndex(prevIndex);

                // Update queue to include current song and remaining songs
                const remainingSongs = currentSongsList.slice(prevIndex + 1);
                queueRef.current = remainingSongs;
                setQueue(remainingSongs);

                // Fetch and play the previous song
                const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${prevSong.id}`);
                const songData = response.data;

                setCurrentTrack({
                    id: prevSong.id,
                    title: prevSong.title,
                    subtitle: songData.data.artists?.primary?.map(artist => artist.name).join(", ") || prevSong.subtitle,
                    images: songData.data.images,
                    download_url: songData.data.download,
                    artists: songData.data.artists,
                    album: songData.data.album,
                    duration: songData.data.duration,
                    releaseDate: songData.data.releaseDate,
                    label: songData.data.label,
                    copyright: songData.data.copyright
                });

                load(songData.data.download[4].link, {
                    autoplay: true,
                    initialVolume: volume,
                    crossOrigin: 'anonymous',
                    format: 'mp3',
                    onend: playNextSong,
                    onplay: () => setIsPlaying(true)
                });
            }
        } catch (error) {
            console.error('Error playing previous song:', error);
        }
    };

    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

    const contextValue = {
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        trackTime,
        setTrackTime,
        duration,
        volume,
        setVolume,
        audioRef,
        progressRef,
        queue,
        setQueue,
        currentSongsList,
        currentIndex,
        playTrack,
        playNextSong,
        playPreviousSong,
        getRecommendations,
        looping,
        loop
    };


    useEffect(() => {
        if ('mediaSession' in navigator) {
            // Set metadata
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack?.title || 'Unknown Title',
                artist: currentTrack?.subtitle || 'Unknown Artist',
                album: currentTrack?.album?.name || 'Unknown Album',
                artwork: [
                    {
                        src: currentTrack?.images?.small || '',
                        sizes: '96x96',
                        type: 'image/jpeg'
                    },
                    {
                        src: currentTrack?.images?.medium || '',
                        sizes: '256x256',
                        type: 'image/jpeg'
                    },
                    {
                        src: currentTrack?.images?.large || '',
                        sizes: '512x512',
                        type: 'image/jpeg'
                    }
                ]
            });

            // Notify service worker about new track
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'INIT_MEDIA_SESSION',
                    track: {
                        id: currentTrack?.id,
                        title: currentTrack?.title,
                        artist: currentTrack?.subtitle,
                        artwork: currentTrack?.images?.medium
                    }
                });
            }

            // Listen for messages from the service worker
            const handleServiceWorkerMessage = (event) => {
                if (event.data && event.data.type === 'MEDIA_CONTROL') {
                    switch (event.data.action) {
                        case 'play':
                            if (!playing) togglePlayPause();
                            break;
                        case 'pause':
                            if (playing) togglePlayPause();
                            break;
                        case 'previoustrack':
                            playPreviousSong();
                            break;
                        case 'nexttrack':
                            playNextSong();
                            break;
                        case 'seekbackward':
                            seek(Math.max(getPosition() - 10, 0));
                            break;
                        case 'seekforward':
                            seek(Math.min(getPosition() + 10, duration || 0));
                            break;
                        default:
                            break;
                    }
                }
            };

            navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

            // Set action handlers
            navigator.mediaSession.setActionHandler('play', () => {
                if (!playing) {
                    togglePlayPause();
                }
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                if (playing) {
                    togglePlayPause();
                }
            });

            navigator.mediaSession.setActionHandler('previoustrack', playPreviousSong);
            navigator.mediaSession.setActionHandler('nexttrack', playNextSong);

            navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.fastSeek && 'fastSeek' in audioRef.current) {
                    audioRef.current.fastSeek(details.seekTime);
                    return;
                }

                seek(details.seekTime);
                navigator.mediaSession.setPositionState({
                    duration: duration || 0,
                    playbackRate: 1,
                    position: details.seekTime
                });
            });

            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const skipTime = details.seekOffset || 10;
                const newPosition = Math.max(getPosition() - skipTime, 0);
                seek(newPosition);
            });

            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const skipTime = details.seekOffset || 10;
                const newPosition = Math.min(getPosition() + skipTime, duration || 0);
                seek(newPosition);
            });

            // Update position state periodically
            const updatePositionState = () => {
                if (duration) {
                    navigator.mediaSession.setPositionState({
                        duration: duration,
                        playbackRate: 1,
                        position: getPosition()
                    });
                }
            };

            const positionUpdateInterval = setInterval(updatePositionState, 1000);

            return () => {
                clearInterval(positionUpdateInterval);
                navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
                const actions = ['play', 'pause', 'seekto', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack'];
                for (const action of actions) {
                    try {
                        navigator.mediaSession.setActionHandler(action, null);
                    } catch (error) {
                        console.warn(`${action} is not supported`);
                    }
                }
            };
        }
    }, [currentTrack, playing, togglePlayPause, duration, getPosition, playNextSong, playPreviousSong, seek]);
    return (
        <AudioPlayerData.Provider value={contextValue}>
            <audio ref={audioRef} type="audio/mpeg">
                <track kind="captions" />
            </audio>
            {children}
        </AudioPlayerData.Provider>
    );
};

export default AudioPlayerContext;
