import React, { useContext, useEffect, useState } from 'react'
import { GoHomeFill } from "react-icons/go";
import { FiSearch } from "react-icons/fi";
import { MdLibraryMusic } from "react-icons/md";
import { Link } from 'react-router-dom';
import { Music } from "lucide-react"
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { AudioPlayerData } from '../context/AudioPlayerContext';
const customStyles = {
    control: (base) => ({
        ...base,
        backgroundColor: '#080c10',
        border: 'none',
        borderRadius: '1rem',
        padding: '0.5rem',
        paddingInlineStart: '2rem',
        width: '100%',
        color: 'white'
    }),
    input: (base) => ({
        ...base,
        color: 'white'
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: '#080c10',
        border: 'none',
        borderRadius: '1rem',
        marginTop: '0.5rem'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? '#262626' : '#080c10',
        color: 'white',
        padding: '0.75rem',
        cursor: 'pointer'
    })
};

const NavBar = () => {
    const [topQuery, setTopQuery] = useState();
    const [songSuggestions, setSongSuggestions] = useState([]);
    const [albumSuggestions, setAlbumSuggestions] = useState([]);
    const [playlistSuggestions, setPlaylistSuggestions] = useState([]);
    const loadSuggestions = async (inputValue) => {
        try {
            const response = await axios(`http://localhost:4000/search?q=${inputValue}`)
            const data1 = response.data;
            console.log(data1);
            setTopQuery(data1.data.top_query.data);
            setSongSuggestions(data1.data.songs.data);
            setAlbumSuggestions(data1.data.albums.data);
            setPlaylistSuggestions(data1.data.playlists.data);
            const suggestions = [
                {
                    label: "Songs",
                    options: songSuggestions.map((song) => ({
                        value: song.id,
                        label: song.name,
                        type: "song"
                    }))
                },
                {
                    label: "Albums",
                    options: albumSuggestions.map((album) => ({
                        value: album.id,
                        label: album.name,
                        type: "album"
                    }))
                },
                {
                    label: "Playlists",
                    options: playlistSuggestions.map((playlist) => ({
                        value: playlist.id,
                        label: playlist.name,
                        type: "playlist"
                    }))
                }
            ];
            // console.log(suggestions)
            return suggestions;
        } catch (e) {
            console.log(e);
        }
    };

    const {
        playTrack,
        currentTrack,
        setCurrentTrack
    } = useContext(AudioPlayerData);
    const [selectedOption, setSelectedOption] = useState(null);

    const handleSelect = async (option) => {
        if (option?.type === 'song') {
            try {
                const response = await axios.get(`http://localhost:3000/song?id=${option.value}`);
                const songData = response.data;
                playTrack(songData.download[4].link);
                const trackInfo = {
                    id: songData.data.songs[0].id,
                    title: songData.data.songs[0].title,
                    subtitle: songData.data.songs[0].subtitle,
                    image: songData.data.songs[0].image,
                }
                setCurrentTrack(trackInfo);
                console.log(currentTrack);
            } catch (error) {
                console.error('Error fetching song details:', error);
            }
        }
    };

    return (
        <div className='fixed bg-[#0a1113] w-full h-[12vh] flex justify-between items-center px-12 z-[100]'>
            <div className='flex items-center justify-center gap-2'>
                <Music size={34} color='#f2371d' strokeWidth={4} className='mt-2' />
                <h1 className='text-3xl font-bold'> Ongaku</h1>
            </div>
            <div className="relative w-1/3 flex items-center">
                <FiSearch className="absolute left-3 text-gray-400 w-5 h-5 z-10" />
                <AsyncSelect
                    cacheOptions
                    value={selectedOption}
                    onChange={handleSelect}
                    loadOptions={loadSuggestions}
                    styles={customStyles}
                    placeholder="Search for music, playlist or albums"
                    className="w-full"
                    noOptionsMessage={() => "Start typing to search..."}
                />
            </div>
            <div className='flex gap-4'>
                <Link to='/'>
                    <GoHomeFill size={30} />
                </Link>
                <Link to='/search'>
                    <FiSearch size={30} />
                </Link>
                <Link to='/library'>
                    <MdLibraryMusic size={30} />
                </Link>
            </div>
        </div>
    );
};

export default NavBar
