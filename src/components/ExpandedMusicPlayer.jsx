import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat } from 'lucide-react';
import { Slider } from "./ui/slider";
import { LoadingSpinner } from './LoadingSpinner';
import { trimString } from '../utils/utils';
import { Link } from 'react-router-dom';
import { MicVocal } from 'lucide-react';
import { Heart } from 'lucide-react';
import { ListMusic } from 'lucide-react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import axios from 'axios';
import LyricsSkeleton from './LyricsSkeleton';
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

    const [isliked, setIsLiked] = useState(false);
    const [lyrics, setLyrics] = useState('');
    const [lyricsMenuOpen, setLyricsMenuOpen] = useState(false);
    const [lyricsLoading, setLyricsLoading] = useState(false);
    const toggleLiked = () => {
        if (isliked) {
            setIsLiked(false);
            toast("Song removed from liked songs")
        } else {
            setIsLiked(true);
            toast("Song added to liked songs")
        }
    };
    const fetchLryics = async () => {
        setLyricsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song/lyrics?title=${currentTrack?.title}&artist=${currentTrack?.artists?.primary?.[0]?.name}`);
            console.log(response.status);
            if (response.status === 5002) {
                setLyrics('Lyrics not available');
                return;
            }

            setLyrics(response.data.lyrics);

        } catch (error) {
            console.log(error);
            setLyrics('Lyrics are not available at this moment');
        } finally {
            setLyricsLoading(false);
        }
    }
    useEffect(() => {
        if (currentTrack) {
            setLyrics('Fetching lyrics...');
            fetchLryics();
        } else {
            setLyrics('Lyrics are not available at this moment');
        }
    }, [currentTrack]);

    const openLyricsMenu = () => {
        if (lyricsMenuOpen) {
            setLyricsMenuOpen(false);
        } else {
            setLyricsMenuOpen(true);
            fetchLryics();
        }
    }
    return (
        <div ref={expandedPlayerRef}
            className="fixed z-[1000] md:hidden inset-0 bg-black text-white">
            <ToastContainer
                position="top-left"
                autoClose={500}
                hideProgressBar
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
                theme="dark"
                transition={Slide}
            />
            <button
                type='button'
                onClick={onClose}
                className="absolute right-4 top-4 p-2 hover:bg-gray-800 rounded-full"
            >
                <ChevronDown size={24} />
            </button>

            <div className="h-full flex flex-col px-4 pt-16 pb-8">
                {/* Album Art */}
                <div className="flex-1 flex items-center justify-center p-2 leading-7">

                    {!lyricsMenuOpen ?
                        (
                            <div className="max-w-md aspect-square  rounded-lg overflow-hidden">
                                <img
                                    src={currentTrack?.images?.medium}
                                    alt={currentTrack?.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (lyricsLoading ? <LyricsSkeleton /> : (
                            <div>
                                <p className='text-[22px]  font-bold  text-gray-400 text-center mb-2 h-[400px] overflow-scroll whitespace-pre-line'>
                                    {lyrics}
                                </p>
                            </div>
                        ))
                    }
                </div>

                {/* Track Info */}
                <div className="mt-1 text-center">
                    <h1 className="text-2xl font-bold">
                        {trimString(currentTrack?.title, 30) || 'No Track Selected'}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {currentTrack?.artists?.primary ? (
                            currentTrack.artists.primary.map((artist, index) => (
                                <React.Fragment key={artist.id}>
                                    <Link
                                        to={`/artist/${artist.id}`}
                                        className='text-sm text-gray-400 underline hover:text-gray-300'
                                        onClick={(e) => { e.stopPropagation() }}
                                    >
                                        {trimString(artist.name, Math.floor(23 / currentTrack.artists.primary.length))}
                                    </Link>
                                    {index < currentTrack.artists.primary.length - 1 && (
                                        <span className='text-sm text-gray-400'>, </span>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <span className='text-sm text-gray-400'>Unknown Artist</span>
                        )}
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
                    {
                        isliked ? (
                            <Heart className="w-6 h-6 text-red-500 fill-red-500 hover:text-red-600 cursor-pointer" onClick={toggleLiked} />
                        ) : (
                            <Heart className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" onClick={toggleLiked} />
                        )
                    }
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
                <div className="mt-10 mb-5 flex items-center justify-center gap-10">
                    <MicVocal onClick={() => openLyricsMenu()} className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                    <ListMusic className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                    <Shuffle className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                </div>
            </div>
        </div>
    );


};

export default ExpandedMusicPlayer;
