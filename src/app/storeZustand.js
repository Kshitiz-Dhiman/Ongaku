import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import axios from "axios";

const musicApi = axios.create({
    baseURL: import.meta.env.VITE_MUSIC_API,
    timeout: 5000,
});

export const useAudioStore = create(
    devtools(
        persist(
            (set, get) => ({
                currentSong: null,
                musicQueue: [],
                originalSongsList: [],
                history: [],
                currentIndex: -1,
                isLoading: false,

                setCurrentSong: (song) => {
                    set({ currentSong: song });
                },

                getRecommendation: async (songId) => {
                    try {
                        const response = await musicApi.get(`/song/recommend?id=${songId}`);
                        const recommend = response.data;
                        set((state) => ({
                            musicQueue: [...state.musicQueue, recommend.data],
                        }));
                        return recommend;
                    } catch (e) {
                        console.error("Error fetching recommendation:", e);
                    }
                },

                playTrack: async (song, generateRecommendation = true, songsList = []) => {
                    if (!song) return;
                    set({ isLoading: true });

                    const { getRecommendation } = get();
                    let queue = [];
                    let index = -1;

                    // Immediately set the current song for instant UI feedback
                    set({ currentSong: song });

                    try {
                        if (songsList.length > 0) {
                            queue = songsList;
                            index = songsList.findIndex(s => s.id === song.id || s.songId === song.id);

                            // Store the original songs list
                            set({
                                originalSongsList: songsList,
                                musicQueue: queue,
                                currentIndex: index,
                                isLoading: false
                            });
                        } else if (generateRecommendation) {
                            // Don't await recommendation - let it load in background
                            const recommendationPromise = getRecommendation(song.id);
                            queue = [song]; // Start with just the current song
                            index = 0;

                            set({
                                originalSongsList: [], // Clear original list for recommendations
                                musicQueue: queue,
                                currentIndex: index,
                                isLoading: false
                            });

                            // Update queue when recommendation arrives
                            recommendationPromise.then(recommended => {
                                if (recommended) {
                                    set(state => ({
                                        musicQueue: [song, ...recommended.data],
                                    }));
                                }
                            });
                        } else {
                            const { musicQueue } = get();
                            queue = musicQueue;
                            index = musicQueue.findIndex(s => s.id === song.id || s.songId === song.id);

                            set({
                                musicQueue: queue,
                                currentIndex: index,
                                isLoading: false
                            });
                        }
                    } catch (error) {
                        console.error("Error in playTrack:", error);
                        set({ isLoading: false });
                    }
                },

                handleNextSong: async () => {
                    const { musicQueue, currentIndex, originalSongsList, getRecommendation } = get();

                    // First, try to play the next song from the current queue
                    if (currentIndex >= 0 && currentIndex < musicQueue.length - 1) {
                        const nextSong = musicQueue[currentIndex + 1];

                        // If the next song is from liked songs, we need to fetch its full data
                        if (nextSong.songId && !nextSong.download) {
                            try {
                                const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${nextSong.songId}`);
                                const songData = response.data.data;
                                songData.images.large = songData.images.large.replace("150x150", "500x500");

                                const audio = {
                                    id: songData.id,
                                    title: songData.title,
                                    download_urls: songData.download,
                                    subtitle: songData.subtitle,
                                    artists: songData.artists.primary,
                                    image: songData.images,
                                    type: "song"
                                };

                                set({
                                    currentSong: audio,
                                    currentIndex: currentIndex + 1
                                });
                            } catch (error) {
                                console.error('Error fetching next song:', error);
                            }
                        } else {
                            set({
                                currentSong: nextSong,
                                currentIndex: currentIndex + 1
                            });
                        }
                    } else {
                        // If we're at the end of the queue, only fetch recommendations if there's no original songs list
                        if (originalSongsList.length === 0) {
                            const { currentSong } = get();
                            if (currentSong) {
                                // Don't block on recommendation loading
                                const recommended = await getRecommendation(currentSong.id);
                                if (recommended && recommended.data && recommended.data.length > 0) {
                                    const currentState = get();
                                    const newQueueLength = currentState.musicQueue.length;

                                    set({
                                        musicQueue: [...currentState.musicQueue, ...recommended.data],
                                        currentSong: recommended.data[0],
                                        currentIndex: newQueueLength
                                    });
                                } else {
                                    console.log("End of queue reached");
                                }
                            }
                        } else {
                            console.log("End of original songs list reached");
                        }
                    }
                },

                handlePrevSong: async () => {
                    const { musicQueue, currentIndex } = get();

                    if (currentIndex > 0 && musicQueue.length > 0) {
                        const prevSong = musicQueue[currentIndex - 1];

                        // If the previous song is from liked songs, we need to fetch its full data
                        if (prevSong.songId && !prevSong.download) {
                            try {
                                const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${prevSong.songId}`);
                                const songData = response.data.data;
                                songData.images.large = songData.images.large.replace("150x150", "500x500");

                                const audio = {
                                    id: songData.id,
                                    title: songData.title,
                                    download_urls: songData.download,
                                    subtitle: songData.subtitle,
                                    artists: songData.artists.primary,
                                    image: songData.images,
                                    type: "song"
                                };

                                set({
                                    currentSong: audio,
                                    currentIndex: currentIndex - 1
                                });
                            } catch (error) {
                                console.error('Error fetching previous song:', error);
                            }
                        } else {
                            set({
                                currentSong: prevSong,
                                currentIndex: currentIndex - 1
                            });
                        }
                    } else {
                        console.log("Already at first song");
                    }
                },

                handleSongEnd: async () => {
                    const { handleNextSong } = get();
                    await handleNextSong();
                },

                shuffleQueue: () => {
                    const { musicQueue, currentSong } = get();
                    if (musicQueue.length === 0) return;

                    const shuffled = [...musicQueue];

                    // Fisher-Yates shuffle algorithm
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }

                    // Find new index of current song after shuffle
                    const newIndex = currentSong ? shuffled.findIndex(s => s.id === currentSong.id) : -1;
                    set({
                        musicQueue: shuffled,
                        currentIndex: newIndex
                    });
                },

                clearQueue: () => {
                    set({
                        musicQueue: [],
                        originalSongsList: [],
                        currentIndex: -1,
                        currentSong: null
                    });
                }
            }),
            {
                name: "music-store",
                // Optimize persistence - only persist essential data
                partialize: (state) => ({
                    currentSong: state.currentSong,
                    musicQueue: state.musicQueue,
                    originalSongsList: state.originalSongsList,
                    currentIndex: state.currentIndex,
                }),
            }
        )
    )
);

export const useCurrentSong = () => useAudioStore((state) => state.currentSong);
export const usePlayTrack = () => useAudioStore((state) => state.playTrack);
export const useMusicQueue = () => useAudioStore((state) => state.musicQueue);
export const useCurrentIndex = () => useAudioStore((state) => state.currentIndex);
export const useIsLoading = () => useAudioStore((state) => state.isLoading);
export const usePlayerControls = () => useAudioStore((state) => ({
    handleSongEnd: state.handleSongEnd,
    handlePrevSong: state.handlePrevSong,
    handleNextSong: state.handleNextSong,
    shuffleQueue: state.shuffleQueue,
    clearQueue: state.clearQueue,
}));

export const useAudioPlayerContext = () => {
    const currentSong = useCurrentSong();
    const setCurrentSong = useAudioStore((state) => state.setCurrentSong);
    const playTrack = usePlayTrack();
    const musicQueue = useMusicQueue();
    const currentIndex = useCurrentIndex();
    const playerControls = usePlayerControls();

    return {
        currentSong,
        setCurrentSong,
        playTrack,
        musicQueue,
        currentIndex,
        ...playerControls
    };
};
