import React, { useEffect, useState } from 'react';
import { useAudioStore } from '@/app/storeZustand';
import { useAudioPlayerContext as useExternalAudioPlayer } from 'react-use-audio-player';
import { getAudioWithBlob } from './app/indexDB';
function AudioPlayerSync() {
    const { currentSong, handleNextSong } = useAudioStore();
    const { load, playing } = useExternalAudioPlayer();
    const [blobFound, setBlobFound] = useState(false);
    useEffect(() => {
        let audioWithBlob = {};

        (async () => {
            try {
                audioWithBlob = await getAudioWithBlob(currentSong.id);
                await setBlobFound(true);
                console.log(blobFound);
                if (blobFound && audioWithBlob.blob) {
                    load(audioWithBlob.url, {
                        autoplay: true,
                        initialVolume: 0.5,
                        html5: true,
                        format: "mp4",
                        onend: () => {
                            handleNextSong();
                        },
                    });
                }
            } catch (e) {
                console.error("Error fetching audio with blob:", e);
            } finally {
                if (!blobFound && currentSong && currentSong.download_urls && currentSong.download_urls[4]) {
                    load(currentSong.download_urls[4].link, {
                        autoplay: true,
                        initialVolume: 0.5,
                        html5: true,
                        format: "mp4",
                        onend: () => {
                            handleNextSong();
                        },
                    });
                }
            }
        })();





    }, [currentSong, load, handleNextSong]);

    return null;
}

export default AudioPlayerSync;
