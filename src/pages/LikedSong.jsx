import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify';
import { EllipsisVertical } from 'lucide-react';
import LikedSongSkeleton from '@/components/LikedSongSkeleton';
// import { AudioPlayerData } from '../context/AudioPlayerContext';
import { useAudioStore } from '@/app/storeZustand';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { addAudio } from '@/app/indexDB';
import { useAudioPlayerContext } from 'react-use-audio-player';

const LikedSong = () => {
    const [loading, setLoading] = useState(false);
    const [likedSongs, setlikedSongs] = useState([]);
    const [likedAlbums, setlikedAlbums] = useState([]);
    const [likedArtists, setlikedArtists] = useState([]);
    const { playTrack } = useAudioStore();
    const { load } = useAudioPlayerContext();
    const getLikedSongs = async () => {
        setLoading(true);
        try {
            if (!localStorage.getItem("token")) {
                toast.error("Please login to continue");
                return;
            }

            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/liked/songs`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (likedSongs.length === 0) {
                setlikedSongs("No Liked Songs");
            }
            setlikedSongs(response.data.likedSongs.reverse());
            setLoading(false);
        } catch (e) {
            console.log(e);
        }
    }

    const handlePlaySong = async (song) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${song.songId}`);
            const songData = response.data.data;
            songData.images.large = songData.images.large.replace("150x150", "500x500")
            const audio = {
                id: songData.id,
                title: songData.title,
                download_urls: songData.download,
                subtitle: songData.subtitle,
                artists: songData.artists.primary,
                image: songData.images,
                type: "song"
            }
            await playTrack(audio, false, likedSongs);
        } catch (error) {
            console.error('Error playing song:', error);
        }
    };

    useEffect(() => {
        getLikedSongs();
    }, []);


    if (!localStorage.getItem("token")) {
        return (
            <div className='w-full min-h-screen bg-black px-4 py-20 mt-20 md:mt-0 md:py-20'>
                <h1 className='
                    text-2xl sm:text-2xl mb-7 md:text-3xl lg:text-4xl font-bold md:mt-10 text-[#6e7273] text-left
                '>
                    Login Required
                </h1>
            </div>
        )
    }

    const songMenu = () => {

    }
    const handleRemoveFromLiked = async (songId, e) => {
        e.stopPropagation();
        try {
            await axios.delete(`${import.meta.env.VITE_MUSIC_API}/liked/songs/${songId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
            getLikedSongs(); // Refresh the list
            toast.success("Song removed from liked songs");
        } catch (error) {
            console.error('Error removing song:', error);
            toast.error("Failed to remove song");
        }
    };

    const handleAddToDownloads = async (id, e) => {
        e.stopPropagation();
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${id}`);
            const songData = response.data.data;

            const audio = {
                id: songData.id,
                title: songData.title,
                subtitle: songData.artists?.primary?.map(artist => artist.name).join(", ") || songData.subtitle,
                images: songData.images,
                download_url: songData.download[4].link,
                artists: songData.artists,
                album: songData.album,
                duration: songData.duration,
                releaseDate: songData.releaseDate,
                label: songData.label,
            }
            // console.log(audio)
            await addAudio(songData.id, audio);
            alert("Song added to downloads");
        } catch (e) {
            console.log(e);
        }
    }

    const handleAddToQueue = (e) => {
        e.stopPropagation();
        // Add your queue logic here
    }

    return (
        <div className='w-full min-h-screen bg-black px-4 py-20 mt-20 md:mt-0 md:py-20 mb-10'>
            <h1 className='text-2xl sm:text-2xl mb-7 md:text-3xl lg:text-4xl font-bold md:mt-10 text-[#6e7273] text-left'>Liked Songs</h1>
            <div className='flex flex-col w-full'>
                {loading ? (
                    <LikedSongSkeleton />
                ) : likedSongs.map((song) => {
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
                                <DropdownMenuContent
                                    className="w-48 bg-[#101010] border-[#202020] text-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <DropdownMenuItem onClick={handleAddToQueue}>
                                        Add to the Queue
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => handleAddToDownloads(song.songId, e)}>
                                        Add to Downloads
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[#202020]" />

                                    <DropdownMenuItem
                                        className="hover:bg-[#1a1a1a] cursor-pointer text-red-500"
                                        onClick={(e) => handleRemoveFromLiked(song.songId, e)}
                                    >
                                        Remove from Liked
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

export default LikedSong
