import React, { useEffect, useState, useRef } from 'react'
import { Play, Pause, Volume2, SkipForward, SkipBack, Shuffle, Repeat, VolumeOff, Volume1, Heart } from 'lucide-react';
import { useAudioPlayerContext } from 'react-use-audio-player';
import { useAudioStore } from '@/app/storeZustand';
import { Slider } from "./ui/slider";
import { LoadingSpinner } from './LoadingSpinner';
import { trimString, decodeHTMLEntities } from '@/utils/utils'
import gsap from "gsap";
import { useGSAP } from '@gsap/react';
import ExpandedMusicPlayer from './ExpandedMusicPlayer';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FaBackward, FaForward, FaPlay, FaPause } from "react-icons/fa6";
import { checkLikedStatus } from './hooks/useQuery';

gsap.registerPlugin(useGSAP);

const MusicPlayer = () => {
    const playerRef = useRef(null);
    const expandedPlayerRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useGSAP(() => {
        gsap.matchMedia("(min-width: 800px)", () => {
            gsap.from(playerRef.current, {
                y: 100,
                duration: 0.3,
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
                    duration: 0.3,
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
                onComplete: () => setIsExpanded(false)
            });
        } else {
            setIsExpanded(true);
        }
    };


    const { isliked, isLoading: likedLoading, error } = checkLikedStatus;

    const {
        currentSong,
        setCurrentSong,
        playTrack,
        handleSongEnd,
        handlePrevSong
    } = useAudioStore();

    const {
        playing,
        togglePlayPause,
        getPosition,
        isLoading,
        duration,
        volume,
        setVolume,
        seek,
        load
    } = useAudioPlayerContext();

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

    const playNextSong = async () => {
        await handleSongEnd();

    };

    const playPreviousSong = async () => {
        await handlePrevSong();

    };

    useEffect(() => {
        const initializePlayer = async () => {
            try {
                if (currentSong) {
                    load(currentSong.download_urls[4].link, {
                        autoplay: false,
                        initialVolume: 0.5,
                        onend: () => {
                            console.log("Song ended");
                        },
                    })
                } else {
                    console.warn('No current song found in store');
                }
            } catch (error) {
                console.error('Error initializing player:', error);
            }
        };

        initializePlayer();
    }, []); // Empty dependency array since we're using the store

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



    const toggleLiked = (e) => {
        e.stopPropagation();

        if (!currentSong || !localStorage.getItem('token')) {
            toast("Please login to like songs");
            return;
        }

        axios.post(`${import.meta.env.VITE_MUSIC_API}/liked/song`,
            {
                songId: currentSong.id,
                title: currentSong.title,
                artist: currentSong.subtitle || currentSong.artists?.primary?.[0]?.name,
                image: currentSong.image?.medium,
                download_urls: currentSong.download_urls
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

    return (
        <>
            <div className={`${isExpanded ? 'block' : 'hidden'}`}>
                <ExpandedMusicPlayer
                    expandedPlayerRef={expandedPlayerRef}
                    isExpanded={isExpanded}
                    currentTrack={currentSong}
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
                    className='parentMusicClass flex w-full md:w-[17%] justify-between items-center gap-4'
                    onClick={expandMusicPlayer}
                    onKeyDown={(e) => { if (e.key === 'Enter') expandMusicPlayer(); }}
                >
                    <div className='flex items-center gap-2 text-xl '>
                        <div className='bg-white h-12 w-12 rounded-lg overflow-hidden'>
                            <img src={currentSong?.image?.small} alt="image" className='w-full h-full object-cover' />
                        </div>
                        <div className='flex flex-col justify-around  '>
                            <h1 className='text-lg font-bold'>{trimString(currentSong?.title, 40) || 'No Track Selected'}</h1>
                            <div className='flex items-center gap-2  flex-wrap'>
                                {currentSong?.artists ? (
                                    currentSong.artists.map((artist, index) => (
                                        <React.Fragment key={artist.id}>
                                            <Link
                                                to={`/artist/${artist.id}`}
                                                className='text-sm font-bold text-gray-400 hover:text-gray-300'
                                                onClick={(e) => { e.stopPropagation(); }}
                                            >

                                                {decodeHTMLEntities(trimString(artist.name, Math.floor(30 / currentSong.artists.length))) + (index < currentSong.artists.length - 1 ? ', ' : '')}
                                            </Link>
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
                    <div className='p-2 md:hidden  active:bg-[#202020] rounded-full transition duration-200 ease-in-out  '
                        onKeyDown={(e) => { if (e.key === 'Enter') togglePlayPause(); }}
                        onKeyUp={(e) => { if (e.key === ' ') togglePlayPause(); }}
                        onClick={(e) => {
                            togglePlayPause();
                            e.stopPropagation();
                        }}
                    >
                        {isLoading ? <LoadingSpinner /> : playing ? <FaPause color='white' size={30} /> : <FaPlay color='white' size={30} />}
                    </div>
                </div>

                {/* Controls and Slider  */}
                <div className='flex flex-col items-center gap-4 w-full md:w-auto'>
                    <Slider
                        value={[pos]}
                        max={duration}
                        min={0}
                        step={0.1}
                        onValueChange={handleSliderChange}
                        onPointerDown={() => setIsDragging(true)}
                        onValueCommit={handleSliderCommit}
                        className="w-9/10 top-0 md:w-[600px] h-1 rounded-lg bg-gray-600 md:relative absolute cursor-pointer"
                    />
                    {/* Controls */}
                    <div className='cursor-pointer hover:opacity-80 mt-3 md:m-0'>
                        <div className='md:flex justify-center items-center gap-6 hidden'>
                            <Shuffle className='text-gray-400' />
                            <FaBackward size={30} className='text-gray-400' onClick={(e) => { playPreviousSong(); }} />
                            <div
                                onKeyDown={(e) => { if (e.key === 'Enter') togglePlayPause(); }}
                                onKeyUp={(e) => { if (e.key === ' ') togglePlayPause(); }}
                                className='p-3 rounded-full bg-gray-400'
                                onClick={(e) => { togglePlayPause(); }}
                            >
                                {isLoading ? <LoadingSpinner /> : playing ? <FaPause color='black' size={30} /> : <FaPlay color='black' size={30} />}
                            </div>
                            <FaForward size={30} className='text-gray-400' onClick={(e) => { playNextSong(); }} />
                            <Repeat className='text-gray-400' />
                        </div>
                    </div>
                </div>

                {/* Volume controls */}
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
        </>
    );
};

export default MusicPlayer;
