import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify';

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
            console.log(response.data);
            setlikedSongs(response.data.likedSongs);
            setLoading(false);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        getLikedSongs();
    }, []);
    return (
        <div className='w-full min-h-screen bg-black px-4 py-20 mt-20 md:mt-0 md:py-20 '>
            <h1 className='text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#6e7273] text-left'>Liked Songs</h1>
        </div>
    )
}

export default Library
