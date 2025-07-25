import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_MUSIC_API;

export const useLikedSongs = () =>
    useQuery({
        queryKey: ['liked'],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/liked/songs`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            return data.likedSongs.reverse();
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });

export const useSongById = (songId) =>
    useQuery({
        queryKey: ['song', songId],
        queryFn: async () => {
            const { data } = await axios.get(`${API}/song?id=${songId}`);
            data.data.images.large = data.data.images.large.replace("150x150", "500x500");
            return data.data;
        },
        enabled: !!songId,
        staleTime: 1000 * 60 * 10,
    });

export const useRemoveFromLiked = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (songId) => {
            await axios.delete(`${API}/liked/songs/${songId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['liked']);
        },
    });
};
