import React, { useContext } from 'react'
import { AudioPlayerData } from '../context/AudioPlayerContext';
import Equaliser from '../assets/equaliser.gif';
import { useAudioStore } from '@/app/storeZustand';

const MusicQueue = ({ onClose }) => {
    // playTrack(url , id , addToqueue , songsList(remainging queue));
    const { musicQueue } = useAudioStore();
    const queueLength = musicQueue.length;
    const playTrackFromQueue = async (url, id, addToQueue, queue) => {
        console.log("Not ready");

        // const remainingQueue = queue.slice(
        //     queue.findIndex(() => song.id === id) + 1,
        //     queue.length
        // );
        // await playTrack(url, id, addToQueue, remainingQueue);
    }
    return (
        <div className='md:bg-none bg-none md:h-[47vh] h-screen md:w-full sm:w-[600px] overflow-y-auto p-6 rounded-lg'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-white text-2xl font-bold'>
                    Queue ({queueLength})
                </h2>
                <button
                    onClick={onClose}
                    className='text-white md:hidden hover:text-gray-300 transition-colors h-10 w-12 font-bold duration-200'
                >
                    ✕
                </button>
            </div>
            <ul className='space-y-4'>
                {musicQueue.map((song, index) => (
                    <li
                        onClick={() => { playTrackFromQueue(song.download_url, song.id, true, musicQueue); }}
                        key={index}
                        className='bg-zinc-800 rounded-lg p-4 text-white hover:bg-zinc-800 transition-colors duration-200 h-20 flex items-center justify-between group'>

                        <div className='flex-1 truncate mr-4'>
                            <p className='font-medium truncate'>{song.title}</p>
                        </div>
                        <img
                            src={Equaliser}
                            alt="equaliser"
                            className='h-32 w-12 ml-2 inline-block object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default MusicQueue
