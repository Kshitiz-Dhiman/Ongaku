import React, { useEffect } from 'react';
import { useAudioStore } from '@/app/storeZustand';
import { useAudioPlayerContext as useExternalAudioPlayer } from 'react-use-audio-player';
import { getAudioWithBlob } from './app/indexDB';
function AudioPlayerSync() {
    const { currentSong, handleNextSong } = useAudioStore();
    const { load, playing } = useExternalAudioPlayer();

    useEffect(() => {
        let audioWithBlob = {};

        (async () => {
            try {
                audioWithBlob = await getAudioWithBlob(currentSong.id);
            } catch (e) {
                console.log(e);
            }
        })();
        /**
        if (audioWithBlob) {
            const createUrl = audioWithBlob.blob ? URL.createObjectURL(audioWithBlob.blob) : audioWithBlob.url;
            load(createUrl, {
                autoplay: true,
                initialVolume: 0.5,
                onend: () => {
                    handleNextSong();
                },
            });
        } else  */
        // console.log(audioWithBlob);
        {
            if (currentSong && currentSong.download_urls && currentSong.download_urls[4]) {
                load(currentSong.download_urls[4].link, {
                    autoplay: true,
                    initialVolume: 0.5,
                    onend: () => {
                        handleNextSong();
                    },
                });
            }
        }
    }, [currentSong, load, handleNextSong]);

    return null;
}

export default AudioPlayerSync;
