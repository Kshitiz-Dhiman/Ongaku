import React, {  useState } from 'react'
import TrendingHome from '../components/TrendingHome'
import NavBar from '../components/NavBar';
import Siderbar from '@/components/Siderbar';
import MusicPlayer from '@/components/MusicPlayer';
import Album from '../components/Album';

const Home = () => {
    const [selectedAlbumId, setSelectedAlbumId] = useState(null);

    const handleAlbumSelect = (albumId) => {
        setSelectedAlbumId(albumId);
    };

    const handleAlbumClose = () => {
        setSelectedAlbumId(null);
    };

    return (
        <div className='flex flex-col min-h-screen  bg-black text-white'>
            <NavBar onAlbumSelect={handleAlbumSelect} />
            <div className="flex flex-1 relative">
                <Siderbar onClose={handleAlbumClose} />
                <main className="flex-1 md:ml-[12%]">
                    {selectedAlbumId ? (
                        <Album id={selectedAlbumId} onClose={handleAlbumClose} />
                    ) : (
                        <TrendingHome onAlbumClick={handleAlbumSelect} />
                    )}
                </main>
            </div>
            <MusicPlayer />
        </div>
    );
};

export default Home
