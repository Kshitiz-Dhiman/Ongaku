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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Volume2 } from 'lucide-react';
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
    const [isliked, setIsLiked] = useState(false);
    const [lyrics, setLyrics] = useState('');
    const [lyricsMenuOpen, setLyricsMenuOpen] = useState(false);
    const [lyricsLoading, setLyricsLoading] = useState(false);

    const [queueOpen, setQueueOpen] = useState(false);
    const openQueue = () => {
        if (queueOpen) {
            setQueueOpen(false);
        } else {
            setQueueOpen(true);
        }
    }

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
            setLyricsLoading(false);

        } catch (error) {
            setLyrics('Lyrics are not available at this moment');
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
                onClick={onClose}
                className="pt-3 pl-5 flex items-center bg-zinc-900 w-full "
            >
                <div className="w-12 h-1 bg-gray-500 rounded-full mx-auto mt-2 mb-3"></div>

            </button>



            <div className='md:block hidden h-full w-full bg-gradient-to-b from-zinc-900 to-black flex-col p-6'>
                <div className='flex h-3/4 justify-around items-start gap-8'>
                    <div className="h-full max-w-full p-20 aspect-square rounded-xl overflow-hidden">
                        <img
                            src={currentTrack?.images?.medium}
                            alt={currentTrack?.title}
                            className="w-full h-full object-cover transform rounded-lg"
                        />
                    </div>
                    <div className="h-full flex-1 max-w-xl pt-17">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="bg-zinc-800/50 backdrop-blur-sm rounded-lg w-full mt-4 p-1">
                                <TabsTrigger onClick={() => {
                                    setLyrics("Fetching lyrics....")
                                    fetchLryics();
                                }} value="lyrics" className="text-sm font-medium">Lyrics</TabsTrigger>
                                <TabsTrigger value="queue" className="text-sm font-medium">Queue</TabsTrigger>
                                <TabsTrigger value="related" className="text-sm font-medium">Related</TabsTrigger>
                            </TabsList>
                            <TabsContent value="lyrics" className="mt-4 bg-zinc-800/30 rounded-lg p-4">
                                {
                                    lyricsLoading ? <LyricsSkeleton /> : (
                                        <div>
                                            <p className='text-[22px]  font-bold  text-gray-400 text-center mb-2 h-[560px] overflow-scroll whitespace-pre-line'>
                                                {lyrics}
                                            </p>
                                        </div>
                                    )
                                }
                            </TabsContent>
                            <TabsContent value="queue" className="mt-4 bg-zinc-800/30 rounded-lg p-4">
                                <MusicQueue />
                            </TabsContent>
                            <TabsContent value="related" className="mt-4 bg-zinc-800/30 rounded-lg p-4">

                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <div className=''>
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
                    <div className="mt-4 px-4">
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
                        <Repeat onClick={() => startLoop()} className={!loopOnOrOff ? "w-6 h-6 text-gray-400 hover:text-white cursor-pointer" : "w-7 h-7 text-white cursor-pointer"} />
                    </div>
                    {/* <div className='items-center justify-center gap-3 md:flex mt-4'>
                        {volume !== 0 ? volume > 0.5 ? <Volume2 /> : <Volume1 /> : <VolumeOff />}
                        <Slider
                            value={[volume]}
                            max={1}
                            step={0.01}
                            onValueChange={([value]) => setVolume(value)}
                            className="w-24 h-1 rounded-lg bg-gray-600 cursor-pointer"
                        />
                    </div> */}
                </div>
            </div>


            <div className="md:hidden bg-gradient-to-b from-zinc-900 to-black  h-full flex flex-col px-4 pb-20">
                {/* Album Art */}
                <div className="md:hidden flex-1 flex items-center justify-center p-2 leading-7">

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
                                <p className='text-[22px]  font-bold  text-gray-400 text-center mb-2 h-[300px] overflow-scroll whitespace-pre-line'>
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
                <div className="mt-4 px-4">
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
                    <Repeat onClick={() => startLoop()} className={!loopOnOrOff ? "w-6 h-6 text-gray-400 hover:text-white cursor-pointer" : "w-7 h-7 text-white cursor-pointer"} />
                </div>

                <div className=" mt-10 mb-5 flex items-center justify-center gap-10">
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
