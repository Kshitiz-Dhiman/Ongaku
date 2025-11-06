import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Clock3, MoveLeft, User } from 'lucide-react';
import axios from 'axios';
import { trimString } from '../utils/utils';
import { LoadingSpinner } from './LoadingSpinner';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAudioStore } from '@/app/storeZustand';
import { useAudioPlayerContext as useExternalAudioPlayer } from 'react-use-audio-player'

const Artist = () => {
    const [artistData, setArtistData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { artistId } = useParams();
    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                setIsLoading(true);

                const artistResponse = await axios.get(`${import.meta.env.VITE_MUSIC_API}/artist?id=${artistId}`);
                setArtistData(artistResponse.data.data);
            } catch (error) {
                console.error('Error fetching artist:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (artistId) {
            fetchArtistData();
        }

        return () => {
            setArtistData(null);
            setIsLoading(true);
        };
    }, [artistId]);
    const navigate = useNavigate();

    const handleClose = () => {
        navigate(-1)
    };

    const handleAlbumClick = (album) => {
        navigate(`/album/${album.id}`);
    }
    const { playTrack } = useAudioStore();
    const { load } = useExternalAudioPlayer();

    const handlePlaySong = async (song) => {
        try {

            await playTrack(song, false, artistData.topSongs);


        } catch (error) {
            console.error('Error playing song:', error);
        }
    };

    const handleSingleClick = async (single) => {
        try {
            const albumResponse = await axios.get(`${import.meta.env.VITE_MUSIC_API}/album?id=${single.id}`);
            const albumData = albumResponse.data.data;

            if (albumData.songs && albumData.songs.length > 0) {
                const firstSong = albumData.songs[0];
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
        <div className='w-full min-h-screen bg-black px-4 py-20 md:py-30   mb-20'>
            {/* <div className='fixed top-0 left-0 bg-white h-full w-full'>
                <div className='bg-gradient-to-b from-[#1a1a1a] to-black  h-full w-full' />
            </div> */}
            <div className='fixed top-0 left-0  w-full h-100'>
                <div className='bg-gradient-to-b from-[#1a1a1a] to-black w-full h-full'></div>
            </div>
            <div className='max-w-7xl mx-auto'>
                <div className='relative flex md:flex-row  flex-col items-center md:items-end gap-6 pt-14 md:p-8 rounded-xl'>

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
                        className='fixed top-6 md:top-30 left-6 lg:left-60 bg-[#0c0c0c] p-2 rounded-full hover:bg-gray-800'
                    >
                        <MoveLeft className="w-6 h-6 text-white" onClick={handleClose}
                        />
                    </button>
                </div>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-zinc-800/50 backdrop-blur-sm rounded-lg w-full mt-4 p-1">
                        <TabsTrigger value="overview" className="text-sm font-medium">Overview</TabsTrigger>
                        <TabsTrigger value="songs" className="text-sm font-medium">Songs</TabsTrigger>
                        <TabsTrigger value="albums" className="text-sm font-medium">Albums</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4 bg-zinc-800/30 rounded-lg p-4">
                        <OverView
                            artistData={artistData}
                            handleClose={handleClose}
                            handleSingleClick={handleSingleClick}
                            formatTime={formatTime}
                            handlePlaySong={handlePlaySong}
                            artistSongs={artistData.topSongs}
                        />
                    </TabsContent>
                    <TabsContent value="songs" className="mt-4 bg-zinc-800/30 rounded-lg p-4">
                        <Songs artistId={artistId} />
                    </TabsContent>
                    <TabsContent value="albums" className="mt-4 bg-zinc-800/30 rounded-lg p-4">
                        <Albums artistId={artistId} handleAlbumClick={handleAlbumClick} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

const OverView = ({ artistSongs, artistData, handleSingleClick, formatTime, handlePlaySong }) => {
    return (
        <>
            {artistData && (
                <div className='flex flex-col gap-8'>

                    <div className='mt-8'>
                        <h2 className='text-2xl font-bold text-white mb-4'>Popular Songs</h2>
                        <table className='w-full text-left text-white'>
                            <thead className='border-b border-[#262626]'>
                                <tr className='text-gray-400'>
                                    <th className='pb-3 w-12'>#</th>
                                    <th className='pb-3'>Title</th>
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
        </>
    )
}

const ArtistSkeleton = () => (
    <div className='w-full mt-10 min-h-screen bg-black px-4 py-20 md:py-24'>
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

const Songs = ({ artistId }) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);

    // Use the same audio store as MusicCard
    const { playTrack, setCurrentSong } = useAudioStore();
    const { load } = useExternalAudioPlayer();

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${import.meta.env.VITE_MUSIC_API}/artist/more-songs?id=${artistId}&page=${page}`
                );

                const { data } = response.data;

                if (!data.top_songs.last_page) {
                    setSongs(prev => [...prev, ...data.top_songs.songs]);
                }

                setTotal(data.top_songs.total);
                setHasMore(!data.top_songs.last_page);
            } catch (error) {
                console.error('Error fetching songs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (artistId) {
            fetchSongs();
        }
    }, [artistId, page]);

    const handlePlaySong = async (song) => {
        try {
            setCurrentSong(song);

            await playTrack(song, true);

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
    };

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    return (
        <div className="mt-8">
            <h2 className='text-2xl font-bold text-white mb-4'>All Songs</h2>

            <table className='w-full text-left text-white'>
                <thead className='border-b border-[#262626]'>
                    <tr className='text-gray-400'>
                        <th className='pb-3 w-12'>#</th>
                        <th className='pb-3'>Title</th>
                        <th className='pb-3 hidden md:table-cell'>Album</th>
                        <th className='pb-3 hidden md:table-cell'>Year</th>
                        <th className='pb-3 w-12'><Clock3 size={16} /></th>
                    </tr>
                </thead>
                <tbody>
                    {songs.map((song, index) => (
                        <tr
                            key={song.id}
                            onClick={() => handlePlaySong(song)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handlePlaySong(song); }}
                            className='hover:bg-[#262626] cursor-pointer group border-b border-[#262626]'
                            tabIndex={0}
                        >
                            <td className='py-3 pl-2'>{index + 1}</td>
                            <td className='py-3'>
                                <div className='flex items-center gap-3'>
                                    <img
                                        src={song.image.small}
                                        alt={song.name}
                                        className='w-10 h-10 rounded'
                                    />
                                    <div>
                                        <h3 className='font-medium'>{trimString(song.title, 40)}</h3>
                                        <p className='text-sm text-gray-400'>{trimString(song.subtitle, 30)}</p>
                                    </div>
                                </div>
                            </td>
                            <td className='py-3 text-gray-400 hidden md:table-cell'>
                                {song.more_info?.album || "-"}
                            </td>
                            <td className='py-3 text-gray-400 hidden md:table-cell'>
                                {song.year || "-"}
                            </td>
                            <td className='py-3 text-gray-400'>
                                {formatTime(song.more_info?.duration || 0)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {loading && (
                <div className="flex justify-center my-6">
                    <LoadingSpinner />
                </div>
            )}

            {!loading && hasMore && (
                <div className="flex justify-center my-6">
                    <button
                        type="button"
                        onClick={loadMore}
                        className="bg-[#262626] hover:bg-[#333] px-6 py-2 mb-20 rounded-full text-white"
                    >
                        +
                    </button>
                </div>
            )}

            {!loading && !hasMore && songs.length > 0 && (
                <p className="text-gray-400 text-center my-6">
                    Showing all {songs.length} of {total} songs
                </p>
            )}
        </div>
    );
};

const Albums = ({ artistId, handleAlbumClick }) => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${import.meta.env.VITE_MUSIC_API}/artist/more-albums?id=${artistId}&page=${page}`
                );

                const { data } = response.data;

                if (data?.topAlbums && data?.topAlbums?.albums) {
                    if (page === 0) {
                        setAlbums(data.topAlbums.albums);
                    } else {
                        setAlbums(prev => [...prev, ...data.topAlbums.albums]);
                    }
                    setHasMore(!data.topAlbums.last_page);
                }
            } catch (error) {
                console.error('Error fetching albums:', error);
            } finally {
                setLoading(false);
            }
        };

        if (artistId) {
            fetchAlbums();
        }
    }, [artistId, page]);

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    return (
        <div className="mt-8">
            <h2 className='text-2xl font-bold text-white mb-4'>All Albums</h2>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                {albums.map((album) => (
                    <div
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAlbumClick(album); }}
                        onClick={() => handleAlbumClick(album)}
                        key={album.id}
                        className="p-3 hover:bg-[#262626] rounded-xl cursor-pointer transition-colors"
                    >
                        <div className="w-full aspect-square overflow-hidden mb-2 rounded-lg shadow-md">
                            <img
                                src={album.image.replace("150x150", "500x500")}
                                alt={album.name || album.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h3 className="text-white text-base font-medium truncate">
                            {album.name || album.title}
                        </h3>
                        <p className="text-gray-400 text-sm truncate">
                            {album.year ? `${album.year}` : "Album"}
                        </p>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="flex justify-center my-6">
                    <LoadingSpinner />
                </div>
            )}

            {!loading && hasMore && (
                <div className="flex justify-center my-6">
                    <button
                        type="button"
                        onClick={loadMore}
                        className="bg-[#262626] hover:bg-[#333] px-6 py-2 rounded-full text-white"
                    >
                        Load More Albums
                    </button>
                </div>
            )}

            {!loading && !hasMore && albums.length > 0 && (
                <p className="text-gray-400 text-center my-6">
                    Showing all {albums.length} albums
                </p>
            )}
        </div>
    );
};

export default Artist;
