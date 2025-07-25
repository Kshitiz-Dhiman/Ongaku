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
import { useAudioPlayerContext } from 'react-use-audio-player';
import MusicQueue from './MusicQueue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaPlay } from "react-icons/fa6";
import { FaPause } from "react-icons/fa6";
import { FaForward } from "react-icons/fa6";
import { FaBackward } from "react-icons/fa6";
import { decodeHTMLEntities } from '../utils/utils';
import { useAudioStore } from '@/app/storeZustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API = import.meta.env.VITE_MUSIC_API;

const useCheckLikedStatus = (songId) =>
    useQuery({
        queryKey: ['likedStatus', songId],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/liked/song?id=${songId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            return data.liked;
        },
        enabled: !!songId && !!localStorage.getItem('token'),
        staleTime: 1000 * 60 * 5,
    });

const useToggleLike = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ songId, songData }) => {
            const { data } = await axios.post(`${API}/liked/song`, {
                songId: songId,
                title: songData.title,
                artist: songData.subtitle || songData.artists?.primary?.[0]?.name,
                image: songData.image?.medium,
                download_urls: songData.download_urls
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['likedStatus', variables.songId]);
            queryClient.invalidateQueries(['liked']);
            toast(data.message);
        },
        onError: (error) => {
            console.error('Error toggling like status:', error);
            toast("Error updating liked status");
        },
    });
};

const useFetchLyrics = () => {
    return useMutation({
        mutationFn: async (songId) => {
            return 'Lyrics are not available at this moment';
        },
        onError: () => {
            return 'Lyrics are not available at this moment';
        },
    });
};

const ExpandedMusicPlayer = ({
    expandedPlayerRef,
    isExpanded,
    currentTrack,
    isLoading,
    playing,
    togglePlayPause,
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
    } = useAudioPlayerContext();

    const { handleNextSong, handlePrevSong, shuffleQueue } = useAudioStore();

    const { data: isLiked = false, refetch: refetchLikedStatus } = useCheckLikedStatus(currentTrack?.id);
    const toggleLikeMutation = useToggleLike();
    const fetchLyricsMutation = useFetchLyrics();

    const [lyrics, setLyrics] = useState('');
    const [lyricsMenuOpen, setLyricsMenuOpen] = useState(false);
    const [queueOpen, setQueueOpen] = useState(false);

    const openQueue = () => {
        if (queueOpen) {
            setQueueOpen(false);
        } else {
            setQueueOpen(true);
        }
    }

    const playPreviousSong = async () => {
        await handlePrevSong();
    };

    const playNextSong = async () => {
        await handleNextSong();
    };

    const handleShuffle = () => {
        shuffleQueue();
    };

    const toggleLiked = () => {
        if (!currentTrack || !localStorage.getItem('token')) {
            toast("Please login to like songs");
            return;
        }

        toggleLikeMutation.mutate({
            songId: currentTrack.id,
            songData: currentTrack
        });
    };

    const fetchLryics = async () => {
        if (!currentTrack?.id) {
            setLyrics('Lyrics are not available at this moment');
            return;
        }

        fetchLyricsMutation.mutate(currentTrack.id, {
            onSuccess: (lyrics) => {
                setLyrics(lyrics);
            },
            onError: () => {
                setLyrics('Lyrics are not available at this moment');
            }
        });
    };

    useEffect(() => {
        if (currentTrack) {
            setLyrics('Fetching lyrics...');
            // fetchLryics(); // Uncomment when you want to auto-fetch lyrics
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

    const [loopOnOrOff, setLoopOnOrOff] = useState(false);

    const startLoop = () => {
        if (looping) {
            loop(false);
            setLoopOnOrOff(false);
        } else {
            loop(true);
            setLoopOnOrOff(true);
        }
    }

    const [isDragActive, setIsDragActive] = useState(false);
    const [currentY, setCurrentY] = useState(0);
    const dragData = useRef({
        startY: 0,
        currentTranslateY: 0,
        isDragging: false
    });

    // Drag effect code remains the same...
    useEffect(() => {
        const player = expandedPlayerRef.current;
        if (!player || !isExpanded) return;

        const handleStart = (e) => {
            const target = e.target;
            const isInteractiveElement = target.closest('button, a, [role="button"], [onclick], input, select, textarea, .slider, [data-interactive]');

            if (isInteractiveElement) {
                return;
            }

            const isOnImage = target.closest('.album-art-container, .album-art-image');
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const screenHeight = window.innerHeight;

            if (!isOnImage && clientY > screenHeight * 0.3) {
                return;
            }

            dragData.current.startY = clientY;
            dragData.current.isDragging = true;
            setIsDragActive(true);
            e.preventDefault();
        };

        const handleMove = (e) => {
            if (!dragData.current.isDragging) return;

            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaY = clientY - dragData.current.startY;

            if (deltaY > 0) {
                dragData.current.currentTranslateY = deltaY;
                setCurrentY(deltaY);
                player.style.transition = '';
                player.style.transform = `translateY(${deltaY}px)`;

                const screenHeight = window.innerHeight;
                const halfwayPoint = screenHeight * 0.15;

                if (deltaY > halfwayPoint) {
                    player.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
                    player.style.transform = `translateY(${screenHeight}px)`;

                    setTimeout(() => {
                        onClose();
                    }, 200);

                    dragData.current.isDragging = false;
                    setIsDragActive(false);
                    return;
                }
            }

            e.preventDefault();
        };

        const handleEnd = (e) => {
            if (!dragData.current.isDragging) return;

            dragData.current.isDragging = false;
            setIsDragActive(false);

            player.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
            player.style.transform = 'translateY(0px)';

            dragData.current.currentTranslateY = 0;
            setCurrentY(0);
        };

        player.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);

        player.addEventListener('touchstart', handleStart, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd, { passive: true });

        return () => {
            if (player) {
                player.removeEventListener('mousedown', handleStart);
                player.removeEventListener('touchstart', handleStart);
            }
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [isExpanded, onClose]);

    useEffect(() => {
        if (isExpanded && expandedPlayerRef.current) {
            expandedPlayerRef.current.style.transform = 'translateY(0px)';
            expandedPlayerRef.current.style.transition = '';

            dragData.current = {
                startY: 0,
                currentTranslateY: 0,
                isDragging: false
            };
            setCurrentY(0);
            setIsDragActive(false);
        }
    }, [isExpanded]);

    return (
        <div ref={expandedPlayerRef}
            className="fixed z-[1000] inset-0 bg-black text-white">

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

            <button
                type='button'
                className="pt-3 pl-5 flex items-center  w-full "
            >
                <div className="w-12 h-1 bg-gray-500 rounded-full mx-auto mt-2 mb-3"></div>
            </button>

            <div className='md:block hidden h-full w-full flex-col p-6'>
                <div
                    className="absolute inset-0 z-[-1] bg-cover bg-center opacity-40"
                    style={{
                        backgroundImage: `url(${currentTrack?.image?.small})`,
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                    }}
                />
                <div
                    className="absolute inset-0 z-[-1]"
                    style={{
                        backdropFilter: 'blur(300px)',
                        transform: 'translateZ(0)',
                    }}
                />
                <div className='flex h-3/4 justify-around items-start '>
                    <div className="h-full max-w-full p-20 aspect-square rounded-xl overflow-hidden ">
                        <img
                            src={currentTrack?.image?.large}
                            alt={currentTrack?.title}
                            className="w-full h-full object-cover transform rounded-lg"
                        />
                    </div>
                    <div className="h-full mr-4 md:mr-8 lg:mr-30 w-full max-w-xl pt-8 md:pt-12 lg:pt-17">
                        <Tabs defaultValue="queue" className="w-full">
                            <TabsList className="bg-zinc-800/50 backdrop-blur-sm shadow-sm shadow-gray-600 rounded-lg w-full mt-4 p-1">
                                <TabsTrigger onClick={() => {
                                    setLyrics("Fetching lyrics....")
                                    fetchLryics();
                                }} value="lyrics" className="text-sm font-medium">Lyrics</TabsTrigger>
                                <TabsTrigger value="queue" className="text-sm font-medium">Queue</TabsTrigger>
                                <TabsTrigger value="related" className="text-sm font-medium">Related</TabsTrigger>
                            </TabsList>
                            <TabsContent value="lyrics" className="mt-4 bg-zinc-800/30 shadow-sm shadow-gray-600 h-full rounded-lg p-2 md:p-4">
                                {
                                    fetchLyricsMutation.isPending ? <LyricsSkeleton /> : (
                                        <div className="w-full">
                                            <p className='text-lg sm:text-xl md:text-[22px] font-bold px-2 sm:px-4 md:px-6 lg:px-10 text-gray-400 text-center h-[47vh] overflow-y-auto whitespace-pre-line '>
                                                {lyrics}
                                            </p>
                                        </div>
                                    )
                                }
                            </TabsContent>
                            <TabsContent value="queue" className="mt-4 bg-zinc-800/30 rounded-lg p-2 md:p-4">
                                <MusicQueue />
                            </TabsContent>
                            <TabsContent value="related" className="mt-4 bg-zinc-800/30 rounded-lg p-2 md:p-4">
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <div className='flex flex-col'>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">
                            {trimString(currentTrack?.title, 30) || 'No Track Selected'}
                        </h1>
                        <p className="text-gray-400 mt-2">
                            {currentTrack?.artists ? (
                                currentTrack.artists.map((artist, index) => (
                                    <React.Fragment key={artist.id}>
                                        <Link
                                            to={`/artist/${artist.id}`}
                                            className='text-sm font-bold text-gray-400 hover:text-gray-300'
                                            onClick={(e) => { e.stopPropagation(); }}
                                        >
                                            {decodeHTMLEntities(trimString(artist.name, Math.floor(30 / currentTrack.artists.length))) + (index < currentTrack.artists.length - 1 ? ', ' : '')}
                                        </Link>
                                    </React.Fragment>
                                ))
                            ) : (
                                <span className='text-sm text-gray-400'>Unknown Artist</span>
                            )}
                        </p>
                    </div>

                    <div className="mt-1 px-4 md:px-30">
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

                    <div className="mt-5 flex justify-center items-center gap-8">
                        {
                            isLiked ? (
                                <Heart className="w-6 h-6 text-red-500 fill-red-500 hover:text-red-600 cursor-pointer" onClick={toggleLiked} />
                            ) : (
                                <Heart className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" onClick={toggleLiked} />
                            )
                        }
                        <FaBackward
                            className="w-8 h-8 text-gray-400 hover:text-gray-300 cursor-pointer"
                            onClick={playPreviousSong}
                        />
                        <div
                            className="p-4 rounded-full bg-gray-400 hover:bg-gray-200 cursor-pointer"
                            onClick={togglePlayPause}
                            onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePlayPause(); }}
                        >
                            {isLoading ? (
                                <LoadingSpinner />
                            ) : playing ? (
                                <FaPause color='black' size={30} />
                            ) : (
                                <FaPlay color='black' size={30} />
                            )}
                        </div>
                        <FaForward
                            className="w-8 h-8 text-gray-400 hover:text-gray-300 cursor-pointer"
                            onClick={playNextSong}
                        />
                        <Repeat onClick={() => startLoop()} className={!loopOnOrOff ? "w-6 h-6 text-gray-400 hover:text-white cursor-pointer" : "w-7 h-7 text-white cursor-pointer"} />
                    </div>
                </div>
            </div>

            <div className="md:hidden h-full flex flex-col px-6 pb-20">
                <div
                    className="absolute inset-0 z-[-1] bg-cover bg-center opacity-40"
                    style={{
                        backgroundImage: `url(${currentTrack?.image?.small})`,
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                    }}
                />
                <div
                    className="absolute inset-0 z-[-1]"
                    style={{
                        backdropFilter: 'blur(300px)',
                        transform: 'translateZ(0)',
                    }}
                />
                <div className="md:hidden flex-1 album-art-container flex items-center mb-[-70px] justify-center p-2 leading-7">
                    {!lyricsMenuOpen ?
                        (
                            <div className="album-art-image max-w-md aspect-square rounded-lg overflow-hidden">
                                <img
                                    src={currentTrack?.image?.large}
                                    alt={currentTrack?.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (fetchLyricsMutation.isPending ? <LyricsSkeleton /> : (
                            <div>
                                <p className='text-[22px] px-4 font-bold  text-gray-400 text-center mb-2 h-[300px] overflow-scroll whitespace-pre-line'>
                                    {lyrics}
                                </p>
                            </div>
                        ))
                    }
                </div>

                <div className="text-center">
                    <h1 className="text-2xl font-extrabold">
                        {trimString(currentTrack?.title, 30) || 'No Track Selected'}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {currentTrack?.artists ? (
                            currentTrack.artists.map((artist, index) => (
                                <React.Fragment key={artist.id}>
                                    <Link
                                        to={`/artist/${artist.id}`}
                                        className='text-sm font-bold text-gray-400 hover:text-gray-300'
                                        onClick={(e) => { e.stopPropagation(); }}
                                    >
                                        {decodeHTMLEntities(trimString(artist.name, Math.floor(30 / currentTrack.artists.length))) + (index < currentTrack.artists.length - 1 ? ', ' : '')}
                                    </Link>
                                </React.Fragment>
                            ))
                        ) : (
                            <span className='text-sm text-gray-400'>Unknown Artist</span>
                        )}
                    </p>
                </div>

                <div className="pt-4">
                    <div className="flex text-gray-300 justify-between text-sm pb-2">
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
                        className="w-full h-[5px] rounded-lg bg-gray-600 cursor-pointer"
                    />
                </div>

                <div className="mt-8 flex justify-center items-center gap-8">
                    {
                        isLiked ? (
                            <Heart className="w-6 h-6 text-red-500 fill-red-500 hover:text-red-600 cursor-pointer" onClick={toggleLiked} />
                        ) : (
                            <Heart className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" onClick={toggleLiked} />
                        )
                    }
                    <FaBackward
                        className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer"
                        onClick={playPreviousSong}
                    />
                    <div
                        className="p-4 rounded-full bg-gray-400 hover:bg-gray-200 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            togglePlayPause();
                        }}
                        onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePlayPause(); }}
                    >
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : playing ? (
                            <FaPause color='black' size={30} />
                        ) : (
                            <FaPlay color='black' size={30} />
                        )}
                    </div>
                    <FaForward onClick={playNextSong} className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                    <Repeat onClick={() => startLoop()} className={!loopOnOrOff ? "w-6 h-6 text-gray-400 hover:text-white cursor-pointer" : "w-7 h-7 text-white cursor-pointer"} />
                </div>

                <div className=" mt-10 mb-5 flex items-center justify-center gap-10">

                    <MicVocal onClick={() => openLyricsMenu()} className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                    <ListMusic
                        onClick={() => openQueue()}
                        className={`w-6 h-6 cursor-pointer ${queueOpen ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    />
                    <Shuffle onClick={handleShuffle} className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                </div>
            </div>
        </div>
    );
};

export default ExpandedMusicPlayer;
