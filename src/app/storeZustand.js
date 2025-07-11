import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import axios from "axios";

export const useAudioStore = create(
    devtools(
        persist(
            (set, get) => ({
                currentSong: null,
                musicQueue: [],
                history: [],
                currentIndex: -1,

                setCurrentSong: (song) => {
                    set({ currentSong: song });
                },

                getRecommendation: async (songId) => {
                    try {
                        const response = await axios.get(
                            `${import.meta.env.VITE_MUSIC_API}/song/recommend?id=${songId}`
                        );
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

                    const { getRecommendation } = get();
                    let queue = [];
                    let index = -1;

                    if (songsList.length > 0) {
                        queue = songsList;
                        index = songsList.findIndex(s => s.id === song.id);
                    } else if (generateRecommendation) {
                        const recommended = await getRecommendation(song.id);
                        if (recommended) {
                            let recomm = [song, ...recommended.data];
                            queue = recomm;
                            index = 0;
                        }
                    } else {
                        const { musicQueue } = get();
                        queue = musicQueue;
                        index = musicQueue.findIndex(s => s.id === song.id);
                    }

                    set({
                        currentSong: song,
                        musicQueue: queue,
                        currentIndex: index
                    });
                },

                handleNextSong: async () => {
                    const { musicQueue, currentIndex, getRecommendation } = get();

                    if (currentIndex >= 0 && currentIndex < musicQueue.length - 1) {
                        const nextSong = musicQueue[currentIndex + 1];
                        set({
                            currentSong: nextSong,
                            currentIndex: currentIndex + 1
                        });
                    } else {
                        const { currentSong } = get();
                        if (currentSong) {
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
                    }
                },

                handlePrevSong: () => {
                    const { musicQueue, currentIndex } = get();

                    if (currentIndex > 0 && musicQueue.length > 0) {
                        const prevSong = musicQueue[currentIndex - 1];
                        set({
                            currentSong: prevSong,
                            currentIndex: currentIndex - 1
                        });
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
                        currentIndex: -1,
                        currentSong: null
                    });
                }
            }),
            {
                name: "music-store",
            }
        )
    )
);

export const useAudioPlayerContext = () => {
    const currentSong = useAudioStore((state) => state.currentSong);
    const setCurrentSong = useAudioStore((state) => state.setCurrentSong);
    const playTrack = useAudioStore((state) => state.playTrack);
    const musicQueue = useAudioStore((state) => state.musicQueue);
    const currentIndex = useAudioStore((state) => state.currentIndex);
    const handleSongEnd = useAudioStore((state) => state.handleSongEnd);
    const handlePrevSong = useAudioStore((state) => state.handlePrevSong);
    const handleNextSong = useAudioStore((state) => state.handleNextSong);
    const shuffleQueue = useAudioStore((state) => state.shuffleQueue);
    const clearQueue = useAudioStore((state) => state.clearQueue);

    return {
        currentSong,
        setCurrentSong,
        playTrack,
        musicQueue,
        currentIndex,
        handleSongEnd,
        handlePrevSong,
        handleNextSong,
        shuffleQueue,
        clearQueue
    };
};
