import React from 'react'

const PlaylistHome = ({ key, song }) => {
// console.log(song?.name?.length)
    return (
        <div key={key} className='flex gap-3 bg-[#202020] p-4 rounded-xl items-center w-full'>
            <div className='bg-white h-10 w-10 rounded-xl'>
                <img src={song.thumbnails[0]?.url} alt='playlist' className='rounded-xl' />
            </div>
            <div className='flex flex-col'>
                <h1 className=''>
                    {song?.name?.length > 10 ? song.name.split(" ").slice(0, 3).join(" ") : song.name}
                </h1>
                <p className='text-[#898989]'>
                    {song?.artist?.length > 10 ? song.artist.split(" ").slice(0, 3).join(" ") : song.artist}
                </p>
            </div>
        </div>
    )
}

export default PlaylistHome
