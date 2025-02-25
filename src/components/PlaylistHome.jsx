import React, { useContext, useEffect, useState } from 'react'
import MusicCard from "./MusicCard";
import axios from 'axios';
import { AudioPlayerData } from '../context/AudioPlayerContext';

const PlaylistHome = () => {


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
        <div className='w-full min-h-screen bg-[#0a1113] px-4 sm:px-6 md:px-8 lg:px-10 py-20 md:py-24'>
            <div className='max-w-7xl mx-auto'>
                <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#6e7273] mb-6 md:mb-8'>
                    Home
                </h1>
                <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5'>
                    {homesongs.map((song) => (
                        <MusicCard key={song.id} song={song} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PlaylistHome
