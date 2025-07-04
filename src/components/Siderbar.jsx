import React from 'react'
import { Home, Library, User, Download } from "lucide-react"
import { useNavigate } from 'react-router-dom'

const Sidebar = ({ onClose }) => {
    const navigate = useNavigate()


    return (
        <>
            <div className='hidden md:flex h-screen fixed top-0 left-0 bg-black flex-col text-white p-6 pt-20 gap-8 mt-15 mx-5'>
                <DesktopMenu
                    menuTitle="trending"
                    items={[
                        { icon: <Home size={20} />, title: 'Song', link: 'song' },
                        { icon: <Home size={20} />, title: 'Album', link: 'album' },
                        { icon: <Home size={20} />, title: 'Artist', link: 'artist' }
                    ]}
                    handleNavClick={() => navigate('/')}
                />

                <DesktopMenu
                    menuTitle="library"
                    items={[
                        { icon: <Library size={20} />, title: 'Songs', link: 'liked' },
                        { icon: <Library size={20} />, title: 'Playlist', link: 'playlist' },
                        { icon: <Library size={20} />, title: 'Album', link: 'album' },
                        { icon: <Library size={20} />, title: 'Downloads', link: 'downloads' }

                    ]}
                    handleNavClick={() => navigate('/library')}

                />

                <DesktopMenu
                    menuTitle="account"
                    items={[
                        { icon: <User size={20} />, title: 'Profile', link: 'profile' },
                        { icon: <User size={20} />, title: 'Settings', link: 'setting' },
                        { icon: <User size={20} />, title: 'History', link: 'history' },
                    ]}
                    handleNavClick={() => navigate('/profile')}
                />
            </div>

            <div className='md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around items-center h-20 z-50'>
                <NavItem
                    icon={<Home size={24} />}
                    label="Trending"
                    onClick={() => navigate('/')}
                />
                <NavItem
                    icon={<Library size={24} />}
                    label="Library"
                    onClick={() => navigate('/library/liked')}
                />
                <NavItem
                    icon={<Download size={24} />}
                    label="Downloads"
                    onClick={() => navigate('/library/downloads')}
                />
                <NavItem
                    icon={<User size={24} />}
                    label="Profile"
                    onClick={() => navigate('/account/profile')}
                />
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

const DesktopMenu = ({ menuTitle, items }) => {
    const navigate = useNavigate();
    return (
        <div className='space-y-4'>
            <h2 className='text-[#6e7273] text-lg font-semibold capitalize'>{menuTitle}</h2>
            <ul className='space-y-2'>
                {items.map((item) => (
                    <li
                        key={item.title}
                        onClick={() => navigate(`/${menuTitle}/${item.link}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleNavClick();
                            }
                        }}
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
