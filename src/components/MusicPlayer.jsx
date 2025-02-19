import React, { useEffect, useContext, useState, useRef } from 'react'
import { Play, Pause } from 'lucide-react';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { AudioPlayerData } from '../context/AudioPlayerContext';
import { Slider } from "./ui/slider";
import { LoadingSpinner } from './LoadingSpinner';
const MusicPlayer = () => {
    const {
        playTrack,
        progressRef,
        audioRef,
        currentTrack,
        isPlaying,
        // togglePlayPause,
        trackTime,
        // duration,
        handleProgressChange
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
    const playPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    }

    // useEffect(() => {
    //     load(
    //         `${}`,
    //         {
    //             autoplay: true,
    //             initialVolume: volume,
    //             crossOrigin: 'anonymous',
    //             format: 'mp3',
    //             onend: () => {
    //                 console.log('Track ended');
    //             },
    //             onplay: () => {
    //                 console.log('Track started playing');
    //             },
    //         }
    //     );
    // }, [])

    useEffect(() => {
        if (isDragging) {
            return;
        }

        const animate = () => {
            setPos(getPosition());
            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = window.requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [getPosition, isDragging]);

    const formatTime = () => {
        if (typeof time === 'number' && !Number.isNaN(time)) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);

            // Convert to string and pad with leading zeros if necessary
            const formatMinutes = minutes.toString().padStart(2, '0');
            const formatSeconds = seconds.toString().padStart(2, '0');

            return `${formatMinutes}:${formatSeconds}`;
        }
        return '00:00';
    };
    return (
        <div className='bg-[#202020] text-white rounded-xl fixed bottom-28 w-full h-24 flex items-center justify-start gap-4 px-4'>
            <div className='bg-white h-10 w-10 rounded-full overflow-hidden'>
                <img src={currentTrack?.thumbnails?.[0]?.url} alt="" className='w-full h-full object-cover' />
            </div>
            <div className='flex justify-between items-center w-full px-3'>
                <div className='flex flex-col gap-1'>
                    <h1 className='text-lg'>{currentTrack?.name || 'No Track Selected'}</h1>
                    <h1 className='text-sm'>{currentTrack?.artist?.name || 'Unknown Artist'}</h1>
                </div>
                <div
                    onClick={togglePlayPause}
                    className='cursor-pointer hover:opacity-80'
                    onKeyDown={(e) => { if (e.key === 'Enter') togglePlayPause(); }}
                >
                    {/* <LoadingSpinner/> */}
                    {isLoading ? <LoadingSpinner /> : isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </div>
            </div>
            <Slider
                value={[pos]}
                max={duration}
                onValueChange={([values]) => {
                    setPos(values);
                }}
                onPointerDown={() => {
                    setIsDragging(true);
                }}
                onValueCommit={() => {
                    seek(pos);
                    setPos(getPosition());
                    setIsDragging(false);
                }}
                className="absolute w-9/10 bottom-0 h-1 rounded-lg bg-white cursor-pointer"

            >

            </Slider>
        </div>
    );
};

export default MusicPlayer;
