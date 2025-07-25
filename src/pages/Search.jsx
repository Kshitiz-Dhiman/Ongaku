import React, { useState, useContext } from 'react'
import NavBar from '../components/NavBar'
// import { FiSearch } from "react-icons/fi";
import axios from 'axios';
import { AudioPlayerData } from '../context/AudioPlayerContext';
const Search = () => {
    const { playTrack } = useContext(AudioPlayerData);

    const [searchQuery, SearchQuery] = useState("");
    const [music, setMusic] = useState([]);
    const musicUrl = import.meta.env.VITE_MUSIC_API;
    async function getSongs() {
        try {
            const res = await axios.get(`${musicUrl}/music/getsong?q=${searchQuery}`);

            setMusic(res.data.content);
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <>
            <div className='bg-[#111111] p-4 flex flex-col min-h-screen min-w-full text-white mb-10'>
                <div className='flex gap-3 w-full items-start'>
                    <input
                        onChange={(e) => SearchQuery(e.target.value)}
                        type="text" className='bg-[#202020] w-full p-3 rounded-xl outline-none' placeholder='What do you want to play' />
                    <button onClick={getSongs} type="button" className='bg-[#202020] p-3 rounded-xl '>Search</button>
                </div>
                <div className='flex flex-col gap-4 w-full p-4 rounded-xl mt-4'>

                    {music.map((song) => {
                        return (
                            <div key={song?.videoId} onClick={() => playTrack(song)} onKeyPress={(e) => { if (e.key === 'Enter') playTrack(song); }}
                                className='flex cursor-pointer items-center gap-4 hover:bg-[#202020]  rounded-xl' tabIndex="0">
                                <div>
                                    <img className='h-10 w-10 object-cover' src={song.thumbnails[0].url} alt="" />
                                </div>
                                <div>
                                    <h1 className='text-base'>{song.name}</h1>
                                    <h1 className='text-sm text-[#898989]'>{song.artist.name}</h1>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <NavBar />
        </>
    )
}

export default Search
