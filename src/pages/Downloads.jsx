import React, { useContext, useEffect, useState } from 'react'
import { getAllliked } from "../app/indexDB"
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import { AudioPlayerData } from '../context/AudioPlayerContext';

const Downloads = () => {
    const [downloads, setDownloads] = useState([])
    useEffect(() => {
        getAllliked().then((data) => {
            setDownloads(data);
        })
    }, [])
    const { currentTrack, setCurrentTrack } = useContext(AudioPlayerData);
    const { load } = useGlobalAudioPlayer();
    const playSong = (download) => {
        const trackInfo = {
            id: download.audio.id,
            title: download.audio.title,
            subtitle: download.audio.subtitle,
            images: download.audio.images,
            download_url: download.audio.download_url,
            artists: download.audio.artists,
            album: download.audio.album,
            duration: download.audio.duration,
        };
        setCurrentTrack(trackInfo);
        load(trackInfo.download_url, { autoplay: true });
    }

    return (
        <div className='min-h-screen w-full bg-black px-4 py-20 mt-20 md:mt-0 md:py-20 mb-10 '>
            <h1 className='text-2xl sm:text-2xl mb-7 md:text-3xl lg:text-4xl font-bold md:mt-10 text-[#6e7273] text-left'>Downloads</h1>
            {downloads.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {downloads.map((download, index) => (
                        <div key={index} onClick={() => playSong(download)} className='p-2 rounded-lg flex items-center gap-4 hover:bg-[#2a2a2a] transition-colors cursor-pointer'>
                            <img className="rounded-md" src={download.audio.images.small} alt="" />
                            <div>
                                <h1 className='text-white text-lg font-medium'>{download.audio.title}</h1>
                                <h2 className='text-gray-400 text-sm'>{download.audio.subtitle}</h2>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='flex items-center justify-center h-full'>
                    <h1 className='
                     text-xl sm:text-xl md:text-3xl font-bold text-gray-400
                    '>No Downloads Available</h1>
                </div>
            )}
        </div>
    )
}

export default Downloads
