import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { EllipsisVertical } from 'lucide-react';
import LikedSongSkeleton from '@/components/LikedSongSkeleton';
import { useAudioStore } from '@/app/storeZustand';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { addAudio } from '@/app/indexDB';
import {
    useLikedSongs,
    useSongById,
    useRemoveFromLiked
} from '../components/hooks/useQuery';
import { useQueryClient } from '@tanstack/react-query';

const LikedSong = () => {
    const { playTrack } = useAudioStore();
    const queryClient = useQueryClient();

    const [selectedSongId, setSelectedSongId] = useState(null);

    const { data: likedSongs, isLoading } = useLikedSongs();
    const removeFromLiked = useRemoveFromLiked();
    const { data: selectedSongData } = useSongById(selectedSongId);

    useEffect(() => {
        if (!selectedSongData) return;

        const audio = {
            id: selectedSongData.id,
            title: selectedSongData.title,
            download_urls: selectedSongData.download,
            subtitle: selectedSongData.subtitle,
            artists: selectedSongData.artists.primary,
            image: {
                ...selectedSongData.images,
                large: selectedSongData.images.large.replace("150x150", "500x500")
            },
            type: "song"
        };

        playTrack(audio, false, likedSongs);
    }, [selectedSongData]);

    const handlePlaySong = (song) => {
        if (song.download?.length) {
            const audio = {
                id: song.songId,
                title: song.title,
                download_urls: song.download,
                subtitle: song.artist,
                artists: song.artists || [{ name: song.artist }],
                image: song.image,
                type: "song"
            };
            playTrack(audio, false, likedSongs);
        } else {
            setSelectedSongId(song.songId);
        }
    };

    const handleRemoveFromLiked = async (songId, e) => {
        e.stopPropagation();
        try {
            await removeFromLiked.mutateAsync(songId);
            toast.success("Removed from liked songs");
        } catch (err) {
            console.error("Error:", err);
            toast.error("Failed to remove");
        }
    };

    const handleAddToDownloads = async (songId, e) => {
        e.stopPropagation();
        try {
            const song = queryClient.getQueryData(['song', songId]) || await queryClient.fetchQuery({
                queryKey: ['song', songId],
                queryFn: async () => {
                    const res = await fetch(`${import.meta.env.VITE_MUSIC_API}/song?id=${songId}`);
                    return (await res.json()).data;
                }
            });

            const audio = {
                id: song.id,
                title: song.title,
                subtitle: song.artists?.primary?.map(a => a.name).join(', ') || song.subtitle,
                images: song.images,
                download_urls: song.download,
                artists: song.artists,
                album: song.album,
                duration: song.duration,
                releaseDate: song.releaseDate,
                label: song.label,
            };

            await addAudio(audio.id, audio);
            alert("Song added to downloads");
        } catch (e) {
            console.error(e);
            toast.error("Failed to add to downloads");
        }
    };

    const handleAddToQueue = (e) => {
        e.stopPropagation();
        // Add to queue logic
    };

    if (!localStorage.getItem("token")) {
        return (
            <div className='w-full min-h-screen bg-black px-4 py-20 mt-20 md:mt-0 md:py-20'>
                <h1 className='text-2xl sm:text-2xl mb-7 md:text-3xl lg:text-4xl font-bold md:mt-10 text-[#6e7273] text-left'>
                    Login Required
                </h1>
            </div>
        );
    }

    return (
        <div className='w-full md:w-9/10 min-h-screen bg-black px-4 py-20 mt-20 md:mt-0 md:py-20 mb-24 md:ml-20'>
            <h1 className='text-3xl mb-7 md:text-3xl lg:text-4xl font-bold md:mt-10 text-[#6e7273] text-left'>
                Liked Songs
            </h1>
            <div className='flex flex-col w-full'>
                {isLoading ? (
                    <LikedSongSkeleton />
                ) : likedSongs?.map((song) => (
                    <div
                        key={song.songId}
                        className="flex items-center justify-between w-full py-2 px-4 mb-2 rounded-lg hover:bg-zinc-800/40 transition-all duration-300 cursor-pointer"
                        onClick={() => handlePlaySong(song)}
                    // onMouseEnter={() =>
                    //     queryClient.prefetchQuery({
                    //         queryKey: ['song', song.songId],
                    //         queryFn: async () => {
                    //             const res = await fetch(`${import.meta.env.VITE_MUSIC_API}/song?id=${song.songId}`);
                    //             return (await res.json()).data;
                    //         }
                    //     })
                    // }
                    >
                        <div className="flex items-center gap-4">
                            <img
                                src={song.image}
                                alt={song.title}
                                className="w-12 h-12 rounded-md object-cover"
                            />
                            <div className="flex flex-col">
                                <h1 className="text-white text-lg font-medium">{song.title}</h1>
                                <h2 className="text-gray-400 text-sm">{song.artist}</h2>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="text-gray-400 hover:text-white transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <EllipsisVertical />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-48 bg-[#101010] border-[#202020] text-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <DropdownMenuItem onClick={handleAddToQueue}>
                                    Add to the Queue
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => handleAddToDownloads(song.songId, e)}>
                                    Add to Downloads
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#202020]" />
                                <DropdownMenuItem
                                    className="hover:bg-[#1a1a1a] cursor-pointer text-red-500"
                                    onClick={(e) => handleRemoveFromLiked(song.songId, e)}
                                >
                                    Remove from Liked
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LikedSong;
