import React, { useEffect, useContext, useState, useRef } from 'react'
import { Play, Pause } from 'lucide-react';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { AudioPlayerData } from '../context/AudioPlayerContext';
import { Slider } from "./ui/slider";
import { LoadingSpinner } from './LoadingSpinner';
import { Volume2 } from 'lucide-react';
import { SkipForward } from 'lucide-react';
import { SkipBack } from 'lucide-react';
import { Shuffle } from 'lucide-react';
import { Repeat } from 'lucide-react';
import { VolumeOff } from 'lucide-react';
import { Volume1 } from 'lucide-react';
import { trimString } from '../utils/utils';
const MusicPlayer = () => {

    const {
        currentTrack,
        playNextSong,
        playPreviousSong
    } = useContext(AudioPlayerData);
    const {
        load,
        playing,
        togglePlayPause,
        getPosition,
        isLoading,
        duration,
        loop,
        looping,
        mute,
        muted,
        volume,
        setVolume,
        seek,
        isReady,
    } = useGlobalAudioPlayer();
    const frameRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    const [pos, setPos] = useState(0);
    const handleSliderChange = (values) => {
        const newPosition = values[0];
        setPos(newPosition);
        if (!isDragging) {
            seek(newPosition);
        }
    };

    const handleSliderCommit = () => {
        seek(pos);
        setIsDragging(false);
    };
    const formatTime = (seconds) => {
        if (Number.isNaN(seconds)) {
            return '00:00';
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
    }
    useEffect(() => {
        // playTrack();
    }, []);
    useEffect(() => {

        if (!isDragging && playing) {
            const animate = () => {
                setPos(getPosition());
                frameRef.current = requestAnimationFrame(animate);
            };

            frameRef.current = requestAnimationFrame(animate);

            return () => {
                if (frameRef.current) {
                    cancelAnimationFrame(frameRef.current);
                }
            };
        }
    }, [getPosition, isDragging, playing]);
    return (
        <div className='bg-[#080c10] text-white rounded-xl fixed bottom-0 w-full h-30 flex items-center justify-between gap-4 px-10'>
            <div className='flex items-center gap-4'>
                <div className='bg-white h-10 w-10 rounded-full overflow-hidden'>
                    <img src={currentTrack?.image} alt="" className='w-full h-full object-cover' />
                </div>
                <div className='flex flex-col'>
                    <h1 className='text-lg'>{trimString(currentTrack?.title, 30) || 'No Track Selected'}</h1>
                    <h1 className='text-sm text-gray-400'>{trimString(currentTrack?.subtitle, 23) || 'Unknown Artist'}</h1>
                </div>
            </div>
            <div className='flex flex-col items-center gap-4'>
                <Slider
                    value={[pos]}
                    max={duration}
                    min={0}
                    step={0.1}
                    onValueChange={handleSliderChange}
                    onPointerDown={() => setIsDragging(true)}
                    onValueCommit={handleSliderCommit}
                    className="w-[40rem] h-1 rounded-lg bg-gray-600 cursor-pointer relative"
                />
                <div

                    className='cursor-pointer hover:opacity-80'

                >
                    <div className='flex justify-center items-center gap-4'>
                        <Shuffle />
                        <SkipBack onClick={() => playPreviousSong()} />
                        <div onKeyDown={(e) => { if (e.key === 'Enter') togglePlayPause(); }} className='p-2 rounded-full bg-white' onClick={togglePlayPause}>
                            {isLoading ? <LoadingSpinner /> : playing ? <Pause color='black' size={24} /> : <Play color='black' size={24} />}
                        </div>
                        <SkipForward onClick={() => playNextSong()} />
                        <Repeat />
                    </div>
                </div>
            </div>
            <div className='flex items-center gap-3'>
                <h1 className='tracking-wider'>
                    {formatTime(pos)}/{formatTime(duration)}
                </h1>
                {volume !== 0 ? volume > 0.5 ? <Volume2 /> : <Volume1 /> : <VolumeOff />}
                <Slider
                    value={[volume]}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) => setVolume(value)}
                    className="w-24 h-1 rounded-lg bg-gray-600 cursor-pointer"
                />
            </div>
        </div>
    );
};

export default MusicPlayer;
