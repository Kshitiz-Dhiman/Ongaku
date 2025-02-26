import { React, createContext, useEffect, useRef, useState } from 'react';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import axios from 'axios';

export const AudioPlayerData = createContext();

const AudioPlayerContext = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackTime, setTrackTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const [queue, setQueue] = useState([]);
    const { load } = useGlobalAudioPlayer();
    const queueRef = useRef([]);
    const [playHistory, setPlayHistory] = useState([]);
    const playHistoryRef = useRef([]);

    const getRecommendations = async (songID) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song/recommend?id=${songID}`);
            const songData = response.data;
            setQueue(prevQueue => [...prevQueue, ...songData.data]);
            queueRef.current = [...queueRef.current, ...songData.data];
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const playTrack = async (song, songId, addToQueue = true) => {
        console.log('Playing track:', song); // Debug log
        console.log('Song ID:', songId); // Debug log
        console.log("Add to queue:", addToQueue); // Debug log
        try {
            if (addToQueue) {
                queueRef.current = [];
                setQueue([]);
                playHistoryRef.current = [];
                setPlayHistory([]);
                await getRecommendations(songId);
            }

            if (currentTrack.id) {
                playHistoryRef.current = [...playHistoryRef.current, currentTrack];
                setPlayHistory(playHistoryRef.current);
            }

            load(song, {
                autoplay: true,
                initialVolume: volume,
                crossOrigin: 'anonymous',
                format: 'mp3',
                onend: playNextSong,
                onplay: () => setIsPlaying(true)
            });
        } catch (error) {
            console.error('Error playing track:', error);
        }
    };

    const playNextSong = async () => {
        console.log('Playing next song...');
        try {
            if (queueRef.current.length > 0) {
                const nextSong = queueRef.current[0];
                queueRef.current = queueRef.current.slice(1);
                setQueue(queueRef.current);

                if (queueRef.current.length < 5) {
                    getRecommendations(nextSong.id);
                }

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
                console.log(songData);
                await playTrack(songData.data.download[4].link, nextSong.id, false);
            }
        } catch (error) {
            console.error('Error playing next song:', error);
        }
    };

    const playPreviousSong = async () => {
        console.log('Playing previous song...');
        try {
            if (playHistoryRef.current.length > 0) {
                const previousSong = playHistoryRef.current[playHistoryRef.current.length - 1];
                playHistoryRef.current = playHistoryRef.current.slice(0, -1);
                setPlayHistory(playHistoryRef.current);

                if (currentTrack.id) {
                    queueRef.current = [currentTrack, ...queueRef.current];
                    setQueue(queueRef.current);
                }

                try {
                    const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${previousSong.id}`);
                    const songData = response.data;

                    setCurrentTrack({
                        id: previousSong.id,
                        title: previousSong.title,
                        subtitle: songData.data.artists?.primary?.map(artist => artist.name).join(", ") || previousSong.subtitle,
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
                } catch (error) {
                    console.error('Error fetching song details:', error);
                }
            }
        } catch (error) {
            console.error('Error playing previous song:', error);
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Sync refs with state
    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

    useEffect(() => {
        playHistoryRef.current = playHistory;
    }, [playHistory]);

    const contextValue = {
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        trackTime,
        setTrackTime,
        duration,
        setDuration,
        volume,
        setVolume,
        audioRef,
        progressRef,
        queue,
        setQueue,
        playHistory,
        playTrack,
        playNextSong,
        playPreviousSong,
        togglePlayPause,
        getRecommendations
    };

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
