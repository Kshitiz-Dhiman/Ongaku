import React from 'react'
import MusicCard from "./MusicCard";
const PlaylistHome = () => {
    return (
        //bg-[#0a1113]
        <div className='w-5/6 min-h-screen ml-[20%] mt-[6.6%] bg-[#0a1113]'>
            <h1 className='text-4xl font-bold text-[#6e7273]'>Home</h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:grid-cols-4 mt-5'>
                <MusicCard />
                <MusicCard />
                <MusicCard />
                <MusicCard />
                <MusicCard />
                <MusicCard />
                <MusicCard />
                <MusicCard />
                <MusicCard />
            </div>
        </div>
    )
}

export default PlaylistHome
