import { React, useEffect, useState } from 'react'
import PlaylistHome from '../components/PlaylistHome'
import MadeForYou from '../components/MadeForYou';
import { BsThreeDots } from "react-icons/bs";
import NavBar from '../components/NavBar';
import axios from 'axios';
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

    useEffect(() => {
        getHomeSong();
        getHomeAlbum();
    }, [])

    return (
        <>
            <div className='bg-[#111111] p-4 flex flex-col min-h-screen min-w-full text-white mb-24'>
                <div className='flex gap-3 w-full items-start'>
                    <h1 className='bg-[#202020] px-6 py-2 rounded-xl'>Music</h1>
                    <h1 className='bg-[#202020] px-6 py-2 rounded-xl'>Albums</h1>
                </div>
                <div className='grid grid-cols-2 gap-4 justify-between mt-4'>
                    {homesongs.slice(0, 6).map((song) => {
                        return (
                            <PlaylistHome key={song.playlistId} song={song} />
                        )
                    })}
                </div>
                <div>
                    <div className='flex mt-6 justify-between items-center'>
                        <h1 className='text-xl font-bold'>Made for you</h1>
                        <h1><BsThreeDots size={"30px"} opacity={"0.5"} /></h1>
                    </div>
                    <div className='min-w-fit-content flex gap-3 mt-4 overflow-x-auto'>
                        {albumSongs.map((album) => {
                            return (
                                <MadeForYou key={album.playlistId} album={album} />
                            )
                        })}
                    </div>
                </div>
                <div>
                    <div className='flex mt-6 justify-between items-center'>
                        <h1 className='text-xl font-bold'>See Trending</h1>
                        <h1><BsThreeDots size={"30px"} opacity={"0.5"} /></h1>
                    </div>
                    <div className='min-w-fit-content flex gap-3 mt-4 overflow-x-auto'>
                        {otherAlbumsSongs.map((album) => {
                            return (
                                <MadeForYou key={album.playlistId} album={album} />
                            )
                        })}
                    </div>
                </div>
            </div>
            <NavBar />
        </>
    )
}

export default Home
