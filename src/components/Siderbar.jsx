import React from 'react'
import { Home, ListMusic, Album } from "lucide-react"

const Sidebar = ({ onClose }) => {
    const AlbumCLose = () => {
        onClose()
    }
    return (
        <div className='hidden md:flex h-screen fixed top-0 left-0 w-1/6 bg-black flex-col text-white p-6 pt-20 gap-8 mt-10'>

            {Menu('Trending', [
                { icon: <Home size={20} />, title: 'Song' },
                { icon: <ListMusic size={20} />, title: 'Album' },
                { icon: <Album size={20} />, title: 'Artist' }
            ], AlbumCLose)}


            {Menu('Library', [
                { icon: <Home size={20} />, title: 'Songs' },
                { icon: <ListMusic size={20} />, title: 'Playlist' },
                { icon: <Album size={20} />, title: 'Album' }
            ])}
            {Menu('Account', [
                { icon: <Home size={20} />, title: 'Profile' },
                { icon: <ListMusic size={20} />, title: 'Settings' },
                { icon: <Album size={20} />, title: 'Logout' }
            ])}
        </div>
    )
}

function Menu(menuTitle, items, AlbumCLose) {
    return (
        <div className='space-y-4'>
            <h2 className='text-[#6e7273] text-lg font-semibold'>{menuTitle}</h2>
            <ul className='space-y-2'>
                {items.map((item) => (
                    <li key={item.title} onClick={AlbumCLose} onKeyUp={() => console.log("Home CLicked")} className='flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#262626] transition-colors duration-200 cursor-pointer'>
                        {item.icon}
                        <span className='text-base font-medium'>{item.title}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Sidebar
