import React from 'react'

const MadeForYou = ({ key, album }) => {
    // console.log(album)
    return (
        <div key={key} className='flex gap-3  rounded-xl w-[200px]  flex-col'>
            <div className='w-36 h-36 rounded-xl '>
                <img src={album.thumbnails[3].url} alt="" />
            </div>
            <div>
                <h1 className='text-base font-bold'>{album.name.length > 6 ? album.name.split(" ", 3).join() : album.name}</h1>
                <p className='text-[#898989] text-sm'>{album.artist.length > 6 ? album.artist.split(" ", 3).join() : album.artist}</p>
            </div>
        </div>
    )
}

export default MadeForYou
