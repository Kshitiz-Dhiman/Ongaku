import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "../components/ui/dropdown-menu"
import { EllipsisVertical } from 'lucide-react';
import LikedSongSkeleton from '@/components/LikedSongSkeleton';
import { AudioPlayerData } from '@/context/AudioPlayerContext';
const History = () => {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack, setCurrentTrack } = useContext(AudioPlayerData);

    const getHistory = async () => {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song/history`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });     
        setHistory(response.data.history);
        setLoading(false);
    }
    useEffect(() => {
        getHistory();
    }, []);
    const handlePlaySong = async (song) => {
        try {
            // const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${song.songId}`);
            // const songData = response.data.data;

            // const trackInfo = {
            //     id: songData.id,
            //     title: songData.title,
            //     subtitle: songData.artists?.primary?.map(artist => artist.name).join(", ") || songData.subtitle,
            //     images: songData.images,
            //     download_url: songData.download[4].link,
            //     artists: songData.artists,
            //     album: songData.album,
            //     duration: songData.duration,
            //     releaseDate: songData.releaseDate,
            //     label: songData.label,
            //     copyright: songData.copyright
            // };

            // setCurrentTrack(trackInfo);

            // const formattedSongs = likedSongs.map(likedSong => ({
            //     id: likedSong.songId,
            //     title: likedSong.title,
            //     subtitle: likedSong.artist,
            //     image: { small: likedSong.image }
            // }));

            // await playTrack(songData.download[4].link, songData.id, true, formattedSongs);
        } catch (error) {
            console.error('Error playing song:', error);
        }
    };

    return (
        <div className='w-full min-h-screen bg-black px-4 py-20 mt-20 md:mt-0 md:py-20 mb-10'>
            <h1 className='text-2xl sm:text-2xl mb-7 md:text-3xl lg:text-4xl font-bold md:mt-10 text-[#6e7273] text-left'>History</h1>
            <div className='flex flex-col w-full'>
                {loading ? (
                    <LikedSongSkeleton />
                ) : history.map((song) => {
                    return (
                        <div
                            key={song.songId}
                            className="flex items-center justify-between w-full py-2 px-4 mb-2 rounded-lg hover:bg-zinc-800/40 transition-all duration-300 cursor-pointer"
                            onClick={() => handlePlaySong(song)}
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={song.image}
                                    alt={song.title}
                                    className="w-12 h-12 rounded-md object-cover"
                                />
                                <div className="flex flex-col">
                                    <h1 className="text-white text-lg font-medium">{song.title}</h1>
                                    <h2 className="text-gray-400 text-sm">{song.artist}</h2>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="text-gray-400 hover:text-white transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <EllipsisVertical />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48 bg-[#101010] border-[#202020] text-white">
                                    <DropdownMenuItem>
                                        Add to the Queue
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[#202020]" />

                                    <DropdownMenuItem
                                        className="hover:bg-[#1a1a1a] cursor-pointer text-red-500"
                                    >
                                        Remove from History
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default History
