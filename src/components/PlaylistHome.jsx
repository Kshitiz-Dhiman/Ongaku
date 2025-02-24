import React, { useEffect, useState } from 'react'
import MusicCard from "./MusicCard";
import axios from 'axios';

const PlaylistHome = () => {

    const [homesongs, setHomesongs] = useState([]);
    const url = "http://localhost:4000/get/trending?lang=english&type=album";
    const getHomeSongs = async () => {
        try {
            const res = await axios.get(url);
            setHomesongs(res.data.data);
            // console.log(res.data.data);
        } catch (e) {
            console.log(e);
        }
    }
    useEffect(() => { getHomeSongs() }, [])
    return (
        //bg-[#0a1113]
        <div className='w-5/6 min-h-screen ml-[20%] mt-[6.6%] bg-[#0a1113]'>
            <h1 className='text-4xl font-bold text-[#6e7273]'>Home</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-5'>
                {homesongs.map((song) => (
                    <MusicCard key={song.id} song={song} />
                ))}
            </div>
        </div>
    )
}

export default PlaylistHome
