import React, { useContext, useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react'
import { FiSearch } from "react-icons/fi";
import { Music, NavigationOff } from "lucide-react"
// Replaced react-select Async with a lightweight async dropdown using existing UI primitives
import axios from 'axios';
import { useNavigate, NavLink } from 'react-router-dom';
import SampleLogin from '@/pages/LoginBtn';
import { useAuthUserInfo } from '../context/AuthUserInfoContext';
import Favicon from '../../public/newfavicon.png';
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
import { useAudioStore } from '@/app/storeZustand';
import { useAudioPlayerContext } from 'react-use-audio-player';

const NavBar = () => {
    const [songSuggestions, setSongSuggestions] = useState([]);
    const [albumSuggestions, setAlbumSuggestions] = useState([]);
    const [artistSuggestions, setArtistSuggestions] = useState([]);
    const [top_query, setTopQuery] = useState([]);
    const [suggestionsGrouped, setSuggestionsGrouped] = useState([]);
    const [query, setQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const timerRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState(null);
    const [isFocused, setIsFocused] = useState(false);

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
                        image: query.image || null,
                        type: "top_query"
                    }))
                },
                {
                    label: "Songs",
                    options: data1.data.songs.data.map((song) => ({
                        value: song.id,
                        label: `${song.title} - ${song.more_info?.primary_artists || ''}`,
                        image: song.image || null,
                        type: "song"
                    }))
                },
                {
                    label: "Albums",
                    options: data1.data.albums.data.map((album) => ({
                        value: album.id,
                        label: `${album.title} - ${album.more_info?.music || ''}`,
                        image: album.image || null,
                        type: "album"
                    }))
                },
                {
                    label: "Artists",
                    options: data1.data.artists.data.map((artist) => ({
                        value: artist.id,
                        label: `${artist.title}`,
                        image: artist.image || null,
                        type: "artist"
                    }))
                }
            ];

            return suggestions;
        } catch (e) {
            console.log(e);
        }
    };

    const debouncedLoad = useCallback((value) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            const grouped = await loadSuggestions(value || '');
            if (grouped) {
                setSuggestionsGrouped(grouped);
                setDropdownOpen(true);
                requestAnimationFrame(() => {
                    if (inputRef.current) {
                        const rect = inputRef.current.getBoundingClientRect();
                        setDropdownPos({ left: rect.left, top: rect.bottom, width: rect.width });
                    }
                });
            } else {
                setSuggestionsGrouped([]);
                setDropdownOpen(false);
            }
        }, 250);
    }, []);

    const handleFocus = async () => {
        setIsFocused(true);
        if (query && query.length > 0) {
            debouncedLoad(query);
        } else {
            const grouped = await loadSuggestions('');
            if (grouped) {
                setSuggestionsGrouped(grouped);
                setDropdownOpen(true);
                requestAnimationFrame(() => {
                    if (inputRef.current) {
                        const rect = inputRef.current.getBoundingClientRect();
                        setDropdownPos({ left: rect.left, top: rect.bottom, width: rect.width });
                    }
                });
            }
        }
    };

    useEffect(() => {
        if (!dropdownOpen) return;

        const update = () => {
            if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                setDropdownPos({ left: rect.left, top: rect.bottom, width: rect.width });
            }
        };

        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        update();

        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [dropdownOpen]);

    useEffect(() => {
        const onDocClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !inputRef.current.contains(e.target)) {
                setDropdownOpen(false);
                setIsFocused(false);
            }
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setDropdownOpen(false);
        };
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('click', onDocClick);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    const navigate = useNavigate();

    const { playTrack } = useAudioStore();

    const playSongFromSearch = async (songId, sourceList = []) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${songId}`);
            const songData = response.data.data;

            songData.images.large = songData.images.large.replace("150x150", "500x500");

            const audio = {
                id: songData.id,
                title: songData.title,
                download_urls: songData.download,
                subtitle: songData.subtitle,
                artists: songData.artists.primary,
                image: songData.images,
                type: "song"
            };

            let playlistData = [];
            if (sourceList.length > 0) {
                const convertedSongs = await Promise.all(
                    sourceList.map(async (searchSong) => {
                        try {
                            const songResponse = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${searchSong.id}`);
                            const fullSongData = songResponse.data.data;
                            fullSongData.images.large = fullSongData.images.large.replace("150x150", "500x500");

                            return {
                                id: fullSongData.id,
                                title: fullSongData.title,
                                download_urls: fullSongData.download,
                                subtitle: fullSongData.subtitle,
                                artists: fullSongData.artists.primary,
                                image: fullSongData.images,
                                type: "song"
                            };
                        } catch (error) {
                            console.error(`Error fetching song ${searchSong.id}:`, error);
                            return null;
                        }
                    })
                );

                playlistData = convertedSongs.filter(song => song !== null);
            }
            await playTrack(audio, true, []);

        } catch (error) {
            console.error('Error playing song from search:', error);
        }
    };

    const handleSelect = async (option) => {
        if (option?.type === 'top_query') {
            const topQueryItem = top_query.find(item => item.id === option.value);
            if (!topQueryItem) {
                console.error("Top query item not found");
                return;
            }

            const removeTypes = top_query.filter((item) => item.type === "song" || item.type === "album" || item.type === "artist")
            if (removeTypes.length === 0) {
                alert("Shows cant be played")
                return;
            }

            if (topQueryItem.type === "song") {
                console.log("This is the song type")
                await playSongFromSearch(option.value, songSuggestions);
            } else if (topQueryItem.type === "album") {
                navigate(`/album/${option.value}`)
            } else if (topQueryItem.type === "artist") {
                navigate(`/artist/${option.value}`)
            }
        } else if (option?.type === 'song') {
            await playSongFromSearch(option.value, songSuggestions);
        } else if (option?.type === 'album') {
            navigate(`/album/${option.value}`)
        } else if (option?.type === 'artist') {
            navigate(`/artist/${option.value}`)
        }

        setDropdownOpen(false);
        setIsFocused(false);
    };

    const userInfo = useAuthUserInfo();
    const { setUserInfo } = useAuthUserInfo();

    const logoutAuthUser = () => {
        localStorage.removeItem("token");
        setUserInfo(null);
        window.location.reload();
    };

    return (
        <div className='fixed bg-black w-full flex flex-wrap justify-between items-center px-4 md:px-12 z-[99] pt-5 pb-2'>
            <div
                className="absolute bg-linear-65 from-red-500 to-blue-800 inset-0 z-[-1] bg-cover bg-center blur-3xl opacity-40 scale-200 h-[100px]"
                style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                }}
            />
            <div className='flex order-1 items-center justify-center gap-2 w-auto'>
                <Music size={34} color='#e56158' strokeWidth={4} className='mt-2' />
                <h1 className='hidden sm:block text-2xl md:text-3xl font-bold'>Ongaku</h1>
            </div>
            {/* Profile */}
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

            <div className="relative order-3 md:order-2 w-full md:w-1/3 flex items-center mt-2 md:mt-0 group">
                <FiSearch className={`absolute left-3 w-5 h-5 z-10 transition-colors duration-150 ${isFocused ? 'text-gray-200' : 'text-gray-400'} group-focus:text-gray-200 group-active:text-gray-100`} />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                        const v = e.target.value;
                        setQuery(v);
                        debouncedLoad(v);
                    }}
                    onFocus={handleFocus}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search for songs and playlists..."
                    className={`bg-white/5 hover:bg-white/10 focus:bg-white/20  w-full rounded-xl py-3 px-10 text-bold placeholder:text-gray-400 outline-none caret-white transition-all duration-150 ease-in-out ${isFocused ? 'text-gray-100 ring-2 ring-white/10 shadow-[0_6px_20px_rgba(0,0,0,0.4)]' : 'text-gray-300'} focus:ring-2 focus:ring-white/10 hover:shadow-sm`}
                />
                {/* Dropdown */}
                {dropdownOpen && suggestionsGrouped && suggestionsGrouped.length > 0 && (
                    <div
                        ref={dropdownRef}
                        className="max-h-80 overflow-auto rounded-lg bg-[#101010] border border-[#1f1f1f] shadow-lg"
                        style={dropdownPos ? {
                            position: 'fixed',
                            left: dropdownPos.left,
                            top: dropdownPos.top + 8,
                            width: dropdownPos.width,
                            zIndex: 9999
                        } : { position: 'absolute', left: 0, right: 0, marginTop: '0.5rem', zIndex: 9999 }}
                    >
                        {suggestionsGrouped.map((group) => (
                            <div key={group.label} className="py-2 px-2">
                                <div className="text-gray-400 font-semibold px-2 py-1 text-bold">{group.label}</div>
                                {group.options && group.options.map((opt) => {
                                    return (
                                        <div
                                            key={opt.value + opt.type}
                                            onClick={async () => {
                                                setDropdownOpen(false);
                                                setQuery('');
                                                await handleSelect(opt);
                                            }}
                                            className="flex items-center gap-3 px-3 py-2 text-bold hover:bg-[#262626] cursor-pointer text-sm text-white rounded-2xl"
                                        >
                                            {opt.image ? (
                                                <img src={opt.image} alt={opt.label} className="w-10 h-10 rounded-md object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center text-xs text-gray-400">N/A</div>
                                            )}
                                            <div className="text-bold truncate">{opt.label}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NavBar
