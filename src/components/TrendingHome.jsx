import React, { useState } from 'react';
import MusicCard from "./MusicCard";
import AlbumsCard from './AlbumsCard';
import MusicCardSkeleton from './MusicCardSkeleton';
import AlbumsCardSkeleton from './AlbumSkeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useHomeSongs, useHomeAlbums } from './hooks/useQuery';

const TrendingHome = () => {
    const [language, setLanguage] = useState("english");

    const {
        data: homeSongs = [],
        isLoading: isLoadingSongs,
        error: errorSongs
    } = useHomeSongs(language);

    const {
        data: homeAlbums = [],
        isLoading: isLoadingAlbums,
        error: errorAlbums
    } = useHomeAlbums(language);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
    };

    return (
        <div className='w-full min-h-screen bg-black px-4 py-20 mt-5 md:mt-0 md:py-23'>
            <div className='max-w-7xl h-full mx-auto md:mt-5'>

                <div className='flex flex-col space-y-4 sm:space-y-6 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6 mt-13 md:mt-10 md:mb-8'>
                    <div className='text-3xl font-bold text-[#6e7273]'>Trending Albums</div>
                    <Select onValueChange={handleLanguageChange} defaultValue={language}>
                        <SelectTrigger className="w-[180px] border-0">
                            <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#101010] border-0 max-h-[300px] overflow-y-auto">
                            {[
                                "english", "hindi", "punjabi", "tamil", "telugu", "malayalam",
                                "kannada", "bengali", "marathi", "gujarati", "odia",
                                "assamese", "rajasthani", "haryanvi", "bhojpuri", "urdu"
                            ].map(lang => (
                                <SelectItem key={lang} className="text-white" value={lang}>
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className=' grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10'>
                    {isLoadingAlbums
                        ? Array(6).fill().map((_, i) => <AlbumsCardSkeleton key={i} />)
                        : homeAlbums.slice(0, 8).map(album => (
                            <AlbumsCard key={album.id} album={album} />
                        ))
                    }
                </div>

                <h1 className='text-3xl font-bold text-[#6e7273] mb-6 md:mb-8'>
                    Trending Songs
                </h1>

                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-2 mt-8'>
                    {isLoadingSongs
                        ? Array(10).fill().map((_, i) => <MusicCardSkeleton key={i} />)
                        : homeSongs.map(song => (
                            <MusicCard key={song.id} song={song} />
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default TrendingHome;
