import { React, useEffect, useState } from 'react'
import PlaylistHome from '../components/PlaylistHome'
import MadeForYou from '../components/MadeForYou';
import { BsThreeDots } from "react-icons/bs";
import NavBar from '../components/NavBar';
import axios from 'axios';
import Siderbar from '@/components/Siderbar';
import SearchResult from '@/components/SearchableDropdown';
import MusicPlayer from '@/components/MusicPlayer';
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
            // console.log(res.data.content);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <>
            <div className='flex flex-col bg-[#0a1113] h-screen min-w-full text-white'>
                <div>
                    <NavBar />
                    {/* <SearchResult /> */}
                </div>
                <div className="flex w-full ">
                    <Siderbar />
                    <PlaylistHome />
                </div>
                <MusicPlayer />
            </div>
        </>
    )
}

export default Home
