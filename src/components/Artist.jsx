import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AudioPlayerData } from '../context/AudioPlayerContext';
import { Play, Clock3, XIcon, User } from 'lucide-react';
import axios from 'axios';
import { trimString } from '../utils/utils';
import { LoadingSpinner } from './LoadingSpinner';
import { Skeleton } from './ui/skeleton';

const Artist = ({ id, onClose, onAlbumClick }) => {
    const [artistData, setArtistData] = useState(null);
    const [artistSongs, setArtistSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { playTrack, setCurrentTrack } = useContext(AudioPlayerData);

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                setIsLoading(true);

                const artistResponse = await axios.get(`${import.meta.env.VITE_MUSIC_API}/artist?id=${id}`);
                setArtistData(artistResponse.data.data);

                const songsResponse = await axios.get(`${import.meta.env.VITE_MUSIC_API}/artist/top-songs?id=${id}`);
                setArtistSongs(songsResponse.data.data);
            } catch (error) {
                console.error('Error fetching artist:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchArtistData();
        }

        return () => {
            setArtistData(null);
            setArtistSongs([]);
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
    const handleSingleClick = async (single) => {
        try {
            // Check if onAlbumClick prop is provided (to navigate to album page)
            if (onAlbumClick) {
                onAlbumClick(single.id);
                return;
            }

            // If we don't have album navigation, then fetch the album and play the first song
            console.log("Fetching album details for single:", single.id);
            const albumResponse = await axios.get(`${import.meta.env.VITE_MUSIC_API}/album?id=${single.id}`);
            const albumData = albumResponse.data.data;

            // Check if the album has songs
            if (albumData.songs && albumData.songs.length > 0) {
                // Get the first song from the album
                const firstSong = albumData.songs[0];
                console.log("Playing first song from album:", firstSong.id);

                // Play this song
                await handlePlaySong(firstSong);
            } else {
                console.error("No songs found in this album/single");
            }
        } catch (error) {
            console.error('Error handling single click:', error);
        }
    };
    const formatTime = (seconds) => {
        if (Number.isNaN(seconds)) {
            return '00:00';
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
    };

    if (isLoading) {
        return <ArtistSkeleton />;
    }

    return (
        <div className='w-full min-h-screen bg-black px-4 py-20 md:py-30'>
            <div className='max-w-7xl mx-auto md:mt-5'>
                {artistData && (
                    <div className='flex flex-col gap-8'>
                        <div className='flex md:flex-row flex-col items-center md:items-end gap-6 pt-14 md:p-8 rounded-xl'>
                            <div className="w-48 h-48 shadow-xl rounded-xl overflow-hidden">
                                <img
                                    src={artistData.image.large}
                                    alt={artistData.title}
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            <div className='text-center md:text-start'>
                                <h4 className='text-sm font-bold uppercase text-white'>Artist</h4>
                                <h1 className='text-5xl font-bold mt-2 text-white'>{artistData.title}</h1>
                                <p className='text-gray-400 mt-4'>{artistData.subtitle}</p>
                                <p className='text-gray-400 mt-2'>
                                    <span className='flex items-center justify-center md:justify-start gap-2'>
                                        <User size={16} />
                                        {artistData.follower_count} followers
                                    </span>
                                </p>

                            </div>
                            <button
                                type='button'
                                onClick={handleClose}
                                className='absolute top-30 right-8 p-2 rounded-full hover:bg-gray-800'
                            >
                                <XIcon className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Top Songs List */}
                        <div className='mt-8'>
                            <h2 className='text-2xl font-bold text-white mb-4'>Popular Songs</h2>
                            <table className='w-full text-left text-white'>
                                <thead className='border-b border-[#262626]'>
                                    <tr className='text-gray-400'>
                                        <th className='pb-3 w-12'>#</th>
                                        <th className='pb-3'>Title</th>
                                        <th className='pb-3 hidden md:table-cell'>Plays</th>
                                        <th className='pb-3 w-12'><Clock3 size={16} /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {artistSongs.map((song, index) => (
                                        <tr
                                            key={song.id}
                                            onClick={() => handlePlaySong(song)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handlePlaySong(song); }}
                                            className='hover:bg-[#262626] cursor-pointer group'
                                            tabIndex={0}
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
                                                {song.play_count && Number.parseInt(song.play_count).toLocaleString()}
                                            </td>
                                            <td className='py-3 text-gray-400'>
                                                {song.more_info && formatTime(song.more_info.duration)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Singles Section */}
                        {artistData.singles && artistData.singles.length > 0 && (
                            <div className='mt-8'>
                                <h2 className='text-2xl font-bold text-white mb-4'>Singles & EPs</h2>
                                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                                    {artistData.singles.map(single => (
                                        <div
                                            key={single.id}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSingleClick(single); }}
                                            onClick={() => handleSingleClick(single)}
                                            className="p-3 hover:bg-[#262626] rounded-xl cursor-pointer transition-colors"
                                        >
                                            <div className="w-full aspect-square overflow-hidden mb-2 rounded-lg shadow-md">
                                                <img
                                                    src={single.image.large}
                                                    alt={single.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h3 className="text-white text-base font-medium truncate">
                                                {single.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm truncate">
                                                {single.subtitle || `${single.year || ""}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Similar Artists Section (if present in API response) */}
                        {artistData.similarArtists && artistData.similarArtists.length > 0 && (
                            <div className='mt-8'>
                                <h2 className='text-2xl font-bold text-white mb-4'>Similar Artists</h2>
                                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                                    {artistData.similarArtists.map(artist => (
                                        <div key={artist.id} className="p-3 hover:bg-[#262626] rounded-xl cursor-pointer">
                                            <div className="w-full aspect-square rounded-full overflow-hidden mb-2">
                                                <img
                                                    src={artist.image}
                                                    alt={artist.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h3 className="text-white text-center text-base font-medium">{artist.name}</h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ArtistSkeleton = () => (
    <div className='w-full min-h-screen bg-black px-4 py-20 md:py-24'>
        <div className='max-w-7xl mx-auto md:mt-5'>
            <div className='flex flex-col gap-8'>
                {/* Artist Header Skeleton */}
                <div className='flex md:flex-row flex-col items-center md:items-end gap-6 pt-14 md:p-8 rounded-xl'>
                    <Skeleton className="bg-[#262626] w-48 h-48 rounded-xl" />
                    <div className='text-center md:text-start w-full md:w-1/3'>
                        <Skeleton className="h-4 bg-[#262626] w-16 mb-2" />
                        <Skeleton className="h-12 bg-[#262626] w-full mb-4" />
                        <Skeleton className="h-4 bg-[#262626] w-3/4" />
                        <Skeleton className="h-4 bg-[#262626] w-1/4 mt-2" />
                    </div>
                </div>

                {/* Top Songs Skeleton */}
                <div className='mt-8'>
                    <Skeleton className="h-8 bg-[#262626] w-40 mb-4" />
                    <table className='w-full'>
                        <thead className='border-b border-[#262626]'>
                            <tr>
                                <th className='pb-3 w-12'><Skeleton className="h-4 w-4" /></th>
                                <th className='pb-3'><Skeleton className="h-4 w-20" /></th>
                                <th className='pb-3 hidden md:table-cell'><Skeleton className="h-4 w-20" /></th>
                                <th className='pb-3 w-12'><Skeleton className="h-4 w-4" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(8)].map((_, index) => (
                                <tr key={index} className="border-b border-[#262626]">
                                    <td className='py-3 pl-2'>
                                        <Skeleton className="h-4 bg-[#262626] w-4" />
                                    </td>
                                    <td className='py-3'>
                                        <div className='flex items-center gap-3'>
                                            <Skeleton className="bg-[#262626] w-10 h-10 rounded" />
                                            <div className='w-full'>
                                                <Skeleton className="h-4 bg-[#262626] w-40 mb-2" />
                                                <Skeleton className="h-3 bg-[#262626] w-24" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className='py-3 hidden md:table-cell'>
                                        <Skeleton className="h-4 bg-[#262626] w-32" />
                                    </td>
                                    <td className='py-3'>
                                        <Skeleton className="h-4 bg-[#262626] w-12" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Singles Skeleton */}
                <div className='mt-8'>
                    <Skeleton className="h-8 bg-[#262626] w-40 mb-4" />
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="p-3">
                                <Skeleton className="bg-[#262626] w-full aspect-square rounded-lg mb-2" />
                                <Skeleton className="h-5 bg-[#262626] w-full mb-1" />
                                <Skeleton className="h-4 bg-[#262626] w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default Artist;
