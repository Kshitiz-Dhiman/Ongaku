import { Routes, Route } from 'react-router-dom'
import Album from './components/Album'
import MusicPlayer from './components/MusicPlayer'
import Navbar from './components/NavBar'
import Sidebar from './components/Siderbar'
import TrendingHome from './components/TrendingHome'
import Artist from './components/Artist'
import SampleLogin from './pages/LoginBtn'
import SampleDashBoard from './pages/SampleDashBoard'
import ErrorPage from './pages/ErrorPage'
import { GoogleOAuthProvider } from '@react-oauth/google'
import LikedSong from './pages/LikedSong'
import Profile from './pages/Profile'
import History from './pages/History'
import isOnline from './pages/IsOnline';
import Downloads from './pages/Downloads'
const App = () => {


    const GoogleAuthWrapper = () => {
        return (
            <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                <SampleLogin />
            </GoogleOAuthProvider>
        )
    }



    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
            <div className='flex flex-col min-h-screen bg-black text-white'>
                <Navbar />
                <div className="flex flex-1 relative">
                    <Sidebar />
                    <main className="flex-1 md:ml-[12%]">
                        <Routes>
                            {/* To set element as entry point use this  */}
                            {/* <Route path='/' element={<Navigate to="/trending/default" replace />} /> */}
                            <Route path='/' element={<TrendingHome />} />
                            {/* <Route index element={<TrendingHome />} /> */}
                            <Route path='/trending/:trend' element={<TrendingHome />} />
                            <Route path='/album/:albumId' element={<Album />} />
                            <Route path='/artist/:artistId' element={<Artist />} />
                            <Route path='/login' element={<GoogleAuthWrapper />} />
                            <Route path='/dashboard' element={<SampleDashBoard />} />
                            <Route path='/library/:lib' element={<LikedSong />} />
                            <Route path='/account/:profile' element={<Profile />} />
                            <Route path='/account/history' element={<History />} />
                            <Route path='/downloads' element={<Downloads />} />
                            <Route path='*' element={<ErrorPage />} />
                        </Routes>
                    </main>
                </div>
                <MusicPlayer />
            </div>
        </GoogleOAuthProvider>
    )
}

export default App
