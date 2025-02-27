import React, { useContext, useEffect, useState } from 'react'
import MusicCard from "./MusicCard";
import axios from 'axios';
import MusicCardSkeleton from './MusicCardSkeleton';

const PlaylistHome = ({ key }) => {
    const [homesongs, setHomesongs] = useState([]);
    const type = "song";
    const language = "english";
    const getHomeSongs = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/get/trending?lang=${language}&type=${type}`);
            const homeSongs = response.data.data;
            setHomesongs(homeSongs);
        } catch (e) {
            console.log(e);
        }
    }
    useEffect(() => { getHomeSongs() }, [])


    return (
        <div className='w-full min-h-screen bg-black px-4 py-20 md:py-24 '>
            <div className='max-w-7xl mx-auto mt-12 md:mt-5'>
                <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#6e7273] mb-6 md:mb-8'>
                    Trending
                </h1>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6'>
                    {homesongs.length > 0 ? homesongs.map((song) => (
                        <MusicCard key={song.id} song={song} />
                    )) : Array(10).fill().map((_, index) => (
                        <MusicCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PlaylistHome
