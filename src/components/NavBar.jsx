import React, { useContext, useEffect, useState } from 'react'
import { FiSearch } from "react-icons/fi";
import { Music, NavigationOff } from "lucide-react"
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { AudioPlayerData } from '../context/AudioPlayerContext';
import { useNavigate } from 'react-router-dom';
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

const NavBar = ({ onAlbumSelect, onArtistSelect }) => {
    const [songSuggestions, setSongSuggestions] = useState([]);
    const [albumSuggestions, setAlbumSuggestions] = useState([]);
    const [artistSuggestions, setArtistSuggestions] = useState([]);
    const [top_query, setTopQuery] = useState([]);
    const loadSuggestions = async (inputValue) => {
        try {
            const response = await axios(`${import.meta.env.VITE_MUSIC_API}/search?q=${inputValue}`)
            const data1 = response.data;
            // console.log(data1.data.top_query);
            setSongSuggestions(data1.data.songs.data);
            setAlbumSuggestions(data1.data.albums.data);
            setTopQuery(data1.data.top_query.data);
            setArtistSuggestions(data1.data.artists.data);
            const suggestions = [
                {
                    label: "Top Search",
                    options: data1.data.top_query.data.map((query) => ({
                        value: query.id,
                        label: `${query.title} - ${query.description}`,
                        type: "top_query"
                    }))
                },
                {
                    label: "Songs",
                    options: songSuggestions.map((song) => ({
                        value: song.id,
                        label: `${song.title} - ${song.more_info.primary_artists}`,
                        type: "song"
                    }))
                },
                {
                    label: "Albums",
                    options: albumSuggestions.map((album) => ({
                        value: album.id,
                        label: `${album.title} - ${album.more_info.music}`,
                        type: "album"
                    }))
                },
                {
                    label: "Artists",
                    options: artistSuggestions.map((artist) => ({
                        value: artist.id,
                        label: `${artist.title}`,
                        type: "artist"
                    }))
                }
            ];

            return suggestions;
        } catch (e) {
            console.log(e);
        }
    };
    const {
        playTrack,
        setQueue,
        setCurrentTrack
    } = useContext(AudioPlayerData);
    const [selectedOption, setSelectedOption] = useState(null);
    const navigate = useNavigate();
    const songOptionsFunction = async (option) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${option.value}`);
            const songData = response.data;

            const trackInfo = {
                id: songData.data.id,
                title: songData.data.title,
                subtitle: songData.data.artists?.primary?.map(artist => artist.name).join(", ") || songData.data.subtitle,
                images: songData.data.images,
                download_url: songData.data.download[4].link,
                artists: songData.data.artists,
                album: songData.data.album,
                duration: songData.data.duration,
                releaseDate: songData.data.releaseDate,
                label: songData.data.label,
                copyright: songData.data.copyright
            };

            setCurrentTrack(trackInfo);
            await playTrack(songData.data.download[4].link, songData.data.id);
        } catch (error) {
            console.error('Error playing song:', error);
        }
    }

    const handleSelect = async (option) => {
        if (option?.type === 'top_query') {
            // console.log(top_query[0])
            const removeTypes = top_query.filter((item) => item.type === "song" || item.type === "album" || item.type === "artist")
            if (removeTypes.length === 0) {
                alert("Shows cant be played")
                return;
            }
            if (top_query[0].type === "song") {
                console.log("This is the song type")
                await songOptionsFunction(option);
            } else if (top_query[0].type === "album") {
                // onAlbumSelect(option.value);
                navigate(`/album/${option.value}`)
            } else if (top_query[0].type === "artist") {
                // onArtistSelect(option.value);
                navigate(`/artist/${option.value}`)
            }
        } else if (option?.type === 'song') {
            await songOptionsFunction(option)
        } else if (option?.type === 'album') {
            // onAlbumSelect(option.value);
            navigate(`/album/${option.value}`)
        } else if (option?.type === 'artist') {
            // onArtistSelect(option.value);
            navigate(`/artist/${option.value}`)
        }
    };

    return (
        <div className='fixed bg-black w-full h-[12vh] flex flex-col md:flex-row justify-between items-center px-4  md:px-12 z-[100] pt-2'>
            <div className='flex items-center justify-center gap-2 mb-2 md:mb-0'>
                <Music size={34} color='#f2371d' strokeWidth={4} className='mt-2' />
                <h1 className='text-2xl md:text-3xl font-bold'> Ongaku</h1>
            </div>
            <div className="relative w-full md:w-1/3 flex items-center mb-2 md:mb-0">
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
        </div>
    );
};

export default NavBar
