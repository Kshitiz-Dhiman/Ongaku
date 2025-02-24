import React from 'react'
import { Home, ListMusic, Album } from "lucide-react"
import Divider from './Divider'
import { Music } from "lucide-react"
const Sidebar = () => {
    return (
        <div className='opacity-0 h-screen fixed top-0 left-0 font-bold w-full md:w-1/5 bg-[#0c1214] items-start flex flex-col text-white p-10 gap-10'>
            <div className='flex items-center justify-center gap-2'>
                <Music size={34} color='#f2371d' strokeWidth={4} className='mt-2' />
                <h1 className='text-3xl font-bold'>winamp</h1>
            </div>
            {Menu('Main', [
                { icon: <Home size={20} />, title: 'Home' },
                { icon: <ListMusic size={20} />, title: 'Explore' },
                { icon: <Album size={20} />, title: 'Top Charts' }
            ])}
            {/* <Divider className="my-5 mx-5" /> */}

            {Menu('Library', [
                { icon: <Home size={20} />, title: 'Songs' },
                { icon: <ListMusic size={20} />, title: 'Playlist' },
                { icon: <Album size={20} />, title: 'Album' }
            ])}
        </div>
    )
}

function Menu(menuTitle, items) {
    return (
        <div>
            <h1 className='text-[#6e7273] text-xl mb-6 '>{menuTitle}</h1>
            <ul className='text-xl flex flex-col gap-4 tracking-widest'>
                {items.map(item => (
                    <li className='flex items-center gap-2 hover:bg-[#262626] cursor-pointer px-5 py-2 rounded-2xl'>{item.icon}{item.title}</li>
                ))}
            </ul>
        </div>
    )
}

export default Sidebar
