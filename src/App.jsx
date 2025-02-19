import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Search from './pages/Search'
import MusicPlayer from './components/MusicPlayer';
const App = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/search' element={<Search />} />
            </Routes>
            <MusicPlayer />
        </>
    )
}

export default App
