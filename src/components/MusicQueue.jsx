import React, { useContext, useRef, useEffect, useState } from 'react'
import Equaliser from '../assets/equaliser.gif';
import { useAudioStore } from '@/app/storeZustand';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const MusicQueue = ({ onClose }) => {
    const { musicQueue, currentSong, playTrack } = useAudioStore();
    const queueLength = musicQueue.length;
    const containerRef = useRef(null);
    const itemsRef = useRef([]);
    const headerRef = useRef(null);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        itemsRef.current = [];
    }, []);

    useGSAP(() => {
        if (!isClosing) {
            // Opening animation
            gsap.fromTo(containerRef.current,
                {
                    opacity: 0,
                    y: 50
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out"
                }
            );

            gsap.fromTo(headerRef.current,
                {
                    opacity: 0,
                    y: -20
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    delay: 0.2,
                    ease: "power2.out"
                }
            );
        }
    }, [musicQueue, isClosing]);

    const handleClose = () => {
        setIsClosing(true);

        // Animate items out first
        gsap.to(itemsRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.in"
        });

        gsap.to(headerRef.current, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            delay: 0.1,
            ease: "power2.in"
        });

        gsap.to(containerRef.current, {
            opacity: 0,
            y: 50,
            duration: 0.4,
            delay: 0.2,
            ease: "power2.in",
            onComplete: () => {
                onClose();
            }
        });
    };

    const handleMouseEnter = (index) => {
        if (isClosing) return;
        gsap.to(itemsRef.current[index], {
            scale: 1.02,
            duration: 0.2,
            ease: "power2.out"
        });
    };

    const handleMouseLeave = (index) => {
        if (isClosing) return;
        gsap.to(itemsRef.current[index], {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
        });
    };

    const handleClick = (index, song) => {
        if (isClosing) return;
        gsap.to(itemsRef.current[index], {
            scale: 0.98,
            duration: 0.1,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                playTrackFromQueue(song);
            }
        });
    };

    const playTrackFromQueue = async (song) => {
        const currentIndex = musicQueue.findIndex(s => s.id === song.id || s.songId === song.id);
        const remainingQueue = musicQueue.slice(currentIndex);

        await playTrack(song, false, remainingQueue);
    }

    return (
        <div
            ref={containerRef}
            className='md:bg-none bg-none md:h-[47vh] h-screen md:w-full sm:w-[600px] overflow-y-auto p-6 rounded-lg'
        >
            <div
                ref={headerRef}
                className='flex justify-between items-center mb-6'
            >
                <h2 className='text-white text-2xl font-bold'>
                    Queue ({queueLength})
                </h2>
                <button
                    onClick={handleClose}
                    className='text-white md:hidden hover:text-gray-300 transition-colors h-10 w-12 font-bold duration-200'
                    disabled={isClosing}
                >
                    ✕
                </button>
            </div>
            <ul className='space-y-4'>
                {musicQueue.map((song, index) => {
                    const isCurrentSong = currentSong && (currentSong.id === song.songId)
                    return (
                        <li
                            onClick={() => { playTrackFromQueue(song.download_url, song.id, true, musicQueue); }}
                            key={index}
                            className='bg-zinc-800 rounded-lg p-4 text-white hover:bg-zinc-800 transition-colors duration-200 h-20 flex items-center justify-between group'>

                            <div className='flex-1 truncate mr-4'>
                                <p className='font-medium truncate'>{song.title}</p>
                                {song.subtitle && (
                                    <p className='text-sm text-gray-400 truncate'>{song.subtitle}</p>
                                )}
                            </div>
                            <img
                                src={Equaliser}
                                alt="equaliser"
                                className={`h-32 w-12 ml-2 inline-block object-cover transition-opacity duration-200 ${isCurrentSong
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover:opacity-100'
                                    }`}
                            />
                        </li>
                    )
                }
                )}
            </ul>
        </div>
    )
}
export default MusicQueue
