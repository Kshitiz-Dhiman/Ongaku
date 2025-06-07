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
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import MusicQueue from './MusicQueue';

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
    const {
        looping,
        loop
    } = useGlobalAudioPlayer();

    // Existing states
    const [isliked, setIsLiked] = useState(false);
    const [lyrics, setLyrics] = useState('');
    const [lyricsMenuOpen, setLyricsMenuOpen] = useState(false);
    const [lyricsLoading, setLyricsLoading] = useState(false);
    const [queueOpen, setQueueOpen] = useState(false);
    const [loopOnOrOff, setLoopOnOrOff] = useState(false);

    // Swipe gesture states
    const [isClosing, setIsClosing] = useState(false);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDraggingSwipe, setIsDraggingSwipe] = useState(false);
    const [velocity, setVelocity] = useState(0);
    const lastMoveTime = useRef(Date.now());
    const lastY = useRef(0);

    // Touch/Mouse event handlers for swipe gesture
    const handleSwipeStart = (clientY) => {
        setStartY(clientY);
        setIsDraggingSwipe(true);
        setVelocity(0);
        lastMoveTime.current = Date.now();
        lastY.current = clientY;
    };

    const handleSwipeMove = (clientY) => {
        if (!isDraggingSwipe) return;

        const now = Date.now();
        const deltaY = clientY - startY;
        const timeDelta = now - lastMoveTime.current;
        const positionDelta = clientY - lastY.current;

        // Only allow downward swipes
        if (deltaY > 0) {
            setCurrentY(deltaY);

            // Calculate velocity for momentum
            if (timeDelta > 0) {
                setVelocity(positionDelta / timeDelta);
            }
        }

        lastMoveTime.current = now;
        lastY.current = clientY;
    };

    const handleSwipeEnd = () => {
        if (!isDraggingSwipe) return;

        // Determine if should close based on distance or velocity
        const shouldClose = currentY > 150 || velocity > 0.5;

        if (shouldClose) {
            setIsClosing(true);
            setTimeout(() => {
                onClose();
                // Reset states after closing
                setTimeout(() => {
                    setCurrentY(0);
                    setIsClosing(false);
                    setIsDraggingSwipe(false);
                }, 100);
            }, 300);
        } else {
            setCurrentY(0);
        }

        setIsDraggingSwipe(false);
        setVelocity(0);
    };

    // Touch events
    const handleTouchStart = (e) => {
        // Prevent swipe when interacting with sliders or buttons
        if (e.target.closest('.slider-container') ||
            e.target.closest('button') ||
            e.target.closest('.control-button')) {
            return;
        }
        handleSwipeStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (!isDraggingSwipe) return;
        e.preventDefault(); // Prevent scrolling
        handleSwipeMove(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
        handleSwipeEnd();
    };

    // Mouse events (for desktop testing)
    const handleMouseDown = (e) => {
        if (e.target.closest('.slider-container') ||
            e.target.closest('button') ||
            e.target.closest('.control-button')) {
            return;
        }
        handleSwipeStart(e.clientY);
    };

    const handleMouseMove = (e) => {
        if (!isDraggingSwipe) return;
        handleSwipeMove(e.clientY);
    };

    const handleMouseUp = () => {
        handleSwipeEnd();
    };

    // Add mouse event listeners
    useEffect(() => {
        if (isDraggingSwipe) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDraggingSwipe]);

    const checkIftheSongisLiked = async () => {
        if (!currentTrack || !localStorage.getItem('token')) {
            return;
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/liked/song?id=${currentTrack.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.data.liked) {
                setIsLiked(true);
            } else {
                setIsLiked(false);
            }

        } catch (error) {
            console.error('Error checking liked status:', error);
        }
    }

    useEffect(() => {
        checkIftheSongisLiked();
    }, [currentTrack]);

    const toggleLiked = () => {
        if (!currentTrack || !localStorage.getItem('token')) {
            toast("Please login to like songs");
            return;
        }

        axios.post(`${import.meta.env.VITE_MUSIC_API}/liked/song`,
            {
                songId: currentTrack.id,
                title: currentTrack.title,
                artist: currentTrack.subtitle || currentTrack.artists?.primary?.[0]?.name,
                image: currentTrack.images?.medium
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        )
            .then(response => {
                setIsLiked(response.data.liked);
                toast(response.data.message);
            })
            .catch(error => {
                console.error('Error toggling like status:', error);
                toast("Error updating liked status");
            });
    };

    const fetchLryics = async () => {
        setLyricsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song/lyrics?title=${currentTrack?.title}&artist=${currentTrack?.artists?.primary?.[0]?.name}`);
            if (response.status === 5002) {
                setLyrics('Lyrics not available');
                return;
            }

            setLyrics(response.data.lyrics);

        } catch (error) {
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

    const openQueue = () => {
        if (queueOpen) {
            setQueueOpen(false);
        } else {
            setQueueOpen(true);
        }
    }

    const startLoop = () => {
        if (looping) {
            loop(false);
            setLoopOnOrOff(false);
        } else {
            loop(true);
            setLoopOnOrOff(true);
        }
    }

    return (
        <div
            ref={expandedPlayerRef}
            className="fixed z-[1000] inset-0 bg-black text-white"
            style={{
                transform: `translateY(${currentY}px)`,
                transition: isDraggingSwipe ? 'none' : isClosing ? 'transform 0.3s ease-out' : 'transform 0.2s ease-out',
                opacity: Math.max(0.3, 1 - (currentY / 400)) // Fade out as sliding
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
        >
            {queueOpen && <MusicQueue onClose={() => setQueueOpen(false)} />}

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

            {/* Swipe indicator */}
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-2 mb-3"></div>

            <button
                type='button'
                onClick={onClose}
                className="pt-2 pl-5 flex items-center w-full rounded-full control-button"
            >
                <ChevronDown size={24} />
            </button>

            <div className="h-full flex flex-col px-4 pb-20">
                {/* Album Art */}
                <div className="flex-1 flex items-center justify-center p-2 leading-7">
                    {!lyricsMenuOpen ?
                        (
                            <div className="max-w-md aspect-square rounded-lg overflow-hidden">
                                <img
                                    src={currentTrack?.images?.medium}
                                    alt={currentTrack?.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (lyricsLoading ? <LyricsSkeleton /> : (
                            <div>
                                <p className='text-[22px] font-bold text-gray-400 text-center mb-2 h-[300px] overflow-scroll whitespace-pre-line'>
                                    {lyrics}
                                </p>
                            </div>
                        ))
                    }
                </div>

                {/* Track Info */}
                <div className="text-center">
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
                <div className="mt-4 px-4 slider-container">
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
                <div className="mt-8 flex justify-center items-center gap-8 control-button">
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
                    <Repeat onClick={() => startLoop()} className={!loopOnOrOff ? "w-6 h-6 text-gray-400 hover:text-white cursor-pointer" : "w-7 h-7 text-white cursor-pointer"} />
                </div>

                {/* Volume */}
                <div className="mt-10 mb-5 flex items-center justify-center gap-10 control-button">
                    <MicVocal onClick={() => openLyricsMenu()} className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                    <ListMusic
                        onClick={() => openQueue()}
                        className={`w-6 h-6 cursor-pointer ${queueOpen ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    />
                    <Shuffle className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                </div>
            </div>
        </div>
    );
};

export default ExpandedMusicPlayer;
