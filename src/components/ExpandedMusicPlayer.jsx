import React, { useRef } from 'react';
import { ChevronDown, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Volume2, Volume1, VolumeOff } from 'lucide-react';
import { Slider } from "./ui/slider";
import { LoadingSpinner } from './LoadingSpinner';
import { trimString } from '../utils/utils';

const ExpandedMusicPlayer = ({
    expandedPlayerRef,
    isExpanded,
    currentTrack,
    isLoading,
    playing,
    togglePlayPause,
    playPreviousSong,
    playNextSong,
    pos,
    duration,
    volume,
    setVolume,
    handleSliderChange,
    setIsDragging,
    handleSliderCommit,
    formatTime,
    onClose
}) => {

    return (
        <div ref={expandedPlayerRef}
            className="fixed z-[1000] inset-0 bg-[#080c10] text-white">
            <button
                type='button'
                onClick={onClose}
                className="absolute right-4 top-4 p-2 hover:bg-gray-800 rounded-full"
            >
                <ChevronDown size={24} />
            </button>

            <div className="h-full flex flex-col px-4 pt-16 pb-8">
                {/* Album Art */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md aspect-square rounded-lg overflow-hidden">
                        <img
                            src={currentTrack?.images?.medium}
                            alt={currentTrack?.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Track Info */}
                <div className="mt-8 text-center">
                    <h1 className="text-2xl font-bold">
                        {trimString(currentTrack?.title, 30) || 'No Track Selected'}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {trimString(currentTrack?.subtitle, 23) || 'Unknown Artist'}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 px-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span>{formatTime(pos)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                    <Slider
                        value={[pos]}
                        max={duration}
                        min={0}
                        step={0.1}
                        onValueChange={handleSliderChange}
                        onPointerDown={() => setIsDragging(true)}
                        onValueCommit={handleSliderCommit}
                        className="w-full h-1 rounded-lg bg-gray-600 cursor-pointer"
                    />
                </div>

                {/* Controls */}
                <div className="mt-8 flex justify-center items-center gap-8">
                    <Shuffle className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                    <SkipBack
                        className="w-8 h-8 hover:text-gray-300 cursor-pointer"
                        onClick={playPreviousSong}
                    />
                    <div
                        className="p-4 rounded-full bg-white hover:bg-gray-200 cursor-pointer"
                        onClick={togglePlayPause}
                        onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePlayPause(); }}
                    >
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : playing ? (
                            <Pause className="w-8 h-8 text-black" />
                        ) : (
                            <Play className="w-8 h-8 text-black" />
                        )}
                    </div>
                    <SkipForward
                        className="w-8 h-8 hover:text-gray-300 cursor-pointer"
                        onClick={playNextSong}
                    />
                    <Repeat className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                </div>

                {/* Volume */}
                <div className="mt-8 flex items-center justify-center gap-4">
                    {volume !== 0 ? volume > 0.5 ? <Volume2 /> : <Volume1 /> : <VolumeOff />}
                    <Slider
                        value={[volume]}
                        max={1}
                        step={0.01}
                        onValueChange={([value]) => setVolume(value)}
                        className="w-32 h-1 rounded-lg bg-gray-600 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};

export default ExpandedMusicPlayer;
