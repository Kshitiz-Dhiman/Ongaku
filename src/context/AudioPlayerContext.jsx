import { React, createContext, useRef, useEffect, useState } from 'react'
import { useGlobalAudioPlayer } from 'react-use-audio-player';


export const AudioPlayerData = createContext();

const AudioPlayerContext = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackTime, setTrackTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef(null);
    const progressRef = useRef(null);

    const { load } = useGlobalAudioPlayer();

    const playTrack = async (song) => {
        const audioElement = audioRef.current;
        try {
            setCurrentTrack(song);
            // audioElement.src = `${import.meta.env.VITE_MUSIC_API}/stream/${song.videoId}`;
            // audioElement.src = "https://aac.saavncdn.com/807/f0044bbd3aa18ad6b5b3360dd1b8ed78_320.mp4";
            // audioElement.src = "https://aac.saavncdn.com/796/55e78f64b3abecafec7d55f09b85f7b4_160.mp4";
            audioElement.src = song;
            load(
                audioElement.src,
                {
                    autoplay: true,
                    initialVolume: volume,
                    crossOrigin: 'anonymous',
                    format: 'mp3',
                    onend: () => {
                        console.log('Track ended');
                    },
                    onplay: () => {
                        console.log('Track started playing');
                    },
                }
            );
            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing track:', error);
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
    const handleProgressChange = (e) => {
        if (!audioRef.current) return;

        const slider = e.target;
        const percentage = slider.value;
        const audioTime = (percentage / 100) * audioRef.current.duration;

        audioRef.current.currentTime = audioTime;
        setTrackTime(audioTime);
    };
    // Add time update listener

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setTrackTime(audio.currentTime);
            const percentage = (audio.currentTime / audio.duration) * 100;
            if (progressRef.current) {
                progressRef.current.value = percentage;
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, []);
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
        playTrack,
        togglePlayPause,
        handleProgressChange,
    }

    return (
        <AudioPlayerData.Provider value={contextValue}>
            <audio ref={audioRef} type="audio/mpeg" >
                <track kind="captions" />
            </audio>
            {children}
        </AudioPlayerData.Provider>
    )
}

export default AudioPlayerContext
