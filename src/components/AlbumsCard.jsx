import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { trimString } from '@/utils/utils'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
const AlbumsCard = ({ key, album }) => {
    const navigate = useNavigate();
    const openAlbum = () => {
        navigate(`/album/${album.id}`);
    }

    const albumRef = useRef(null);
    gsap.registerPlugin(useGSAP);

    useGSAP(() => {
        gsap.from(albumRef.current, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            y: 20,
        });
    }, [])


    return (
        <div ref={albumRef} className="w-full max-w-sm">
            <div
                onClick={openAlbum}
                key={key}
                className="flex items-center gap-2 sm:gap-4  transition-colors duration-200 rounded-xl hover:bg-[#262626] cursor-pointer bg-[#151515]"
            >
                <div className="relative group">
                    <img
                        className="w-17 h-17 rounded-xl object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
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
