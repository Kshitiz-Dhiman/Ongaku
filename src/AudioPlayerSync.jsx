import React, { useEffect } from 'react';
import { useAudioStore } from '@/app/storeZustand';
import { useAudioPlayerContext as useExternalAudioPlayer } from 'react-use-audio-player';

function AudioPlayerSync() {
    const { currentSong, handleNextSong } = useAudioStore();
    const { load, playing } = useExternalAudioPlayer();

    useEffect(() => {
        if (currentSong && currentSong.download_urls && currentSong.download_urls[4]) {
            console.log('Loading new song:', currentSong.title);
            console.log(currentSong.download_urls[4].link);
            load(currentSong.download_urls[4].link, {
                autoplay: true,
                initialVolume: 0.5,
                onend: () => {
                    console.log("Song ended, playing next");
                    handleNextSong();
                },
            });
        }
    }, [currentSong, load, handleNextSong]);

    return null;
}

export default AudioPlayerSync;
