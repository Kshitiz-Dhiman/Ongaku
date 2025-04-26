import  {useEffect , useContext} from 'react'
import { Routes, Route } from 'react-router-dom'
import Album from './components/Album'
import MusicPlayer from './components/MusicPlayer'
import Navbar from './components/NavBar'
import Sidebar from './components/Siderbar'
import TrendingHome from './components/TrendingHome'
import Artist from './components/Artist'

const App = () => {
    return (
        <div className='flex flex-col min-h-screen bg-black text-white'>
            <Navbar />
            <div className="flex flex-1 relative">
                <Sidebar />
                <main className="flex-1 md:ml-[12%]">
                    <Routes>
                        <Route path='/' element={<TrendingHome />} />
                        <Route path='/album/:albumId' element={<Album />} />
                        <Route path='/artist/:artistId' element={<Artist />} />
                    </Routes>
                </main>
            </div>
            <MusicPlayer />
        </div>
    )
}

export default App
