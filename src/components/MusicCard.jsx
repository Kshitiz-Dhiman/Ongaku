import React, { useContext } from 'react'
import { Play } from "lucide-react"
import { trimString } from "../utils/utils"
import { AudioPlayerData } from '../context/AudioPlayerContext'
import axios from "axios"
function MusicCard({ key, song }) {

    const { playTrack, setCurrentTrack } = useContext(AudioPlayerData);
    const playthehomesong = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_MUSIC_API}/song?id=${song.id}`);
            const songData = response.data.data;
            setCurrentTrack(songData);
            await playTrack(songData.download[4].link, songData.id);
        } catch (e) {
            console.log(e);
        }
    }
    return (
        <div key={key} className="w-full sm:max-w-[250px] rounded-xl cursor-pointer p-2 md:p-3">
            <div className='relative group aspect-square overflow-hidden rounded-2xl'>
                <img
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 rounded-2xl"
                    src={song.image.large}
                    alt={song.title}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/40 group-hover:opacity-100 transition-all duration-300">
                    <div className='bg-[#202020] p-2 md:p-3 rounded-full transform transition-transform duration-200 hover:scale-110 active:scale-95' onClick={playthehomesong} onKeyUp={(e) => { if (e.key === 'Enter') playthehomesong(); }} >
                        <Play className="text-white w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
                    </div>
                </div>
            </div>
            <div className="py-3 md:py-5">
                <h5 className="space-y-1">
                    <h1 className="text-base md:text-xl font-bold text-white truncate">
                        {trimString(song?.title, 16)}
                    </h1>
                    <span className="text-sm md:text-base text-[#6e7273] block truncate">
                        {trimString(song.subtitle, 17)}
                    </span>
                </h5>
            </div>
        </div>
    )
}

export default MusicCard
