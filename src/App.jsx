import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MusicPlayer from './components/MusicPlayer';
const App = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<Home />} />
            </Routes>
            {/* <MusicPlayer /> */}
        </>
    )
}

export default App
