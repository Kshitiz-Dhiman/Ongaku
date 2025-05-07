import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify';
import { EllipsisVertical } from 'lucide-react';
import LikedSongSkeleton from '@/components/LikedSongSkeleton';
const Library = () => {
    const [loading, setLoading] = useState(false);
    const [likedSongs, setlikedSongs] = useState([]);
    const [likedAlbums, setlikedAlbums] = useState([]);
    const [likedArtists, setlikedArtists] = useState([]);

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

    useEffect(() => {
        getLikedSongs();
    }, []);
    return (
        <div className='w-full min-h-screen bg-black px-4 py-20 mt-20 md:mt-0 md:py-20'>
            <h1 className='text-2xl sm:text-2xl mb-7 md:text-3xl lg:text-4xl font-bold md:mt-10 text-[#6e7273] text-left'>Liked Songs</h1>
            <div className='flex flex-col w-full'>

                {loading ? (
                    <LikedSongSkeleton />
                ) : likedSongs.map((song) => {
                    return (
                        <div
                            key={song._id}
                            className="flex items-center justify-between w-full py-2 px-4 mb-2 rounded-lg hover:bg-zinc-800/40 transition-all duration-300 cursor-pointer"
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
                            <h1 className="text-gray-400 text-sm"><EllipsisVertical /></h1>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Library
