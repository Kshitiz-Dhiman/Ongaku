import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Album from './components/Album'
const App = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<Home />} />
            </Routes>
        </>
    )
}

export default App
