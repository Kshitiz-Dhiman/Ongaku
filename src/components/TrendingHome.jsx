import React, { useEffect, useState } from 'react';
import MusicCard from "./MusicCard";
import axios from 'axios';
import MusicCardSkeleton from './MusicCardSkeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import AlbumsCard from './AlbumsCard';
import AlbumsCardSkeleton from './AlbumSkeleton';
const PlaylistHome = () => {
    const [homesongs, setHomesongs] = useState([]);
    const [homealbums, setHomeAlbums] = useState([]);
    const [language, setLanguage] = useState("english");
    const [isLoading, setIsLoading] = useState(false);

    const getHomeSongs = async () => {
        try {
            setIsLoading(false); // Set loading to false before fetching
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/get/trending?lang=${language}&type=song`);
            const homeSongs = response.data.data;
            setHomesongs(homeSongs);
            setIsLoading(true);
        } catch (e) {
            console.log(e);
            setIsLoading(true);
        }
    }

    const getHomeAlbums = async () => {
        try {
            setIsLoading(false);
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/get/trending?lang=${language}&type=album`);
            const homeALbums = response.data.data;
            setHomeAlbums(homeALbums);
            setIsLoading(true);
        } catch (e) {
            console.log(e);
            setIsLoading(true);
        }
    }
    const handleLanguageChange = (lang) => {
        setIsLoading(false);
        setLanguage(lang);
    }

    useEffect(() => { getHomeSongs(); getHomeAlbums(); }, [language]);


    return (
        <div className='w-full min-h-screen bg-black px-4 py-20 md:py-24 '>
            <div className='max-w-7xl mx-auto mt-12 md:mt-5'>
                {/* <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#6e7273] mb-6 md:mb-8'>
                    Trending
                </h1> */}
                <div className='flex flex-wrap items-center gap-4 mt-10 md:gap-6 mb-6 md:mb-8'>
                    <h1 className='text-[#6e7273]'>Choose language :</h1>
                    <div>
                        <Select onValueChange={handleLanguageChange} defaultValue={language}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="hindi">Hindi</SelectItem>
                                <SelectItem value="punjabi">Punjabi</SelectItem>
                                <SelectItem value="tamil">Tamil</SelectItem>
                                <SelectItem value="telugu">Telugu</SelectItem>
                                <SelectItem value="malayalam">Malayalam</SelectItem>
                                <SelectItem value="kannada">Kannada</SelectItem>
                                <SelectItem value="bengali">Bengali</SelectItem>
                                <SelectItem value="marathi">Marathi</SelectItem>
                                <SelectItem value="gujarati">Gujarati</SelectItem>
                                <SelectItem value="odia">Odia</SelectItem>
                                <SelectItem value="assamese">Assamese</SelectItem>
                                <SelectItem value="rajasthani">Rajasthani</SelectItem>
                                <SelectItem value="haryanvi">Haryanvi</SelectItem>
                                <SelectItem value="bhojpuri">Bhojpuri</SelectItem>
                                <SelectItem value="urdu">Urdu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#6e7273] mb-6 md:mb-8'>
                    Trending Albums
                </h1>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 mb-10 md:gap-3'>
                    {isLoading ? (
                        homealbums.slice(0, 8).map((album) => (
                            <AlbumsCard key={album.id} album={album} />
                        ))
                    ) : Array(8).fill().map((_, index) => (
                        <AlbumsCardSkeleton key={index} />
                    ))}
                </div>
                <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#6e7273] mb-6 md:mb-8'>
                    Trending Songs
                </h1>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-8'>

                    {isLoading ? homesongs.map((song) => (
                        <MusicCard key={song.id} song={song} />
                    )) : Array(10).fill().map((_, index) => (
                        <MusicCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PlaylistHome
