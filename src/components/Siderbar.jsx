import React from 'react'
import { Home, Library, User } from "lucide-react"
import { useNavigate } from 'react-router-dom'
const Sidebar = ({ onClose }) => {
    const navigate = useNavigate()
    const handleNavClick = () => {
        if (onClose) onClose();
    }

    return (
        <>
            <div className='hidden md:flex h-screen fixed top-0 left-0 bg-black flex-col text-white p-6 pt-20 gap-8 mt-15 mx-5'>
                {DesktopMenu('Trending', [
                    { icon: <Home size={20} />, title: 'Song' },
                    { icon: <Home size={20} />, title: 'Album' },
                    { icon: <Home size={20} />, title: 'Artist' }
                ], handleNavClick)}

                {DesktopMenu('Library', [
                    { icon: <Home size={20} />, title: 'Songs' },
                    { icon: <Home size={20} />, title: 'Playlist' },
                    { icon: <Home size={20} />, title: 'Album' }
                ])}

                {DesktopMenu('Account', [
                    { icon: <Home size={20} />, title: 'Profile' },
                    { icon: <Home size={20} />, title: 'Settings' },
                    { icon: <Home size={20} />, title: 'Logout' }
                ])}
            </div>

            {/* Mobile Android-style Navigation Bar */}
            <div className='md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around items-center h-20 z-50'>
                <NavItem icon={<Home size={24} />} label="Trending" onClick={() => {
                    navigate('/')
                }} />
                <NavItem icon={<Library size={24} />} label="Library" onClick={() => {
                    navigate('/library')
                }} />
                <NavItem icon={<User size={24} />} label="Profile" onClick={handleNavClick} />
            </div>
        </>
    )
}

const NavItem = ({ icon, label, onClick }) => {
    return (
        <button
            onClick={onClick}
            className='flex flex-col items-center justify-center w-1/3 py-2 text-gray-400 hover:text-white focus:text-white transition-colors'
        >
            {icon}
            <span className='text-xs mt-1'>{label}</span>
        </button>
    )
}

function DesktopMenu(menuTitle, items, handleNavClick) {
    return (
        <div className='space-y-4'>
            <h2 className='text-[#6e7273] text-lg font-semibold'>{menuTitle}</h2>
            <ul className='space-y-2'>
                {items.map((item) => (
                    <li
                        key={item.title}
                        onClick={handleNavClick}
                        onKeyUp={() => console.log("Item Clicked")}
                        className='flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#262626] transition-colors duration-200 cursor-pointer'
                    >
                        {item.icon}
                        <span className='text-base font-medium'>{item.title}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Sidebar
