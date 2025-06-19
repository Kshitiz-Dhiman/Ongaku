import React, { useContext, useEffect, useState } from 'react'
import { FiSearch } from "react-icons/fi";
import { Music, NavigationOff } from "lucide-react"
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import { AudioPlayerData } from '../context/AudioPlayerContext';
import { useNavigate, NavLink } from 'react-router-dom';
import SampleLogin from '@/pages/LoginBtn';
import { useAuthUserInfo } from '../context/AuthUserInfoContext';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import image from "../assets/avatar.jpeg";

const customStyles = {
    control: (base) => ({
        ...base,
        backgroundColor: '#101010',
        border: 'none',
        borderRadius: '1rem',
        padding: '0.5rem',
        paddingInlineStart: '2rem',
        width: '100%',
        color: 'white'
    }),
    input: (base) => ({
        ...base,
        color: 'white',
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: '#101010',
        border: 'none',
        borderRadius: '1rem',
        marginTop: '0.5rem'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? '#1a1a1a' : '#101010',
        color: 'white',
        padding: '0.75rem',
        cursor: 'pointer'
    })
};

const NavBar = () => {
    const [songSuggestions, setSongSuggestions] = useState([]);
    const [albumSuggestions, setAlbumSuggestions] = useState([]);
    const [artistSuggestions, setArtistSuggestions] = useState([]);
    const [top_query, setTopQuery] = useState([]);
    const loadSuggestions = async (inputValue) => {
        try {
            const response = await axios(`${import.meta.env.VITE_MUSIC_API}/search?q=${inputValue}`)
            const data1 = response.data;
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
            const removeTypes = top_query.filter((item) => item.type === "song" || item.type === "album" || item.type === "artist")
            if (removeTypes.length === 0) {
                alert("Shows cant be played")
                return;
            }
            if (top_query[0].type === "song") {
                console.log("This is the song type")
                await songOptionsFunction(option);
            } else if (top_query[0].type === "album") {
                navigate(`/album/${option.value}`)
            } else if (top_query[0].type === "artist") {
                navigate(`/artist/${option.value}`)
            }
        } else if (option?.type === 'song') {
            await songOptionsFunction(option)
        } else if (option?.type === 'album') {
            navigate(`/album/${option.value}`)
        } else if (option?.type === 'artist') {
            navigate(`/artist/${option.value}`)
        }
    };

    const userInfo = useAuthUserInfo();
    const { setUserInfo } = useAuthUserInfo();

    const logoutAuthUser = () => {
        localStorage.removeItem("token");
        setUserInfo(null);
        window.location.reload();
    };



    return (
        // Navbar component with improved responsive layout
        <div className='fixed bg-black w-full flex flex-wrap justify-between items-center px-4 md:px-12 z-[99] pt-5 pb-2'>
            {/* Logo - First on desktop and mobile */}
            <div className='flex order-1 items-center justify-center gap-2 w-auto'>
                <Music size={34} color='#f2371d' strokeWidth={4} className='mt-2' />
                <h1 className='hidden sm:block text-2xl md:text-3xl font-bold'> Ongaku</h1>
            </div>

            {/* User controls - On right side for desktop, but second item on mobile */}
            <div className='flex order-2 md:order-3 items-center justify-center gap-4 w-auto'>
                {!localStorage.getItem("token") ? <SampleLogin /> : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center justify-between gap-2 bg-[#101010] p-2 md:px-4 md:py-3 rounded-full md:rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                                <img
                                    src={userInfo?.userInfo?.image ? userInfo?.userInfo?.image : image}
                                    className="w-9 h-9 md:w-8 md:h-8 rounded-full object-cover"
                                />
                                <span className="md:block hidden text-md font-medium">
                                    {userInfo?.userInfo?.name}
                                </span>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="fixed left-[-165px] w-56 bg-[#101010] border-[#202020] z-[100] text-white">
                            <DropdownMenuLabel className="font-bold text-gray-300">My Account</DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <NavLink to='/profile'>

                                    <DropdownMenuItem className="hover:bg-[#1a1a1a] cursor-pointer">
                                        Profile
                                    </DropdownMenuItem>
                                </NavLink>
                                <NavLink to='/account/history'>
                                    <DropdownMenuItem className="hover:bg-[#1a1a1a] cursor-pointer">
                                        History
                                    </DropdownMenuItem>
                                </NavLink>

                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="bg-[#202020]" />
                            <DropdownMenuItem onClick={() => logoutAuthUser()} className="cursor-pointer text-red-500">
                                <span>
                                    Log out
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Search bar - Middle on desktop, bottom on mobile (full width) */}
            <div className="relative order-3 md:order-2 w-full md:w-1/3 flex items-center mt-2 md:mt-0">
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
