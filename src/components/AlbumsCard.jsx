import React from 'react'
import { useNavigate } from 'react-router-dom'
import { trimString } from '@/utils/utils'

const AlbumsCard = ({ key, album }) => {
    console.log(key + " " + album)
    const navigate = useNavigate();
    const openAlbum = () => {
        navigate(`/album/${album.id}`);
    }

    return (
        <div className="w-full max-w-sm">
            <div
                onClick={openAlbum}
                key={key}
                className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 transition-colors duration-200 rounded-xl hover:bg-[#262626] cursor-pointer bg-[#202020]"
            >
                <div className="relative group">
                    <img
                        className="w-15 h-15 sm:w-15 sm:h-15 rounded-xl object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                        src={album.image.large}
                        alt={album.title}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-bold text-white truncate">
                        {trimString(album.title, window.innerWidth < 640 ? 30 : 50)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AlbumsCard
