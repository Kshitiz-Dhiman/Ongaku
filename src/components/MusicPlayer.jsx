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
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

gsap.registerPlugin(useGSAP);


const MusicPlayer = () => {

    const playerRef = useRef(null);
    const expandedPlayerRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    useGSAP(() => {
        gsap.matchMedia("(min-width: 800px)", () => {
            gsap.from(playerRef.current, {
                y: 100,
                duration: 0.8,
                ease: "power2.out",
                opacity: 0,
                clearProps: "all"
            });
        });
        if (isExpanded && expandedPlayerRef.current) {
            const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

            tl.fromTo(expandedPlayerRef.current,
                {
                    y: window.innerHeight,
                    opacity: 0,
                    scale: 0.95
                },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: "back.out(0)"
                }
            );

            tl.fromTo(
                expandedPlayerRef.current.querySelectorAll('.animate-item'),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 },
                "-=0.3"
            );
        }
    }, [isExpanded]);
    const expandMusicPlayer = (e) => {
        if (isExpanded && expandedPlayerRef.current) {
            gsap.to(expandedPlayerRef.current, {
                y: window.innerHeight,
                opacity: 1,
                scale: 0.95,
                duration: 0.3,
                ease: "power3.in",
                onComplete: () => setIsExpanded(false)
            });
        } else {
            setIsExpanded(true);
        }
    };

    const {
        playTrack,
        setCurrentTrack,
        currentTrack,
        playNextSong,
        playPreviousSong
    } = useContext(AudioPlayerData);
    const {
        playing,
        togglePlayPause,
        getPosition,
        isLoading,
        duration,
        volume,
        setVolume,
        seek,
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
    const [isliked, setIsLiked] = useState(false);

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
        if (currentTrack?.id) {
            localStorage.setItem('musicId', currentTrack.id);
        }
    }, [currentTrack]);
    useEffect(() => {
        const fetchTrack = async () => {
            try {
                const musicId = localStorage.getItem('musicId');
                if (musicId) {
                    const getTrack = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${musicId}`);
                    const songData = getTrack.data;
                    const track = {
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
                    };
                    setCurrentTrack(track);

                    playTrack(track.download_url[4].link, track.id, false);
                    // togglePlayPause();
                } else {
                    console.warn('No musicId found in localStorage');
                }
            } catch (error) {
                console.error('Error fetching track:', error);
            }
        };

        fetchTrack();
    }, [

    ]);
    useEffect(() => {

        const handleKeyPress = (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                togglePlayPause();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [togglePlayPause]);

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

    const toggleLiked = (e) => {
        e.stopPropagation(); // Prevent expandMusicPlayer from being triggered

        if (!currentTrack || !localStorage.getItem('token')) {
            toast("Please login to like songs");
            return;
        }

        axios.post(`${import.meta.env.VITE_MUSIC_API}/liked/song`,
            { songId: currentTrack.id },
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
    return (
        <>
            <div className={`${isExpanded ? 'block' : 'hidden'}`}>
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
            </div>
            <div
                ref={playerRef}
                className='parentMusicClass bg-black border-t-1 border-gray-700 text-white rounded-t-xl md:h-30 fixed md:bottom-0 bottom-15 w-full flex flex-col md:flex-row items-center justify-between gap-4 px-7 md:px-10 py-4 md:py-0'
            >
                {/* Info section - clickable to expand */}
                <div
                    className='parentMusicClass flex w-full md:w-[15%] justify-between items-center gap-4'
                    onClick={expandMusicPlayer}
                    onKeyDown={(e) => { if (e.key === 'Enter') expandMusicPlayer(); }}
                >
                    <div className='flex items-center gap-2 text-xl'>
                        <div className='bg-white h-10 w-10 rounded-full overflow-hidden'>
                            <img src={currentTrack?.images?.large} alt="" className='w-full h-full object-cover' />
                        </div>
                        <div className='flex flex-col'>
                            <h1 className='text-lg/5'>{trimString(currentTrack?.title, 30) || 'No Track Selected'}</h1>
                            <div className='flex items-center gap-1 flex-wrap'>
                                {currentTrack?.artists?.primary ? (
                                    currentTrack.artists.primary.map((artist, index) => (
                                        <React.Fragment key={artist.id}>
                                            <Link
                                                to={`/artist/${artist.id}`}
                                                className='text-sm text-gray-400 underline hover:text-gray-300'
                                                onClick={(e) => { e.stopPropagation(); }}
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
                            </div>
                        </div>
                        {isliked ? (
                            <Heart
                                className="hidden md:block w-6 h-6 text-red-500 fill-red-500 hover:text-red-600 cursor-pointer"
                                onClick={toggleLiked}
                            />
                        ) : (
                            <Heart
                                className="hidden md:block w-6 h-6 text-gray-400 hover:text-white cursor-pointer"
                                onClick={toggleLiked}
                            />
                        )}
                    </div>
                    <div
                        onKeyDown={(e) => { if (e.key === 'Enter') togglePlayPause(); }}
                        onKeyUp={(e) => { if (e.key === ' ') togglePlayPause(); }}
                        className='p-2 md:hidden rounded-full bg-white'
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent expandMusicPlayer
                            togglePlayPause();
                        }}
                    >
                        {isLoading ? <LoadingSpinner /> : playing ? <Pause color='black' size={30} /> : <Play color='black' size={30} />}
                    </div>
                </div>

                {/* Controls and Slider - not clickable to expand */}
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
                    {/* Controls */}
                    <div className='cursor-pointer hover:opacity-80 mt-3 md:m-0'>
                        <div className='md:flex justify-center items-center gap-4 hidden'>
                            <Shuffle />
                            <SkipBack onClick={(e) => { playPreviousSong(); }} />
                            <div
                                onKeyDown={(e) => { if (e.key === 'Enter') togglePlayPause(); }}
                                onKeyUp={(e) => { if (e.key === ' ') togglePlayPause(); }}
                                className='p-2 rounded-full bg-white'
                                onClick={(e) => { togglePlayPause(); }}
                            >
                                {isLoading ? <LoadingSpinner /> : playing ? <Pause color='black' size={35} /> : <Play color='black' size={35} />}
                            </div>
                            <SkipForward onClick={(e) => { playNextSong(); }} />
                            <Repeat />
                        </div>
                    </div>
                </div>

                {/* Volume controls - not clickable to expand */}
                <div className='items-center gap-3 md:flex hidden'>
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

                {/* Empty div to make the parent div clickable for expand */}
                <div
                    className="absolute inset-0 -z-10 cursor-pointer"
                    onClick={expandMusicPlayer}
                    onKeyDown={(e) => { if (e.key === 'Enter') expandMusicPlayer(); }}
                />
            </div>
            <div className='parentMusicClass flex w-full md:w-[15%] justify-between items-center gap-4'>
                <div className='flex items-center gap-2'>
                    <div className='bg-white h-10 w-10 rounded-full overflow-hidden'>
                        <img src={currentTrack?.images?.large} alt="" className='w-full h-full object-cover' />
                    </div>
                    <div className='flex flex-col'>
                        <h1 className='text-lg'>{trimString(currentTrack?.title, 30) || 'No Track Selected'}</h1>
                        <div className='flex items-center gap-1 flex-wrap'>
                            {currentTrack?.artists?.primary ? (
                                currentTrack.artists.primary.map((artist, index) => (
                                    <React.Fragment key={artist.id}>
                                        <Link
                                            to={`/artist/${artist.id}`}
                                            className='text-sm text-gray-400 underline hover:text-gray-300'
                                            onClick={(e) => { e.stopPropagation(); }}
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
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <div
                        onKeyDown={(e) => { if (e.key === 'Enter') togglePlayPause(); }}
                        onKeyUp={(e) => { if (e.key === ' ') togglePlayPause(); }}
                        className='p-2 md:hidden rounded-full bg-white'
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent expandMusicPlayer
                            togglePlayPause();
                        }}
                    >
                        {isLoading ? <LoadingSpinner /> : playing ? <Pause color='black' size={30} /> : <Play color='black' size={30} />}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MusicPlayer;
