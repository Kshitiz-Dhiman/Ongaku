import React, { useEffect } from 'react';
import { useAudioStore } from '@/app/storeZustand';
import { useAudioPlayerContext as useExternalAudioPlayer } from 'react-use-audio-player';

function AudioPlayerSync() {
    const { currentSong, handleNextSong } = useAudioStore();
    const { load, playing } = useExternalAudioPlayer();

    useEffect(() => {
        if (currentSong && currentSong.download_urls && currentSong.download_urls[4]) {
            load(currentSong.download_urls[4].link, {
                autoplay: true,
                initialVolume: 0.5,
                onend: () => {
                    handleNextSong();
                },
            });
        }
    }, [currentSong, load, handleNextSong]);

    return null;
}

export default AudioPlayerSync;
