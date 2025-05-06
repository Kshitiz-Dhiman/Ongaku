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
                            <Route path='/' element={<TrendingHome />} />
                            <Route path='/album/:albumId' element={<Album />} />
                            <Route path='/artist/:artistId' element={<Artist />} />
                            <Route path='/login' element={<GoogleAuthWrapper />} />
                            <Route path='/dashboard' element={<SampleDashBoard />} />
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
