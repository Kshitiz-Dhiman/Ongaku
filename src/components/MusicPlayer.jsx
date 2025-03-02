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
import gsap from "gsap";
import { useGSAP } from '@gsap/react';
import ExpandedMusicPlayer from './ExpandedMusicPlayer';
gsap.registerPlugin(useGSAP);

const MusicPlayer = () => {

    const playerRef = useRef(null);
    const expandedPlayerRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    useGSAP(() => {

        gsap.matchMedia("(min-width: 800px)", () => {
            gsap.from(playerRef.current, {
                y: 200,
                duration: 0.5,
                ease: "power3.out",
                opacity: 0
            });
        })
        if (isExpanded) {
            gsap.from(expandedPlayerRef.current, {
                y: 1000,
                duration: 0.7,
                ease: "power3.out",
                opacity: 1
            });
        } else {
            gsap.fromTo(expandedPlayerRef.current, {
                y: 1000,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out"
            });
        }
    }, [isExpanded]);
    const expandMusicPlayer = () => {
        setIsExpanded(!isExpanded);
    };

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
        <>
            {isExpanded && (
                <ExpandedMusicPlayer
                    expandedPlayerRef={expandedPlayerRef}
                    isExpanded={isExpanded}
                    currentTrack={currentTrack}
                    isLoading={isLoading}
                    playing={playing}
                    togglePlayPause={togglePlayPause}
                    playPreviousSong={playPreviousSong}
                    playNextSong={playNextSong}
                    pos={pos}
                    duration={duration}
                    volume={volume}
                    setVolume={setVolume}
                    handleSliderChange={handleSliderChange}
                    setIsDragging={setIsDragging}
                    handleSliderCommit={handleSliderCommit}
                    formatTime={formatTime}
                    onClose={expandMusicPlayer}
                />
            )}
            <div
                onClick={expandMusicPlayer}
                onKeyDown={(e) => { if (e.key === 'Enter') expandMusicPlayer(); }}
                ref={playerRef}
                className='bg-black border-t-1 border-gray-700 text-white rounded-t-xl md:h-30 fixed bottom-0 w-full flex flex-col md:flex-row items-center justify-between gap-4 px-7 md:px-10 py-4 md:py-0'
            >
                <div className='flex w-full md:w-[15%] justify-between items-center gap-4'>
                    <div className='flex items-center gap-2'>
                        <div className='bg-white h-10 w-10 rounded-full overflow-hidden'>
                            <img src={currentTrack?.images?.large} alt="" className='w-full h-full object-cover' />
                        </div>
                        <div className='flex flex-col'>
                            <h1 className='text-lg'>{trimString(currentTrack?.title, 30) || 'No Track Selected'}</h1>
                            <h1 className='text-sm text-gray-400'>{trimString(currentTrack?.subtitle, 23) || 'Unknown Artist'}</h1>
                        </div>
                    </div>
                    <div onKeyDown={(e) => { if (e.key === 'Enter') togglePlayPause(); }} onKeyUp={(e) => { if (e.key === ' ') togglePlayPause(); }} className='p-2 md:hidden rounded-full bg-white' onClick={togglePlayPause}>
                        {isLoading ? <LoadingSpinner /> : playing ? <Pause color='black' size={30} /> : <Play color='black' size={30} />}
                    </div>
                </div>
                <div className='flex flex-col items-center gap-4 w-full md:w-auto'>
                    <Slider
                        value={[pos]}
                        max={duration}
                        min={0}
                        step={0.1}
                        onValueChange={handleSliderChange}
                        onPointerDown={() => setIsDragging(true)}
                        onValueCommit={handleSliderCommit}
                        className="w-9/10 top-0 md:w-96 h-1 rounded-lg bg-gray-600 md:relative absolute cursor-pointer"
                    />
                    <div className='cursor-pointer hover:opacity-80 mt-3 md:m-0'>
                        <div className='md:flex justify-center items-center gap-4 hidden'>
                            <Shuffle />
                            <SkipBack onClick={() => playPreviousSong()} />
                            <div onKeyDown={(e) => { if (e.key === 'Enter') togglePlayPause(); }} onKeyUp={(e) => { if (e.key === ' ') togglePlayPause(); }} className='p-2 rounded-full bg-white' onClick={togglePlayPause}>
                                {isLoading ? <LoadingSpinner /> : playing ? <Pause color='black' size={35} /> : <Play color='black' size={35} />}
                            </div>
                            <SkipForward onClick={() => playNextSong()} />
                            <Repeat />
                        </div>
                    </div>
                </div>
                <div className=' items-center gap-3 md:flex hidden'>
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
        </>
    );
};

export default MusicPlayer;
