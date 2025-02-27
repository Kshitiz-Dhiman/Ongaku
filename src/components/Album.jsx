import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AudioPlayerData } from '../context/AudioPlayerContext';
import { Play, Clock3, XIcon } from 'lucide-react';
import axios from 'axios';
import { trimString } from '../utils/utils';
import { LoadingSpinner } from './LoadingSpinner';

const Album = ({ id, onClose }) => {
    const [albumData, setAlbumData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { playTrack, setCurrentTrack } = useContext(AudioPlayerData);
    useEffect(() => {
        const fetchAlbumData = async () => {
            try {
                setIsLoading(true);
                // 885533 -> Sports Artists
                // 16657194 -> Sports Album
                const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/album?id=${id}`);
                setAlbumData(response.data.data);
            } catch (error) {
                console.error('Error fetching album:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchAlbumData();
        }

        return () => {
            setAlbumData(null);
            setIsLoading(true);
        };
    }, [id]);
    const handleClose = () => {
        onClose();
    };

    const handlePlaySong = async (song) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${song.id}`);
            const songData = response.data.data;

            const trackInfo = {
                id: songData.id,
                title: songData.title,
                subtitle: songData.artists?.primary?.map(artist => artist.name).join(", ") || songData.subtitle,
                images: songData.images,
                download_url: songData.download[4].link,
                artists: songData.artists,
                album: songData.album,
                duration: songData.duration,
                releaseDate: songData.releaseDate,
                label: songData.label,
                copyright: songData.copyright
            };

            setCurrentTrack(trackInfo);
            await playTrack(songData.download[4].link, songData.id);
        } catch (error) {
            console.error('Error playing song:', error);
        }
    };
    const formatTime = (seconds) => {
        if (Number.isNaN(seconds)) {
            return '00:00';
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className='w-full min-h-screen bg-black px-4 py-20 md:py-24'>
            <div className='max-w-7xl mx-auto md:mt-5'>
                {albumData && (
                    <div className='flex flex-col gap-8'>
                        {/* bg-gradient-to-b from-[#1a1a1a] to-[#0a1113]  */}

                        <div className='flex md:flex-row flex-col items-center md:items-end gap-6 pt-14 md:p-8 rounded-xl '>
                            <img
                                src={albumData.image.large}
                                alt={albumData.title}
                                className='w-48 h-48 shadow-xl rounded-xl'
                            />
                            <div className='text-center md:text-start'>
                                <h4 className='text-sm font-bold uppercase text-white'>Album</h4>
                                <h1 className='text-5xl font-bold mt-2 text-white'>{albumData.title}</h1>
                                <p className='text-gray-400 mt-4'>{albumData.description}</p>
                            </div>
                            <button
                                type='button'
                                onClick={handleClose}
                                className='absolute top-30 right-8 p-2 rounded-full hover:bg-gray-800'
                            >
                                <XIcon className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Songs List */}
                        <div className='mt-8'>
                            <table className='w-full text-left text-white'>
                                <thead className='border-b border-[#262626]'>
                                    <tr className='text-gray-400'>
                                        <th className='pb-3 w-12'>#</th>
                                        <th className='pb-3'>Title</th>
                                        <th className='pb-3 hidden md:table-cell'>Album</th>
                                        <th className='pb-3 w-12'><Clock3 size={16} /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {albumData.songs.map((song, index) => (
                                        <tr
                                            key={song.id}
                                            onClick={() => handlePlaySong(song)}
                                            onKeyDown={() => handlePlaySong(song)}
                                            className=' hover:bg-[#262626] cursor-pointer group'
                                        >
                                            <td className='py-3 pl-2'>{index + 1}</td>
                                            <td className='py-3'>
                                                <div className='flex items-center gap-3'>
                                                    <img
                                                        src={song.image.small}
                                                        alt={song.title}
                                                        className='w-10 h-10 rounded'
                                                    />
                                                    <div>
                                                        <h3 className='font-medium'>{trimString(song.title, 40)}</h3>
                                                        <p className='text-sm text-gray-400'>{trimString(song.subtitle, 30)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-3 text-gray-400 hidden md:table-cell'>
                                                {albumData.title}
                                            </td>
                                            <td className='py-3 text-gray-400'>
                                                {formatTime(song.duration)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Album;
