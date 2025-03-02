import React, { useState } from 'react'
import TrendingHome from '../components/TrendingHome'
import NavBar from '../components/NavBar';
import Siderbar from '@/components/Siderbar';
import MusicPlayer from '@/components/MusicPlayer';
import Album from '../components/Album';
import Artist from '@/components/Artist';

const Home = () => {
    const [selectedAlbumId, setSelectedAlbumId] = useState(null);
    const [selectedArtistId, setSelectedArtistId] = useState(null);

    // Album selection - close artist view if open
    const handleAlbumSelect = (albumId) => {
        setSelectedAlbumId(albumId);
        setSelectedArtistId(null); // Close artist view if open
    };

    // Album closing
    const handleAlbumClose = () => {
        setSelectedAlbumId(null);
    };

    // Artist selection - close album view if open
    const handleArtistSelect = (artistId) => {
        setSelectedArtistId(artistId);
        setSelectedAlbumId(null); // Close album view if open
    };

    // Artist closing
    const handleArtistClose = () => {
        setSelectedArtistId(null);
    };

    return (
        <div className='flex flex-col min-h-screen bg-black text-white'>
            <NavBar onAlbumSelect={handleAlbumSelect} onArtistSelect={handleArtistSelect} />
            <div className="flex flex-1 relative">
                <Siderbar onClose={handleAlbumClose} />
                <main className="flex-1 md:ml-[12%]">
                    {/* Prioritized rendering: Artist > Album > TrendingHome */}
                    {selectedArtistId ? (
                        <Artist id={selectedArtistId} onClose={handleArtistClose} />
                    ) : selectedAlbumId ? (
                        <Album id={selectedAlbumId} onClose={handleAlbumClose} />
                    ) : (
                        <TrendingHome
                            onAlbumClick={handleAlbumSelect}
                            onArtistClick={handleArtistSelect}
                        />
                    )}
                </main>
            </div>
            <MusicPlayer />
        </div>
    );
};

export default Home;
