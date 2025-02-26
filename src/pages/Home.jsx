import { React, useEffect, useState } from 'react'
import TrendingHome from '../components/TrendingHome'
import NavBar from '../components/NavBar';
import axios from 'axios';
import Siderbar from '@/components/Siderbar';
import MusicPlayer from '@/components/MusicPlayer';
import Album from '@/components/Album';
const Home = () => {
    const [homesongs, setHomesongs] = useState([]);
    const [albumSongs, setAlbumSongs] = useState([]);
    const [otherAlbumsSongs, setOtherAlbumSongs] = useState([]);
    const musicUrl = import.meta.env.VITE_MUSIC_API;
    const getHomeSong = async () => {
        try {
            const res = await axios.get(`${musicUrl}/music/homepagesongs`);
            setHomesongs(res.data.content);
        } catch (e) {
            console.log(e);
        }
    }
    const getHomeAlbum = async () => {
        try {
            const res = await axios.get(`${musicUrl}/album/homepagetopalbums`);
            setAlbumSongs(res.data.content);
            setOtherAlbumSongs(res.data.content);

        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className='flex flex-col min-h-screen bg-[#0a1113] text-white'>
            <NavBar />
            <div className="flex flex-1 relative">
                <Siderbar />
                <main className="flex-1 md:ml-[12%]">
                    <TrendingHome />
                    {/* <Album /> */}
                </main>
            </div>
            <MusicPlayer />
        </div>
    )
}

export default Home
